import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgxEditorJs2Component, NgxEditorJsBlock } from 'ngx-editor-js2';
import { AppService, TEST_DATA } from '../services/app.service';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-document',
  imports: [
    MatCard,
    MatCardContent,
    NgxEditorJs2Component,
    AsyncPipe,
    JsonPipe,
  ],
  template: `
    <h1>Select the text to NOT see the inline toolbar</h1>
    <pre><code>{{ appService.ngxEditorJsBlocks$ | async | json }}</code></pre>
    <mat-card appearance="outlined">
      <mat-card-content>
        <ngx-editor-js2
          [blocks]="TEST_DATA"
          [requestBlocks]="appService.requestBlocks$ | async"
          (blocksRequested)="appService.handleBlocks($event)"
        ></ngx-editor-js2>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        @include mat.card-overrides(
          (
            outlined-outline-width: 0.5px,
            outlined-container-color: var(--mat-sys-surface-container-low),
            outlined-outline-color: var(--mat-sys-on-surface),
          )
        );
      }
    `,
  ],
})
export class DocumentComponent {
  TEST_DATA = TEST_DATA;
  appService = inject(AppService);
}
