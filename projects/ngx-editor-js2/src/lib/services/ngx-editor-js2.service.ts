import { inject, Injectable } from '@angular/core';
import { HeaderBlockComponent } from '../components/blocks/header-block.component';
import { ParagraphBlockComponent } from '../components/blocks/paragraph-block.component';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';
import { EditorJsService } from './editor-js.service';
import {
  NGX_EDITORJS_OPTIONS,
  NgxEditorJsBlock,
  SupportedBlock,
} from '../ngx-editor-js2.interface';

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
    filter((blocks) => blocks.length > 0),
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
        blocks.map((block) => this.editorJsService.addBlockComponent(block))
      )
    )
  );
}
