import { inject, Injectable, Type, ViewContainerRef } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  lastValueFrom,
  map,
  switchMap,
} from 'rxjs';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { EditorJsService } from './editor-js.service';
import { NgxEditorJs2Service } from './ngx-editor-js2.service';
import {
  BlockOptionAction,
  BlockComponent,
  MovePositionActions,
} from '../ngx-editor-js2.interface';

type ComponentContext = {
  index: number;
  viewContainerRef: ViewContainerRef;
  blockOptionActions: BlockOptionAction[];
  actionCallback: (v: string) => void;
} | null;

@Injectable({
  providedIn: 'root',
})
export class ToolFabService {
  ngxEditorJs2Service = inject(NgxEditorJs2Service);
  editorJsService = inject(EditorJsService);
  // I need to explain this in detail so the future me can understand this.
  componentContext = new BehaviorSubject<ComponentContext>(null);
  toolbarComponentRef$ = combineLatest({
    componentContext: this.componentContext.asObservable(),
    supportedBlocks: this.ngxEditorJs2Service.supportedBlocks$,
  }).pipe(
    filter(({ componentContext }) => componentContext !== null),
    distinctUntilChanged(
      ({ componentContext: previous }, { componentContext: current }) =>
        previous!.index !== current!.index ||
        previous!.viewContainerRef !== current!.viewContainerRef
          ? (previous!.viewContainerRef.clear(), false)
          : true
    ),
    map(({ componentContext, supportedBlocks }) => {
      const { index, viewContainerRef, blockOptionActions, actionCallback } =
        componentContext!;
      // TODO We will need to create a ToolbarBottomRailComponent to handle the mobile view
      const componentRef = viewContainerRef.createComponent(ToolbarComponent);
      componentRef.setInput('componentContextPositionIndex', index + 1);
      componentRef.setInput('supportedBlocks', supportedBlocks);
      componentRef.setInput('blockOptionActions', blockOptionActions);
      componentRef.setInput('actionCallback', actionCallback);
      componentRef.setInput('addBlockCallback', this.addBlock.bind(this));
      componentRef.setInput(
        'moveBlockPositionCallback',
        this.movePositionAction.bind(this)
      );
      return componentRef;
    })
  );

  addBlock(block: Type<BlockComponent>, index: number) {
    return this.editorJsService
      .createNgxEditorJsBlockWithComponent(block, index)
      .pipe(
        switchMap((block) => this.editorJsService.addBlockComponent(block))
      );
  }

  movePositionAction(action: MovePositionActions, index: number) {
    return lastValueFrom(
      this.editorJsService.determineMovePositionAction(action, index)
    );
  }
}
