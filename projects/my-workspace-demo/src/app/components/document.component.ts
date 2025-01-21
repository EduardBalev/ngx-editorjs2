import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MyLibComponent } from 'my-lib';

@Component({
  selector: 'app-document',
  imports: [MatCard, MatCardContent, MyLibComponent],
  template: `
    <mat-card appearance="outlined">
      <mat-card-content>
        <lib-my-lib></lib-my-lib>
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
