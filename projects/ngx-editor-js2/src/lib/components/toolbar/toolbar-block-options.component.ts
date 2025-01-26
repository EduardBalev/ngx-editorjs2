import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AdjustBlockPositionActions,
  BlockOptionAction,
} from '../../services/editor-js.service';
import { MatIcon } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { MatRipple } from '@angular/material/core';

@Component({
  selector: 'toolbar-block-options',
  imports: [MatIcon, MatRipple, NgForOf, NgIf],
  template: `
    <div class="toolbar-block-options-container mat-elevation-z8">
      <div class="toolbar-block-options-panel">
        <div
          class="block-option-list-item"
          matRipple
          (click)="adjustBlockPosition(AdjustBlockPositionActions.UP)"
        >
          <mat-icon>arrow_upward</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="adjustBlockPosition(AdjustBlockPositionActions.DELETE)"
        >
          <mat-icon>delete</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="adjustBlockPosition(AdjustBlockPositionActions.DOWN)"
        >
          <mat-icon>arrow_downward</mat-icon>
        </div>
        @for(blockOptionAction of blockOptionActions; track $index) {
        <div
          class="block-option-list-item"
          (click)="handleBlockOptionAction(blockOptionAction.action)"
          matRipple
        >
          @if (blockOptionAction.icon) {
          <mat-icon>{{ blockOptionAction.icon }}</mat-icon>
          } 
          
          @if (blockOptionAction.text) {
          <span class="block-option-list-item-text">
            {{ blockOptionAction.text }}
          </span>
          }
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .toolbar-block-options-container {
        border-radius: 4px;
      }

      .toolbar-block-options-panel {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1px;
        width: 128px;
        max-height: 128px;
        border-radius: 4px;
        overflow: auto;
        background: var(--mat-sys-tertiary-container);
      }

      .block-option-list-item {
        cursor: pointer;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;

        color: var(--mat-sys-on-tertiary-container);
        background: var(--mat-sys-tertiary-container);
        &:hover,
        &:focus {
          background: var(--mat-sys-surface-bright);
        }
      }

      .block-option-list-item-text {
        font-size: 16px;
      }

      .block-option-list-item-text {
        user-select: none;
      }
    `,
  ],
})
export class ToolbarBlockOptionsComponent {
  @Input() blockOptionActions: BlockOptionAction[] | undefined;
  @Output('handleBlockOptionAction') handleBlockOptionActionEmitter =
    new EventEmitter();

  readonly AdjustBlockPositionActions = AdjustBlockPositionActions;
  @Output('adjustBlockPosition') adjustBlockPositionEmitter =
    new EventEmitter();

  adjustBlockPosition(action: AdjustBlockPositionActions) {
    this.adjustBlockPositionEmitter.emit(action);
  }

  handleBlockOptionAction(action: string) {
    this.handleBlockOptionActionEmitter.emit(action);
  }
}
