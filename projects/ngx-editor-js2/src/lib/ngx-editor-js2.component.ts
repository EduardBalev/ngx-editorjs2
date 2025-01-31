import { Component, inject, input } from '@angular/core';
import { EditorJsComponent } from './components/editor-js.component';
import { AsyncPipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { ToolFabService } from './services/tool-fab.service';
import { NgxEditorJs2Service } from './services/ngx-editor-js2.service';
import { NgxEditorJsBlock } from './ngx-editor-js2.interface';

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

  bootstrapEditorJs$ = combineLatest([
    inject(NgxEditorJs2Service).loadBlocks$,
    inject(ToolFabService).toolbarComponentRef$,
  ]);
}
