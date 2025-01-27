import {
  Directive,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[cleanPasteData]',
})
export class CleanPasteDataDirective {
  @HostListener('paste', ['$event'])
  onPaste(event: Event) {
    event.preventDefault();
    const text = (event as ClipboardEvent).clipboardData?.getData('text/plain');
    document.execCommand('insertText', false, text);
  }
}
