import { Component, input, output } from '@angular/core';
import {
  MovePositionActions,
  BlockOptionAction,
} from '../../services/editor-js.service';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';

@Component({
  selector: 'toolbar-block-options',
  imports: [MatIcon, MatRipple],
  template: `
    <div class="actions-panel mat-elevation-z24">
      <div class="action-btn" matRipple (click)="movePosition(Position.UP)">
        <mat-icon>arrow_upward</mat-icon>
      </div>
      <div class="action-btn" matRipple (click)="movePosition(Position.DELETE)">
        <mat-icon>delete</mat-icon>
      </div>
      <div class="action-btn" matRipple (click)="movePosition(Position.DOWN)">
        <mat-icon>arrow_downward</mat-icon>
      </div>
      @for(blockOptionAction of blockOptionActions(); track $index) {
      <div
        class="action-btn"
        (click)="handleAction(blockOptionAction.action)"
        matRipple
      >
        @if (blockOptionAction.text) {
        {{ blockOptionAction.text }}
        } @else {
        <mat-icon>{{ blockOptionAction.icon }}</mat-icon>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        .actions-panel {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 1px;
          width: 128px;
          max-height: 128px;
          border-radius: 4px;
          overflow: auto;
          background: var(--mat-sys-tertiary-container);
          .action-btn {
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
        }
      }
    `,
  ],
})
export class ToolbarBlockOptionsComponent {
  readonly Position = MovePositionActions;

  blockOptionActions = input<BlockOptionAction[]>();

  handleActionEmitter = output<string>({ alias: 'handleAction' });
  moveBlockPositionEmitter = output<MovePositionActions>({
    alias: 'moveBlockPosition',
  });

  movePosition(action: MovePositionActions) {
    this.moveBlockPositionEmitter.emit(action);
  }

  handleAction(action: string) {
    this.handleActionEmitter.emit(action);
  }
}
