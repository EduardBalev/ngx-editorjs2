import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import {
  exhaustMap,
  filter,
  lastValueFrom,
  map,
  merge,
  of,
  tap,
} from 'rxjs';
import { ToolbarInlineComponent } from '../components/toolbar-inline/toolbar-inline.component';

@Injectable({
  providedIn: 'root',
})
export class ToolbarInlineService {
  overlay = inject(Overlay);
  overlayRef!: OverlayRef;

  determineToDisplayInlineToolbarBlock(_event: Event) {
    return of(window.getSelection()).pipe(
      filter((selection) => selection !== null),
      filter((selection) => selection.toString().length > 0),
      filter((selection) => selection.toString() !== ''),
      map((selection) => ({
        selection,
        parant: this.getSelectionParent(selection),
      })),
      filter(({ parant }) => this.isSelectionInABlock(parant as HTMLElement)),
      exhaustMap(({ selection }) => this.attachInlineToolbar(selection))
    );
  }

  getSelectionParent(selection: Selection): HTMLElement | null {
    if (selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    return range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement;
  }

  isSelectionInABlock(target: HTMLElement | null) {
    return !!target && target.closest('ngx-editor-js2') !== null;
  }

  attachInlineToolbar(selection: Selection) {
    return of(selection.getRangeAt(0)).pipe(
      map((range) => range.getBoundingClientRect()),
      map((selectionRect) => {
        this.overlayRef = this.overlay.create({
          hasBackdrop: true,
          backdropClass: 'cdk-overlay-transparent-backdrop',
          positionStrategy: this.overlay
            .position()
            .flexibleConnectedTo(selectionRect)
            .withPositions([
              {
                offsetY: 8,
                originX: 'start',
                originY: 'bottom',
                overlayX: 'start',
                overlayY: 'top',
              },
            ]),
        });
        // To tired to do this properly right now
        // passing the refs down the pipe adds a bug
        // user selects text with a drag (mousedown → mousemove → mouseup)
        const { instance: inlineToolbar } = this.overlayRef.attach(
          new ComponentPortal(ToolbarInlineComponent)
        );
        inlineToolbar.selection = selection;
        lastValueFrom(
          merge(
            this.overlayRef.backdropClick(),
            inlineToolbar.closeInlineToobarOverlayEmitter
          ).pipe(
            tap(() => this.overlayRef.dispose()),
            tap(() => selection.removeAllRanges())
          )
        );
        return true;
      })
    );
  }
}
