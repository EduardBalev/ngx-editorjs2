import { Component, input } from '@angular/core';
import { ControlAccessorDirective } from '../../directives/control-accessor.directive';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { ToolFabDirective } from '../../directives/tool-fab.directive';
import { BlockComponent, BlockOptionAction } from '../../ngx-editor-js2.interface';

@Component({
  selector: 'paragraph-block',
  host: { class: 'position-relative' },
  imports: [
    ReactiveFormsModule,
    ControlAccessorDirective,
    AutofocusDirective,
    ToolFabDirective,
  ],
  template: `
    <ng-container [formGroup]="formGroup()">
      <p
        controlAccessor
        contentEditable
        toolFab
        [defaultValue]="formGroup().get(formControlName())?.value"
        [actionCallback]="actionCallback"
        [autofocus]="autofocus()"
        [blockOptionActions]="blockOptionActions()"
        [formControlName]="formControlName()"
        [componentContextPositionIndex]="sortIndex()"
      ></p>
    </ng-container>
  `,
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

  actionCallback() {
    console.log('In da Component!');
  }
}
