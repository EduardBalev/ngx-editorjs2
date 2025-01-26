import { Injectable, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, filter, map } from 'rxjs';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { BlockOptionAction } from './editor-js.service';

@Injectable({
  providedIn: 'root',
})
export class ToolFabService {
  // I need to explain this in detail so the future me can understand this.
  componentContext = new BehaviorSubject<{
    viewContainerRef: ViewContainerRef;
    blockOptionActions: BlockOptionAction[];
    actionCallback: (v: string) => void;
  } | null>(null);

  toolbarComponentRef$ = this.componentContext.asObservable().pipe(
    filter((componentContext) => componentContext !== null),
    distinctUntilChanged(
      ({ viewContainerRef: previous }, { viewContainerRef: current }) =>
        previous !== current ? (previous.clear(), false) : true
    ),
    map(({ viewContainerRef, blockOptionActions, actionCallback }) => {
      const componentRef = viewContainerRef.createComponent(ToolbarComponent);
      componentRef.setInput('blockOptionActions', blockOptionActions);
      componentRef.setInput('actionCallback', actionCallback);
      return componentRef;
    })
  );
}
