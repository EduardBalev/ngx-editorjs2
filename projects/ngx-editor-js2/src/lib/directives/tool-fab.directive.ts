import {
  Directive,
  HostListener,
  inject,
  ViewContainerRef,
} from '@angular/core';
import { ToolFabService } from '../services/tool-fab.service';

@Directive({
  selector: '[toolFab]',
})
export class ToolFabDirective {
  toolFabService = inject(ToolFabService);
  viewContainerRef = inject(ViewContainerRef);

  @HostListener('mouseenter') onMouseEnter() {
    this.toolFabService.viewContainerRef.next(this.viewContainerRef);
  }
}
