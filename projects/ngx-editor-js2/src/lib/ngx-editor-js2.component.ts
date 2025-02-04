import { Component, inject, input, output } from '@angular/core';
import { EditorJsComponent } from './components/editor-js.component';
import { AsyncPipe } from '@angular/common';
import {
  combineLatest,
  debounceTime,
  fromEvent,
  Observable,
  switchMap,
} from 'rxjs';
import { ToolFabService } from './services/tool-fab.service';
import { NgxEditorJs2Service } from './services/ngx-editor-js2.service';
import { NgxEditorJsBlock } from './ngx-editor-js2.interface';
import { ToolbarInlineService } from './services/toolbar-inline.service';
import { EditorJsService } from './services/editor-js.service';

@Component({
  selector: 'ngx-editor-js2',
  imports: [EditorJsComponent, AsyncPipe],
  template: `
    <editor-js
      [blocks]="blocks()"
      [bootstrapEditorJs]="bootstrapEditorJs$ | async"
    ></editor-js>
  `,
})
export class NgxEditorJs2Component {
  blocks = input<NgxEditorJsBlock[]>([]);

  blocksRequested = output<Observable<NgxEditorJsBlock[]>>();
  requestBlocks = input.required({
    transform: (_v: unknown) =>
      this.blocksRequested.emit(this.editorJsService.getBlocks$()),
  });

  inlineToolbarSerivce = inject(ToolbarInlineService);
  editorJsService = inject(EditorJsService);
  bootstrapEditorJs$ = combineLatest([
    inject(NgxEditorJs2Service).loadBlocks$,
    inject(ToolFabService).toolbarComponentRef$,
    fromEvent(document, 'selectionchange').pipe(
      debounceTime(200),
      switchMap((event) =>
        this.inlineToolbarSerivce.determineToDisplayInlineToolbarBlock(event)
      )
    ),
  ]);
}
