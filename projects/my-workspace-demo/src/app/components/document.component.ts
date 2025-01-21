import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgxEditorJs2Component } from 'ngx-editor-js2';

@Component({
  selector: 'app-document',
  imports: [MatCard, MatCardContent, NgxEditorJs2Component],
  template: `
    <mat-card appearance="outlined">
      <mat-card-content>
        <ngx-editor-js2></ngx-editor-js2>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        @include mat.card-overrides(
          (
            outlined-outline-width: .5px,
            outlined-container-color: var(--mat-sys-surface-container-low),
            outlined-outline-color: var(--mat-sys-on-surface),
          )
        );
      }
    `,
  ],
})
export class DocumentComponent {}
