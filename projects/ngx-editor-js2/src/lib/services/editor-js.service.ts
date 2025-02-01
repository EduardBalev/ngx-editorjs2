import { inject, Injectable, Type, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  BehaviorSubject,
  defaultIfEmpty,
  filter,
  forkJoin,
  iif,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  BlockComponent,
  MovePositionActions,
  NgxEditorJsBlockWithComponent,
} from '../ngx-editor-js2.interface';
import { BlockMovementService } from './block-movement.service';

const createUID = () => Math.random().toString(36).substring(7);
@Injectable({
  providedIn: 'root',
})
export class EditorJsService {
  formBuilder = inject(FormBuilder);
  blockMovementService = inject(BlockMovementService);

  componentRefMap = new Map<object, unknown>();

  ngxEditor!: ViewContainerRef;
  formGroup = this.formBuilder.group({});

  blockComponents = new BehaviorSubject<Type<BlockComponent>[]>([]);
  blockComponents$ = this.blockComponents.asObservable();

  // TODO - Handle this idiomatically
  setNgxEditor(ngxEditor: ViewContainerRef) {
    this.ngxEditor = ngxEditor;
  }

  createNgxEditorJsBlockWithComponent(
    blockComponent: Type<BlockComponent>,
    componentContextPositionIndex: number
  ) {
    return of<NgxEditorJsBlockWithComponent>({
      blockId: createUID(),
      sortIndex: componentContextPositionIndex,
      componentInstanceName: blockComponent.name,
      component: blockComponent,
      // TODO - Force content-type for dataClean? JSON, HTML, etc.
      // TODO - And maybe rename dataClean to just data?
      dataClean: '',
      autofocus: true,
    });
  }

  addBlockComponent(ngxEditorJsBlock: NgxEditorJsBlockWithComponent) {
    return forkJoin([
      this.createFormGroupControl(ngxEditorJsBlock),
      this.attachComponent(ngxEditorJsBlock),
      this.blockMovementService.updateComponentIndices(this.ngxEditor),
    ]).pipe(
      tap(([_formControl, _componentRef]) =>
        this.blockComponents.next([
          ...this.blockComponents.value,
          ngxEditorJsBlock.component,
        ])
      )
    );
  }

  createFormGroupControl({
    blockId,
    dataClean,
  }: NgxEditorJsBlockWithComponent) {
    return of(this.formBuilder.control(dataClean, [])).pipe(
      tap((formControl) => this.formGroup.addControl(blockId, formControl))
    );
  }

  attachComponent({
    component,
    blockId,
    autofocus,
    sortIndex: index,
  }: NgxEditorJsBlockWithComponent) {
    return of(blockId).pipe(
      tap((controlName) => {
        const componentRef = this.ngxEditor.createComponent(component, {
          index,
        });
        componentRef.setInput('sortIndex', index);
        componentRef.setInput('formGroup', this.formGroup);
        componentRef.setInput('formControlName', controlName);
        componentRef.setInput('autofocus', autofocus);

        this.blockMovementService.newComponentAttached(componentRef);
      })
    );
  }

  determineMovePositionAction(action: MovePositionActions, index: number) {
    return iif(
      () => action === MovePositionActions.DELETE,
      this.blockMovementService.removeBlockComponent(this.ngxEditor, index),
      this.blockMovementService.moveBlockComponentPosition(
        this.ngxEditor,
        action,
        index
      )
    ).pipe(
      switchMap(() =>
        this.blockMovementService.updateComponentIndices(this.ngxEditor)
      )
    );
  }

  moveBlockComponentPosition(previousIndex: number, currentIndex: number) {
    return of(this.ngxEditor.get(previousIndex)).pipe(
      filter((viewRef) => !!viewRef),
      tap((viewRef) => {
        this.ngxEditor.move(viewRef, currentIndex);
      }),
      switchMap(() =>
        this.blockMovementService.updateComponentIndices(this.ngxEditor)
      ),
      defaultIfEmpty(false)
    );
  }
}
