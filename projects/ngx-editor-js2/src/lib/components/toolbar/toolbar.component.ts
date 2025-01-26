import { Component, input, output } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { BlockOptionAction } from '../../services/editor-js.service';
import { ToolbarBlockOptionsComponent } from './toolbar-block-options.component';

@Component({
  selector: 'toolbar',
  imports: [MatRipple, OverlayModule, ToolbarBlockOptionsComponent],
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

    <ng-template
      cdkConnectedOverlay
      (overlayOutsideClick)="openBlocksOption = false"
      [cdkConnectedOverlayOrigin]="blockOptionListTigger"
      [cdkConnectedOverlayOpen]="openBlocksOption"
      [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayOffsetX]="-49"
      [cdkConnectedOverlayOffsetY]="15"
      [cdkConnectedOverlayBackdropClass]="'cdk-overlay-transparent-backdrop'"
    >
      <toolbar-block-options
        [blockOptionActions]="blockOptionActions()"
        (handleBlockOptionAction)="handleBlockOptionAction($event)"
        (adjustBlockPosition)="adjustBlockPosition($event)"
      ></toolbar-block-options>
    </ng-template>
  `,
  styles: [
    `
      :host {
        position: absolute;
        margin-left: -80px;
        .toolbar-buttons-container {
          position: relative;
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
  blockOptionActions = input<BlockOptionAction[]>();
  handleBlockOptionActionEmitter = output<string>();

  openBlocksOption = false;

  openBlocksList() {
    console.log('openBlocksList');
  }

  openBlockOptionList() {
    this.openBlocksOption = !this.openBlocksOption;
  }

  handleBlockOptionAction(action: string) {
    this.handleBlockOptionActionEmitter.emit(action);
  }

  adjustBlockPosition(action: string) {
    console.log('adjustBlockPosition', action);
  }
}
