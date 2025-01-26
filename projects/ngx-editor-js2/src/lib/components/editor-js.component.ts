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
  template: ` <ng-container #ngxEditor></ng-container> `,
})
export class EditorJsComponent {
  ngxEditor = viewChild.required('ngxEditor', { read: ViewContainerRef });
  editorJsService = inject(EditorJsService);

  // * JUST DEBUGGING
  // ngOnInit() {
  //   this.editorJsService.formGroup.valueChanges.subscribe((value) => {
  //     console.log('[formGroup.value] : ', value);
  //   });

  //   this.editorJsService.blockComponents$.subscribe((components) => {
  //     console.log('[components] : ', components);
  //   });
  // }

  constructor() {
    effect(() => {
      this.editorJsService.setNgxEditor(this.ngxEditor());
    });
  }
}
