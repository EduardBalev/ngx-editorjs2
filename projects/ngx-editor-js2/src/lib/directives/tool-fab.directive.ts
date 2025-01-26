import {
  Directive,
  effect,
  HostListener,
  inject,
  input,
  output,
  ViewContainerRef,
} from '@angular/core';
import { ToolFabService } from '../services/tool-fab.service';
import { BlockOptionAction } from '../services/editor-js.service';

@Directive({
  selector: '[toolFab]',
})
export class ToolFabDirective {
  toolFabService = inject(ToolFabService);
  viewContainerRef = inject(ViewContainerRef);

  blockOptionActions = input<BlockOptionAction[]>();
  handleBlockOptionAction = input.required<(v: string) => void>();

  @HostListener('mouseenter') onMouseEnter() {
    this.toolFabService.componentContext.next({
      viewContainerRef: this.viewContainerRef,
      blockOptionActions: this.blockOptionActions() ?? [],
      handleBlockOptionAction: this.handleBlockOptionAction(),
    });
  }

  constructor() {
    effect(() => {
      console.log('[blockOptionActions] : ', this.blockOptionActions());
    });
  }
}
