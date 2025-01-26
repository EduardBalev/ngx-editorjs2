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
    component: Type<BlockComponent>,
    controlName: string = createUID()
  ) {
    return combineLatest([
      this.newFormGroupControl(controlName),
      this.attachComponent(component, controlName),
    ]).pipe(
      tap(([_formControl, _componentRef]) =>
        this.blockComponents.next([...this.blockComponents.value, component])
      )
    );
  }

  newFormGroupControl(uuid: string) {
    return of(this.formBuilder.control('', [])).pipe(
      tap((formControl) => this.formGroup.addControl(uuid, formControl))
    );
  }

  attachComponent(component: Type<BlockComponent>, controlName: string) {
    return of(
      this.ngxEditor.createComponent(component, {
        index: 0,
      })
    ).pipe(
      tap((componentRef) => {
        componentRef.setInput('formGroup', this.formGroup);
        componentRef.setInput('formControlName', controlName);
      })
    );
  }
}
