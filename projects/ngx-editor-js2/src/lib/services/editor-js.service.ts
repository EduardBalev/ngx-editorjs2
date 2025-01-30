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

  setNgxEditor(ngxEditor: ViewContainerRef) {
    this.ngxEditor = ngxEditor;
  }

  addBlockComponent(
    ngxEditorJsBlock: NgxEditorJsBlockWithComponent,
    controlName: string = createUID()
  ) {
    return combineLatest([
      this.newFormGroupControl(controlName, ngxEditorJsBlock?.dataClean),
      this.attachComponent(ngxEditorJsBlock, controlName),
    ]).pipe(
      tap(([_formControl, _componentRef]) =>
        this.blockComponents.next([
          ...this.blockComponents.value,
          ngxEditorJsBlock.component,
        ])
      )
    );
  }

  newFormGroupControl(uuid: string, value?: unknown) {
    return of(this.formBuilder.control(value, [])).pipe(
      tap((formControl) => this.formGroup.addControl(uuid, formControl))
    );
  }

  attachComponent(
    { component }: NgxEditorJsBlockWithComponent,
    controlName: string
  ) {
    return of(controlName).pipe(
      tap((_controlName) => {
        const componentRef = this.ngxEditor.createComponent(component);
        componentRef.setInput('formGroup', this.formGroup);
        componentRef.setInput('formControlName', _controlName);
      })
    );
  }
}
