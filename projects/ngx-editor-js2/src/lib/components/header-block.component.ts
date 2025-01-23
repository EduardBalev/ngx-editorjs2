import { Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BlockComponent } from '../services/editor-js.service';

@Component({
  selector: 'header-block',
  template: ` <h1 contentEditable>Header Block</h1> `,
})
export class HeaderBlockComponent
  implements ControlValueAccessor, BlockComponent
{
  @Input() formControlName!: string;

  writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
  setDisabledState?(_isDisabled: boolean): void {}
}
