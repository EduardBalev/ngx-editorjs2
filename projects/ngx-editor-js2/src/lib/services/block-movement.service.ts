import {
  ComponentRef,
  Injectable,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { from, of, tap } from 'rxjs';
import {
  BlockComponent,
  MovePositionActions,
} from '../ngx-editor-js2.interface';

@Injectable({
  providedIn: 'root',
})
export class BlockMovementService {
  componentRefMap = new Map<object, ComponentRef<BlockComponent>>();

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
    // Need to pass sortIndex check aganist the componentRefMap
    return of(action).pipe(
      tap((moveAction) => {
        const componentRefs = Array.from(this.componentRefMap.values());
        const componentRef = componentRefs.find(
          (componentRef) => ngxEditor.indexOf(componentRef.hostView) === index - 1
        );

        if (!componentRef) return;

        const currentIndex = ngxEditor.indexOf(componentRef.hostView);
        let newIndex =
          moveAction === MovePositionActions.UP
            ? currentIndex - 1
            : currentIndex + 1;

        // Ensure the new index is within the valid range
        const totalComponents = ngxEditor.length;
        newIndex = Math.max(0, Math.min(newIndex, totalComponents));

        // Only move if the index has changed
        if (newIndex !== currentIndex) {
          ngxEditor.move(componentRef.hostView, newIndex);
          componentRef.setInput('sortIndex', newIndex);
        }
      })
    );
  }
}
