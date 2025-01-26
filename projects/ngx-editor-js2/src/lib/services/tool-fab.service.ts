import { Injectable, ViewContainerRef } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { ToolbarComponent } from '../components/toolbar.component';

@Injectable({
  providedIn: 'root',
})
export class ToolFabService {
  destroyStream$ = new Subject<boolean>();
  viewContainerRef = new BehaviorSubject<ViewContainerRef | null>(null);
  viewContainerRef$ = this.viewContainerRef
    .asObservable()
    .pipe(
      takeUntil(this.destroyStream$),
      filter((viewContainerRef) => viewContainerRef !== null),
      distinctUntilChanged((previous, current) =>
        previous === current ? true : (previous.clear(), false)
      ),
      tap(
        (viewContainerRef) =>
          (viewContainerRef.createComponent(
            ToolbarComponent
          ).location.nativeElement.style.top = `${viewContainerRef.element.nativeElement.offsetTop}px`)
      )
    )
    .subscribe();
}
