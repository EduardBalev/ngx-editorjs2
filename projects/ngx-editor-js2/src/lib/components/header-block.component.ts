import { Component } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";


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