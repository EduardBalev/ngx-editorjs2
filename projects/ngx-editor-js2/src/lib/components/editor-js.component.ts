import {
  Component,
  effect,
  inject,
  input,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { EditorJsService } from '../services/editor-js.service';
import { NgxEditorJs2Service } from '../services/ngx-editor-js2.service';
import { NgxEditorJsBlock } from '../ngx-editor-js2.interface';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'editor-js',
  imports: [CdkDropList],
  template: `<div
    cdkDropList
    class="block-list"
    (cdkDropListDropped)="drop($event)"
  >
    <ng-container #ngxEditor></ng-container>
    <div></div>
  </div>`,
  styles: [
    `
      :host {
        display: block;
        .block-list {
          min-height: 60px;
        }
      }
    `,
  ],
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

  drop(event: CdkDragDrop<string[]>) {
    lastValueFrom(
      this.editorJsService.moveBlockComponentPosition(
        event.previousIndex,
        event.currentIndex
      )
    ).then(() => {
      // DRAG ANIMATION HOT FIX
      // Wait for Angular to update the DOM, then remove the animation class
      requestAnimationFrame(() => {
        document.querySelectorAll('.cdk-drag-animating').forEach((el) => {
          const element = el as HTMLElement;
          element.classList.remove('cdk-drag-animating'); // Ensure old class is removed
          void element.offsetWidth; // Force reflow
          element.classList.add('cdk-drag-animating'); // Re-add for next drag
        });
      });
    });
  }
}
