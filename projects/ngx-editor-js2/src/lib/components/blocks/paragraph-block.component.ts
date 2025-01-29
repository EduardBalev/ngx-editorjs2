import { Component, input } from '@angular/core';
import {
  BlockComponent,
  BlockOptionAction,
} from '../../services/editor-js.service';
import { ControlAccessorDirective } from '../../directives/control-accessor.directive';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { ToolFabDirective } from '../../directives/tool-fab.directive';

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
        [actionCallback]="actionCallback"
        [autofocus]="autofocus()"
        [blockOptionActions]="blockOptionActions()"
        [formControlName]="formControlName()"
      ></p>
    </ng-container>
  `,
})
export class ParagraphBlockComponent implements BlockComponent {
  autofocus = input<boolean>(false);
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
