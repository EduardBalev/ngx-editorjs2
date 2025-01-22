import { inject, Injectable, Type, ViewContainerRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EditorJsService {
    ngxEditor!: ViewContainerRef;
    formBuilder = inject(FormBuilder);
    formGroup = this.formBuilder.group({});

    // Imperative code 🤮
    setNgxEditor(ngxEditor: ViewContainerRef) {
      this.ngxEditor = ngxEditor;
    }

    // Imperative code 🤮
    addFormControlComponent(component: Type<unknown>) {
      this.formGroup.addControl('test', this.formBuilder.control(''));
      this.ngxEditor.createComponent(component, { index: 0 });
    }
}
