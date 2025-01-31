import {
  ComponentRef,
  Directive,
  effect,
  HostListener,
  inject,
  input,
  ViewContainerRef,
} from '@angular/core';
import { ToolFabService } from '../services/tool-fab.service';
import { Observable } from 'rxjs';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { BlockOptionAction } from '../ngx-editor-js2.interface';

export type ToolbarComponentRef = Observable<ComponentRef<ToolbarComponent>>;

@Directive({
  selector: '[toolFab]',
})
export class ToolFabDirective {
  toolFabService = inject(ToolFabService);
  viewContainerRef = inject(ViewContainerRef);
  
  autofocus = input<boolean>();
  blockOptionActions = input<BlockOptionAction[]>();
  actionCallback = input.required<(action: string) => void>();
  componentContextPositionIndex = input.required<number>();

  @HostListener('mouseenter') onMouseEnter() {
    this.toolFabService.componentContext.next({
      viewContainerRef: this.viewContainerRef,
      blockOptionActions: this.blockOptionActions() ?? [],
      actionCallback: this.actionCallback(),
      index: this.componentContextPositionIndex(),
    });
  }

  constructor() {
    effect(() => {
      this.autofocus() && this.onMouseEnter();
    });
  }
}
