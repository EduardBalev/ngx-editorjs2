import { Component } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';

@Component({
  selector: 'toolbar',
  imports: [MatRipple, CdkOverlayOrigin],
  template: `
    <div class="toolbar-buttons-container">
      <div
        class="toolbar-buttons mat-elevation-z4"
        #blockListTigger="cdkOverlayOrigin"
        cdkOverlayOrigin
        matRipple
        (click)="openBlocksList()"
      >
        <span class="material-icons">add</span>
      </div>
      <div
        class="toolbar-buttons mat-elevation-z4"
        cdkOverlayOrigin
        #blockOptionListTigger="cdkOverlayOrigin"
        matRipple
        (click)="openBlockOptionList()"
      >
        <span class="material-icons">drag_indicator</span>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        position: absolute;
        margin-left: -95px;
        top: 0;
        .toolbar-buttons-container {
          display: flex;
          gap: 10px;
        }

        .toolbar-buttons {
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 4px;
          margin-bottom: 14px;
          user-select: none;
          color: var(--mat-sys-on-tertiary-container);
          background: var(--mat-sys-tertiary-container);
        }

        .toolbar-buttons {
          &:hover,
          &:focus {
            background: var(--mat-sys-surface-bright);
          }
        }
      }
    `,
  ],
})
export class ToolbarComponent {
  openBlocksList() {
    console.log('openBlocksList');
  }

  openBlockOptionList() {
    console.log('openBlockOptionList');
  }
}
