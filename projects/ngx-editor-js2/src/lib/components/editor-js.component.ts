import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'editor-js',
  imports: [MatButton, ReactiveFormsModule],
  template: `
    <button mat-button (click)="addFormControlComponent()">
      Add Form Control Component
    </button>
    <form [formGroup]="formGroup">
      <ng-container #ngxEditor></ng-container>
    </form>
  `,
  styles: [],
})
export class EditorJsComponent {
  @ViewChild('ngxEditor', { read: ViewContainerRef, static: true })
  ngxEditor!: ViewContainerRef;

  formBuilder = inject(FormBuilder);
  formGroup = this.formBuilder.group({});

  addFormControlComponent() {
    this.formGroup.addControl('test', this.formBuilder.control(''));
    this.ngxEditor.createComponent(HeaderBlockComponent, { index: 0 });
  }
}

@Component({
  selector: 'header-block',
  template: ` <h1 contentEditable>Header Block</h1> `,
})
export class HeaderBlockComponent implements ControlValueAccessor {
  writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
  setDisabledState?(_isDisabled: boolean): void {}
}
