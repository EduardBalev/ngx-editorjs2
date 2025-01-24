import {
  Component,
  HostListener,
  inject,
  Input,
  ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BlockComponent } from '../services/editor-js.service';
import { ToolbarComponent } from './toolbar.component';

@Component({
  selector: 'header-block',
  template: ` <h1 contentEditable>Header Block</h1> `,
})
export class HeaderBlockComponent
  implements ControlValueAccessor, BlockComponent
{
  @Input() formControlName!: string;

  // ! Abstract everything below
  viewContainerRef = inject(ViewContainerRef);
  @HostListener('mouseenter') onMouseEnter() {
    this.viewContainerRef.createComponent(ToolbarComponent);
  }

  writeValue(_obj: any): void {}
  registerOnChange(_fn: any): void {}
  registerOnTouched(_fn: any): void {}
  setDisabledState?(_isDisabled: boolean): void {}
}
