import { Component, inject } from '@angular/core';
import { EditorJsComponent } from './components/editor-js.component';
import { MatButton } from '@angular/material/button';
import { EditorJsService } from './services/editor-js.service';
import { HeaderBlockComponent } from './components/header-block.component';

@Component({
  selector: 'ngx-editor-js2',
  imports: [EditorJsComponent, MatButton],
  template: `
    <button mat-button (click)="addFormControlComponent()">
      Add Form Control Component
    </button>
    <editor-js></editor-js>
  `,
})
export class NgxEditorJs2Component {
  editorJsService = inject(EditorJsService);
  addFormControlComponent() {
    this.editorJsService.addFormControlComponent(HeaderBlockComponent);
  }
}
