import { inject, Injectable, Type, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, combineLatest, of, tap } from 'rxjs';

const createUID = () => Math.random().toString(36).substring(7);

export interface BlockComponent {
  formControlName: string;
}

@Injectable({
  providedIn: 'root',
})
export class EditorJsService {
  ngxEditor!: ViewContainerRef;
  formBuilder = inject(FormBuilder);
  formGroup = this.formBuilder.group({});

  blockComponents = new BehaviorSubject<Type<BlockComponent>[]>([]);
  // TODO: This will be exposed to the consummer to subscribe to
  blockComponents$ = this.blockComponents.asObservable();

  // ! This needs a better pattern for setting the ngxEditor
  setNgxEditor(ngxEditor: ViewContainerRef) {
    this.ngxEditor = ngxEditor;
  }

  addBlockComponent(component: Type<BlockComponent>) {
    return combineLatest([
      this.createComponent(component),
      this.addFormGroupControl(),
    ]).pipe(
      tap(([componentRef, controlName]) => {
        componentRef.instance.formControlName = controlName;
        this.blockComponents.next([...this.blockComponents.value, component]);
      })
    );
  }

  addFormGroupControl(uuid: string = createUID()) {
    return of(uuid).pipe(
      tap(() =>
        this.formGroup.addControl(uuid, this.formBuilder.control('', []))
      )
    );
  }

  createComponent(component: Type<BlockComponent>) {
    return of(this.ngxEditor.createComponent(component, { index: 0 }));
  }
}
