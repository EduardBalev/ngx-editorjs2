import { Component, input, signal, Type } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { ToolbarBlockOptionsComponent } from './toolbar-block-options.component';
import { ToolbarBlocksComponent } from './toolbar-blocks.component';
import { firstValueFrom } from 'rxjs';
import {
  BlockComponent,
  BlockOptionAction,
  MovePositionActions,
  SupportedBlock,
  TAddBlockCallback,
  TMoveBlockPositionCallback,
} from '../../ngx-editor-js2.interface';

@Component({
  selector: 'toolbar',
  imports: [
    CdkDragHandle,
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
        #blockOptionListTigger="cdkOverlayOrigin"
        cdkDragHandle
        cdkOverlayOrigin
        matRipple
        (click)="openBlockOptionList()"
      >
        <span class="material-icons">drag_indicator</span>
      </div>
    </div>

    <!-- Block type search list -->
    <ng-template
      cdkConnectedOverlay
      (overlayOutsideClick)="openBlocks.set(false)"
      [cdkConnectedOverlayOrigin]="blockListTigger"
      [cdkConnectedOverlayOpen]="openBlocks()"
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
      (overlayOutsideClick)="openBlocksOption.set(false)"
      [cdkConnectedOverlayOrigin]="blockOptionListTigger"
      [cdkConnectedOverlayOpen]="openBlocksOption()"
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
      @media (min-width: 768px) {
        :host {
          position: absolute;
          margin-left: -80px;
          top: 0;
        }
      }
    `,
  ],
})
export class ToolbarComponent {
  componentContextPositionIndex = input.required<number>();
  supportedBlocks = input.required<SupportedBlock[]>();
  blockOptionActions = input<BlockOptionAction[]>();
  actionCallback = input<(action: string) => void>(() => () => {});
  formControlName = input<string>();
  addBlockCallback = input.required<TAddBlockCallback>();
  moveBlockPositionCallback = input.required<TMoveBlockPositionCallback>();

  openBlocks = signal<boolean>(false);
  openBlocksOption = signal<boolean>(false);

  openBlocksList() {
    this.openBlocks.update((prev) => !prev);
  }

  openBlockOptionList() {
    this.openBlocksOption.update((prev) => !prev);
  }

  moveBlockPosition(action: MovePositionActions) {
    this.closeLists();
    this.moveBlockPositionCallback()(
      action,
      this.componentContextPositionIndex()
    );
  }

  handleAction(action: string) {
    this.closeLists();
    this.actionCallback()(action);
  }

  addBlock(block: Type<BlockComponent>) {
    this.closeLists();
    firstValueFrom(
      this.addBlockCallback()(block, this.componentContextPositionIndex())
    );
  }

  closeLists() {
    this.openBlocks.set(false);
    this.openBlocksOption.set(false);
  }
}
