import {
  Component,
  effect,
  inject,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EditorJsService } from '../services/editor-js.service';

@Component({
  selector: 'editor-js',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="editorJsService.formGroup">
      <ng-container #ngxEditor></ng-container>
    </form>
  `,
})
export class EditorJsComponent {
  ngxEditor = viewChild.required('ngxEditor', { read: ViewContainerRef });
  editorJsService = inject(EditorJsService);

  // ! This needs a better pattern for setting the ngxEditor
  constructor() {
    effect(() => {
      this.editorJsService.setNgxEditor(this.ngxEditor());
    });
  }
}
