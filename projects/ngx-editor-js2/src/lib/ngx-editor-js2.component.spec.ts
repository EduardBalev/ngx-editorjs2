import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxEditorJs2Component } from './ngx-editor-js2.component';

describe('NgxEditorJs2Component', () => {
  let component: NgxEditorJs2Component;
  let fixture: ComponentFixture<NgxEditorJs2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxEditorJs2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxEditorJs2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
