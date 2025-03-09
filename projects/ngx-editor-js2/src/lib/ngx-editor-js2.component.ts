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
import { NgxEditorJsBlock } from './ngx-editor-js2.interface';
import { ToolbarInlineService } from './services/toolbar-inline.service';
import { EditorJsService } from './services/editor-js.service';
import { NgxEditorJs2Service } from './services/ngx-editor-js2.service';

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
  inlineToolbarSerivce = inject(ToolbarInlineService);
  editorJsService = inject(EditorJsService);
  ngxEditorJs2Service = inject(NgxEditorJs2Service);

  blocks = input<NgxEditorJsBlock[]>([]);
  blocksRequested = output<Observable<NgxEditorJsBlock[]>>();
  requestBlocks = input.required({
    transform: (value: unknown) =>
      value && this.blocksRequested.emit(this.editorJsService.getBlocks$()),
  });

  bootstrapEditorJs$ = combineLatest([
    inject(ToolFabService).toolbarComponentRef$,
    this.ngxEditorJs2Service.loadBlocks$,
    fromEvent(document, 'selectionchange').pipe(
      debounceTime(200),
      switchMap((event) =>
        this.inlineToolbarSerivce.determineToDisplayInlineToolbarBlock(event)
      )
    )
  ]);
}
