import { inject, Injectable, ViewContainerRef } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { BlockOptionAction } from './editor-js.service';
import { NgxEditorJs2Service } from './ngx-editor-js2.service';

@Injectable({
  providedIn: 'root',
})
export class ToolFabService {
  ngxEditorJs2Service = inject(NgxEditorJs2Service);
  // I need to explain this in detail so the future me can understand this.
  componentContext = new BehaviorSubject<{
    viewContainerRef: ViewContainerRef;
    blockOptionActions: BlockOptionAction[];
    actionCallback: (v: string) => void;
  } | null>(null);

  toolbarComponentRef$ = combineLatest({
    componentContext: this.componentContext.asObservable(),
    supportedBlocks: this.ngxEditorJs2Service.supportedBlocks$,
  }).pipe(
    filter(({ componentContext }) => componentContext !== null),
    distinctUntilChanged(
      ({ componentContext: previous }, { componentContext: current }) =>
        previous!.viewContainerRef !== current!.viewContainerRef
          ? (previous!.viewContainerRef.clear(), false)
          : true
    ),
    map(({ componentContext, supportedBlocks }) => {
      const { viewContainerRef, blockOptionActions, actionCallback } =
        componentContext!;
      const componentRef = viewContainerRef.createComponent(ToolbarComponent);
      componentRef.setInput('supportedBlocks', supportedBlocks);
      componentRef.setInput('blockOptionActions', blockOptionActions);
      componentRef.setInput('actionCallback', actionCallback);
      return componentRef;
    })
  );
}
