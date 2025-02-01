import { Component, input, signal } from '@angular/core';
import { ControlAccessorDirective } from '../../directives/control-accessor.directive';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { ToolFabDirective } from '../../directives/tool-fab.directive';
import { BlockComponent, BlockOptionAction } from '../../ngx-editor-js2.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'paragraph-block',
  host: { class: 'position-relative' },
  imports: [
    ReactiveFormsModule,
    ControlAccessorDirective,
    AutofocusDirective,
    ToolFabDirective,
    NgClass
  ],
  template: `
    <ng-container [formGroup]="formGroup()">
      <p
        controlAccessor
        contentEditable
        toolFab
        [ngClass]="className()"
        [defaultValue]="formGroup().get(formControlName())?.value"
        [actionCallback]="actionCallback.bind(this)"
        [autofocus]="autofocus()"
        [blockOptionActions]="blockOptionActions()"
        [formControlName]="formControlName()"
        [componentContextPositionIndex]="sortIndex()"
      ></p>
    </ng-container>
  `,
  styles: [
    `
      :host {
        .small {
          font: var(--mat-sys-body-small)
        }
        .medium {
          font: var(--mat-sys-body-medium)
          
        }
        .large {
          font: var(--mat-sys-body-large)
        }
      }
    `,
  ],
})
export class ParagraphBlockComponent implements BlockComponent {
  sortIndex = input<number>(0);
  autofocus = input<boolean>(true);
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  blockOptionActions = input<BlockOptionAction[]>([
    { action: 'small', icon: 'density_small' },
    { action: 'medium', icon: 'density_medium' },
    { action: 'large', icon: 'density_large' },
  ]);

  className = signal<string>('medium');
  actionCallback(action: string) {
    this.className.update(() => action);
  }
}
