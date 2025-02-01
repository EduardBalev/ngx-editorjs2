import { Component, input, signal } from '@angular/core';
import { ControlAccessorDirective } from '../../directives/control-accessor.directive';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { ToolFabDirective } from '../../directives/tool-fab.directive';
import { CleanPasteDataDirective } from '../../directives/clean-paste-data.directive';
import {
  BlockComponent,
  BlockOptionAction,
} from '../../ngx-editor-js2.interface';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'header-block',
  host: { class: 'position-relative block cdk-drag-animating' },
  hostDirectives: [CdkDrag],
  imports: [
    ReactiveFormsModule,
    ControlAccessorDirective,
    AutofocusDirective,
    ToolFabDirective,
    CleanPasteDataDirective,
    NgSwitch,
    NgSwitchCase,
  ],
  // TODO: Make this dynamic instead of repeating the same code for each header tag
  template: `
    <ng-container [formGroup]="formGroup()">
      <ng-container [ngSwitch]="selectedHeaderTag()">
        <h1
          *ngSwitchCase="'h1'"
          controlAccessor
          cleanPasteData
          contentEditable
          toolFab
          [defaultValue]="formGroup().get(formControlName())?.value"
          [actionCallback]="actionCallbackBind"
          [blockOptionActions]="blockOptionActions()"
          [autofocus]="autofocus()"
          [formControlName]="formControlName()"
          [componentContextPositionIndex]="sortIndex()"
        ></h1>
        <h2
          *ngSwitchCase="'h2'"
          controlAccessor
          cleanPasteData
          contentEditable
          toolFab
          [defaultValue]="formGroup().get(formControlName())?.value"
          [actionCallback]="actionCallbackBind"
          [blockOptionActions]="blockOptionActions()"
          [autofocus]="autofocus()"
          [formControlName]="formControlName()"
          [componentContextPositionIndex]="sortIndex()"
        ></h2>
        <h3
          *ngSwitchCase="'h3'"
          controlAccessor
          cleanPasteData
          contentEditable
          toolFab
          [defaultValue]="formGroup().get(formControlName())?.value"
          [actionCallback]="actionCallbackBind"
          [blockOptionActions]="blockOptionActions()"
          [autofocus]="autofocus()"
          [formControlName]="formControlName()"
          [componentContextPositionIndex]="sortIndex()"
        ></h3>
        <h4
          *ngSwitchCase="'h4'"
          controlAccessor
          cleanPasteData
          contentEditable
          toolFab
          [defaultValue]="formGroup().get(formControlName())?.value"
          [actionCallback]="actionCallbackBind"
          [blockOptionActions]="blockOptionActions()"
          [autofocus]="autofocus()"
          [formControlName]="formControlName()"
          [componentContextPositionIndex]="sortIndex()"
        ></h4>
        <h5
          *ngSwitchCase="'h5'"
          controlAccessor
          cleanPasteData
          contentEditable
          toolFab
          [defaultValue]="formGroup().get(formControlName())?.value"
          [actionCallback]="actionCallbackBind"
          [blockOptionActions]="blockOptionActions()"
          [autofocus]="autofocus()"
          [formControlName]="formControlName()"
          [componentContextPositionIndex]="sortIndex()"
        ></h5>
        <h6
          *ngSwitchCase="'h6'"
          controlAccessor
          cleanPasteData
          contentEditable
          toolFab
          [defaultValue]="formGroup().get(formControlName())?.value"
          [actionCallback]="actionCallbackBind"
          [blockOptionActions]="blockOptionActions()"
          [autofocus]="autofocus()"
          [formControlName]="formControlName()"
          [componentContextPositionIndex]="sortIndex()"
        ></h6>
      </ng-container>
    </ng-container>
  `,
})
export class HeaderBlockComponent implements BlockComponent {
  sortIndex = input<number>(0);
  autofocus = input<boolean>(true);
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  blockOptionActions = input<BlockOptionAction[]>([
    { action: 'h1', text: 'H1' },
    { action: 'h2', text: 'H2' },
    { action: 'h3', text: 'H3' },
    { action: 'h4', text: 'H4' },
    { action: 'h5', text: 'H5' },
    { action: 'h6', text: 'H6' },
  ]);

  selectedHeaderTag = signal<string>('h1');
  actionCallbackBind = this.actionCallback.bind(this)

  actionCallback(selectedAction: string) {
    this.selectedHeaderTag.set(selectedAction);
  }
}
