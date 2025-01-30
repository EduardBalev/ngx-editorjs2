import {
  Component,
  effect,
  inject,
  input,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  EditorJsService,
  NgxEditorJsBlock,
} from '../services/editor-js.service';
import { NgxEditorJs2Service } from '../services/ngx-editor-js2.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToolFabService } from '../services/tool-fab.service';

@Component({
  selector: 'editor-js',
  imports: [ReactiveFormsModule],
  template: ` <ng-container #ngxEditor></ng-container> `,
})
export class EditorJsComponent {
  toolFabService = inject(ToolFabService);
  editorJsService = inject(EditorJsService);
  ngxEditorJs2Service = inject(NgxEditorJs2Service);

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
    this.ngxEditorJs2Service.loadBlocks$.pipe(takeUntilDestroyed()).subscribe();
    this.toolFabService.toolbarComponentRef$
      .pipe(takeUntilDestroyed())
      .subscribe(); // 1st and only subscription?
    effect(() => {
      this.editorJsService.setNgxEditor(this.ngxEditor());
      this.ngxEditorJs2Service.blocksToLoad.next(this.blocks());
    });
  }
}
