import {
  Component,
  effect,
  inject,
  input,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  EditorJsService,
  NgxEditorJsBlock,
} from '../services/editor-js.service';
import { NgxEditorJs2Service } from '../services/ngx-editor-js2.service';

@Component({
  selector: 'editor-js',
  template: ` <ng-container #ngxEditor></ng-container> `,
})
export class EditorJsComponent {
  editorJsService = inject(EditorJsService);
  ngxEditorJs2Service = inject(NgxEditorJs2Service);
  
  bootstrapEditorJs = input();
  blocks = input.required<NgxEditorJsBlock[]>();
  ngxEditor = viewChild.required('ngxEditor', { read: ViewContainerRef });

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
      this.ngxEditorJs2Service.blocksToLoad.next(this.blocks());
    });
  }
}
