import { inject, Injectable, InjectionToken } from '@angular/core';
import { HeaderBlockComponent } from '../components/blocks/header-block.component';
import { ParagraphBlockComponent } from '../components/blocks/paragraph-block.component';
import {
  BehaviorSubject,
  combineLatest,
  delay,
  exhaustMap,
  forkJoin,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { EditorJsService } from './editor-js.service';
import {
  NgxEditorjsOptions,
  NgxEditorJsBlock,
  NgxEditorJsBlockWithComponent,
  SupportedBlock,
} from '../ngx-editor-js2.interface';

export const NGX_EDITORJS_OPTIONS = new InjectionToken<NgxEditorjsOptions>(
  'NGX_EDITORJS_OPTIONS'
);

@Injectable({
  providedIn: 'root',
})
export class NgxEditorJs2Service {
  editorJsService = inject(EditorJsService);

  consumerSupportedBlocks = new BehaviorSubject<SupportedBlock[]>(
    inject(NGX_EDITORJS_OPTIONS, { optional: true })?.consumerSupportedBlocks ??
      []
  );

  internalSupportedBlocks = new BehaviorSubject<SupportedBlock[]>([
    {
      name: 'Paragraph',
      component: ParagraphBlockComponent,
      componentInstanceName: 'ParagraphBlockComponent',
    },
    {
      name: 'Header',
      component: HeaderBlockComponent,
      componentInstanceName: 'HeaderBlockComponent',
    },
  ]);

  supportedBlocks$ = combineLatest([
    this.internalSupportedBlocks.asObservable(),
    this.consumerSupportedBlocks.asObservable(),
  ]).pipe(map(([internal, consumer]) => [...internal, ...consumer]));

  blocksToLoad = new BehaviorSubject<NgxEditorJsBlock[]>([]);

  loadBlocks$ = this.blocksToLoad.asObservable().pipe(
    // distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    // The NgxEditorJs2Component loads the editor-js component after the blocks are loaded
    // So the ViewContainerRef is not available at the time of loading the blocks
    // Wait until next frame to load the blocks
    delay(0),
    exhaustMap((blocks) =>
      forkJoin([of(blocks), this.editorJsService.clearBlocks()])
    ),
    map(([blocks]) => (blocks.length > 0 ? blocks : this.loadDefaultBlocks())),
    // tap((blocks) => console.log('Blocks to load', blocks)),
    map((blocks) =>
      Array.from(
        new Map(blocks.map((block) => [block.blockId, block])).values()
      )
    ),
    map((blocks) => blocks.sort((a, b) => a.sortIndex - b.sortIndex)),
    switchMap((blocks) => combineLatest([of(blocks), this.supportedBlocks$])),
    map(([blocks, supportedBlocks]) => ({
      blocks,
      supportedBlocksMap: new Map(
        supportedBlocks.map((sb) => [sb.componentInstanceName, sb.component])
      ),
    })),
    map(({ blocks, supportedBlocksMap }) =>
      blocks.map((block) => ({
        ...block,
        component:
          supportedBlocksMap.get(block.componentInstanceName) ??
          HeaderBlockComponent,
      }))
    ),
    mergeMap((blocks) =>
      combineLatest(
        blocks.map((block: NgxEditorJsBlockWithComponent) =>
          this.editorJsService.addBlockComponent(block)
        )
      )
    )
  );

  loadDefaultBlocks() {
    return [
      {
        blockId: 'tmdjr',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: "Let's get started... 🚀",
        savedAction: 'h1',
      },
    ];
  }
}
