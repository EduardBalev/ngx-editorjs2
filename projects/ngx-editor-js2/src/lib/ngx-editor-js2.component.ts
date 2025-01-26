import { Component, inject } from '@angular/core';
import { EditorJsComponent } from './components/editor-js.component';
import { MatButton } from '@angular/material/button';
import { EditorJsService } from './services/editor-js.service';
import { HeaderBlockComponent } from './components/blocks/header-block.component';
import { firstValueFrom } from 'rxjs';
import { ToolFabService } from './services/tool-fab.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ngx-editor-js2',
  imports: [EditorJsComponent, MatButton],
  template: `
    <button mat-button (click)="addBlockComponent()">
      Add Form Control Component
    </button>
    <div>
      <editor-js></editor-js>
    </div>
  `,
})
export class NgxEditorJs2Component {
  editorJsService = inject(EditorJsService);
  toolFabService = inject(ToolFabService);

  addBlockComponent() {
    void firstValueFrom(
      this.editorJsService.addBlockComponent(HeaderBlockComponent)
    );
  }

  constructor() {
    this.toolFabService.toolbarComponentRef$
      .pipe(takeUntilDestroyed())
      .subscribe(); // 1st and only subscription?
  }
}
