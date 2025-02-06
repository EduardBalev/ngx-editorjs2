import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { defaultIfEmpty, filter, from, map, of, tap } from 'rxjs';
import {
  BlockComponent,
  MovePositionActions,
} from '../ngx-editor-js2.interface';

@Injectable({
  providedIn: 'root',
})
export class BlockMovementService {
  componentRefMap = new Map<object, ComponentRef<BlockComponent>>();

  clearComponentRefs() {
    this.componentRefMap.clear();
  }

  getNgxEditorJsBlocks() {
    return of(Array.from(this.componentRefMap.values()));
  }

  newComponentAttached(componentRef: ComponentRef<BlockComponent>) {
    this.componentRefMap.set(componentRef.instance, componentRef);
  }

  updateComponentIndices(ngxEditor: ViewContainerRef) {
    return from(this.componentRefMap.values()).pipe(
      tap((componentRef: any) =>
        componentRef.setInput(
          'sortIndex',
          ngxEditor.indexOf(componentRef.hostView)
        )
      )
    );
  }

  moveBlockComponentPosition(
    ngxEditor: ViewContainerRef,
    action: MovePositionActions,
    index: number
  ) {
    return of(Array.from(this.componentRefMap.values())).pipe(
      map((componentRefs) =>
        componentRefs.find(
          (componentRef) =>
            ngxEditor.indexOf(componentRef.hostView) === index - 1
        )
      ),
      filter((componentRef) => !!componentRef),
      map((componentRef) => ({
        componentRef,
        totalComponents: ngxEditor.length - 1,
        currentIndex: ngxEditor.indexOf(componentRef.hostView),
        newIndex: (index: number) =>
          action === MovePositionActions.UP ? index - 1 : index + 1,
      })),
      map(({ componentRef, totalComponents, currentIndex, newIndex }) => ({
        componentRef,
        currentIndex,
        newIndex: Math.max(
          0,
          Math.min(newIndex(currentIndex), totalComponents)
        ),
      })),
      filter(({ currentIndex, newIndex }) => currentIndex !== newIndex),
      tap(({ componentRef, newIndex }) => {
        ngxEditor.move(componentRef.hostView, newIndex);
        componentRef.setInput('sortIndex', newIndex);
        componentRef.setInput('autofocus', true);
      }),
      defaultIfEmpty(false)
    );
  }

  removeBlockComponent(
    ngxEditor: ViewContainerRef,
    index: number,
    clear = false
  ) {
    return of(Array.from(this.componentRefMap.values())).pipe(
      filter((componentRefs) => clear || componentRefs.length !== 1),
      map((componentRefs) =>
        componentRefs.find(
          (componentRef) =>
            ngxEditor.indexOf(componentRef.hostView) === index - 1
        )
      ),
      map((componentRef) =>
        this.componentRefMap.delete(componentRef?.instance ?? {})
      ),
      tap((successful) => successful && ngxEditor.remove(index - 1)),
      defaultIfEmpty(false)
    );
  }
}
