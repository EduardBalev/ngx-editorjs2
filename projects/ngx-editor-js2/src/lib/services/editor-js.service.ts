import {
  inject,
  Injectable,
  InputSignal,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, of, tap } from 'rxjs';

const createUID = () => Math.random().toString(36).substring(7);

export interface NgxEditorJsBlock {
  blockId: string;
  sortIndex: number;
  componentInstanceName: string;
  dataClean: string;
  savedAction?: string;
}
interface NgxEditorJsBlockWithComponent extends NgxEditorJsBlock {
  component: Type<BlockComponent>;
  autofocus?: boolean;
}

export interface BlockComponent {
  formControlName: InputSignal<string>;
  formGroup: InputSignal<FormGroup>;
  blockOptionActions: InputSignal<BlockOptionAction[]>;
}

export interface BlockOptionAction {
  action: string;
  icon?: string;
  text?: string;
}

export enum MovePositionActions {
  UP = 'UP',
  DOWN = 'DOWN',
  DELETE = 'DELETE',
}

@Injectable({
  providedIn: 'root',
})
export class EditorJsService {
  formBuilder = inject(FormBuilder);

  ngxEditor!: ViewContainerRef;
  formGroup = this.formBuilder.group({});

  blockComponents = new BehaviorSubject<Type<BlockComponent>[]>([]);
  blockComponents$ = this.blockComponents.asObservable();

  // TODO - Handle this idiomatically
  setNgxEditor(ngxEditor: ViewContainerRef) {
    this.ngxEditor = ngxEditor;
  }

  createNgxEditorJsBlockWithComponent(blockComponent: Type<BlockComponent>) {
    return of<NgxEditorJsBlockWithComponent>({
      blockId: createUID(),
      sortIndex: 0,
      componentInstanceName: blockComponent.name,
      component: blockComponent,
      // TODO - Force content-type for dataClean? JSON, HTML, etc.
      // TODO - And maybe rename dataClean to just data?
      dataClean: '',
      autofocus: true,
    });
  }

  addBlockComponent(ngxEditorJsBlock: NgxEditorJsBlockWithComponent) {
    return combineLatest([
      this.createFormGroupControl(ngxEditorJsBlock),
      this.attachComponent(ngxEditorJsBlock),
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
  }: NgxEditorJsBlockWithComponent) {
    return of(blockId).pipe(
      tap((controlName) => {
        const componentRef = this.ngxEditor.createComponent(component);
        componentRef.setInput('formGroup', this.formGroup);
        componentRef.setInput('formControlName', controlName);
        componentRef.setInput('autofocus', autofocus);
      })
    );
  }
}
