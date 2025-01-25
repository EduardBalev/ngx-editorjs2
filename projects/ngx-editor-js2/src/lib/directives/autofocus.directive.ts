import {
  AfterContentInit,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';

@Directive({
  selector: '[autofocus]',
})
export class AutofocusDirective implements AfterContentInit {
  elementRef = inject(ElementRef);

  autofocus = input<boolean>(false);

  ngAfterContentInit() {
    this.autofocus() && this.elementRef.nativeElement.focus?.();
  }
}
