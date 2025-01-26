import { Component, input } from '@angular/core';
import { BlockComponent } from '../services/editor-js.service';
import { ControlAccessorDirective } from '../directives/control-accessor.directive';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutofocusDirective } from '../directives/autofocus.directive';
import { ToolFabDirective } from '../directives/tool-fab.directive';

@Component({
  selector: 'header-block',
  imports: [ReactiveFormsModule, ControlAccessorDirective, AutofocusDirective],
  hostDirectives: [ToolFabDirective],
  template: `
    <ng-container [formGroup]="formGroup()">
      <h1
        contentEditable
        appControlAccessor
        [autofocus]="true"
        [defaultValue]="'Hello World'"
        [formControlName]="formControlName()"
      ></h1>
    </ng-container>
  `,
})
export class HeaderBlockComponent implements BlockComponent {
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
}
