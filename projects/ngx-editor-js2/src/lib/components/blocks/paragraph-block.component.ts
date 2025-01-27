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
  imports: [
    ReactiveFormsModule,
    ControlAccessorDirective,
    AutofocusDirective,
    ToolFabDirective,
  ],
  template: `
    <ng-container [formGroup]="formGroup()">
      <p
        toolFab
        contentEditable
        appControlAccessor
        [autofocus]="true"
        [actionCallback]="actionCallback"
        [blockOptionActions]="blockOptionActions()"
        [formControlName]="formControlName()"
      ></p>
    </ng-container>
  `,
  styles: [
    `
      :host {
        position: relative;
      }
    `,
  ],
})
export class ParagraphBlockComponent implements BlockComponent {
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
