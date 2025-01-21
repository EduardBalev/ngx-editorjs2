import { TestBed } from '@angular/core/testing';

import { NgxEditorJs2Service } from './ngx-editor-js2.service';

describe('NgxEditorJs2Service', () => {
  let service: NgxEditorJs2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxEditorJs2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
