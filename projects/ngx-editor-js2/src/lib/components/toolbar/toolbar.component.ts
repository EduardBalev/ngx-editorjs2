import { Component, Input, input, output } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { BlockOptionAction } from '../../services/editor-js.service';
import { ToolbarBlockOptionsComponent } from './toolbar-block-options.component';
import { ToolbarBlocksComponent } from './toolbar-blocks.component';
import { ConsumerSupportedBlock } from '../../services/ngx-editor-js2.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'toolbar',
  imports: [
    MatRipple,
    OverlayModule,
    ToolbarBlockOptionsComponent,
    ToolbarBlocksComponent,
  ],
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

    <!-- Block type search list -->
    <ng-template
      cdkConnectedOverlay
      (overlayOutsideClick)="openBlocks = false"
      [cdkConnectedOverlayOrigin]="blockListTigger"
      [cdkConnectedOverlayOpen]="openBlocks"
      [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayOffsetY]="15"
      [cdkConnectedOverlayBackdropClass]="'cdk-overlay-transparent-backdrop'"
    >
      <toolbar-blocks
        [supportedBlocks]="supportedBlocks()"
        (addBlock)="addBlock($event)"
      ></toolbar-blocks>
    </ng-template>

    <!-- Options List-->
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
        (handleAction)="handleAction($event)"
        (moveBlockPosition)="moveBlockPosition($event)"
      ></toolbar-block-options>
    </ng-template>
  `,
  styles: [
    `
      :host {
        position: absolute;
        margin-left: -80px;
        top: 0;
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
  actionCallback = input.required<(action: string) => void>();
  supportedBlocks = input.required<ConsumerSupportedBlock[]>();

  // Keeping it simple open close logic
  openBlocks = false;
  openBlocksOption = false;

  openBlocksList() {
    this.openBlocks = !this.openBlocks;
  }

  openBlockOptionList() {
    this.openBlocksOption = !this.openBlocksOption;
  }

  handleAction(action: string) {
    this.actionCallback()(action);
  }

  moveBlockPosition(action: string) {
    console.log('adjustBlockPosition', action);
  }

  addBlock(block: any) {
    console.log('addBlock', block);
  }
}
