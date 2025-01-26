import { Injectable, ViewContainerRef } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { BlockOptionAction } from './editor-js.service';

@Injectable({
  providedIn: 'root',
})
export class ToolFabService {
  destroyStream$ = new Subject<boolean>();
  componentContext = new BehaviorSubject<{
    viewContainerRef: ViewContainerRef;
    blockOptionActions: BlockOptionAction[];
  } | null>(null);
  componentContext$ = this.componentContext
    .asObservable()
    .pipe(
      takeUntil(this.destroyStream$),
      filter((componentContext) => componentContext !== null),
      distinctUntilChanged(
        ({ viewContainerRef: previous }, { viewContainerRef: current }) =>
          previous !== current ? (previous.clear(), false) : true
      ),
      tap(({ viewContainerRef, blockOptionActions }) => {
        const componentRef = viewContainerRef.createComponent(ToolbarComponent);
        componentRef.location.nativeElement.style.top = `${viewContainerRef.element.nativeElement.offsetTop}px`;
        componentRef.setInput('blockOptionActions', blockOptionActions);
      })
    )
    .subscribe();
}
