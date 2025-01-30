import { Component,input } from '@angular/core';
import { EditorJsComponent } from './components/editor-js.component';
import { NgxEditorJsBlock } from './services/editor-js.service';

@Component({
  selector: 'ngx-editor-js2',
  imports: [EditorJsComponent],
  template: `
      <editor-js [blocks]="blocks()"></editor-js>
  `,
})
export class NgxEditorJs2Component {
  blocks = input<NgxEditorJsBlock[]>([]);
}
