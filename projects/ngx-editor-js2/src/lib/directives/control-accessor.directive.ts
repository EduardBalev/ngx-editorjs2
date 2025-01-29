import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[controlAccessor]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ControlAccessorDirective),
      multi: true,
    },
  ],
})
export class ControlAccessorDirective implements ControlValueAccessor {
  elementRef = inject(ElementRef);

  defaultValue = input<string>();

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(): void {
    this.elementRef.nativeElement.innerText = this.defaultValue() || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  @HostListener('input')
  onInput(): void {
    this.onChange(this.elementRef.nativeElement.innerText);
  }
}
