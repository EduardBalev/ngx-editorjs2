import { Component, inject, OnDestroy } from '@angular/core';
import { EditorJsComponent } from './components/editor-js.component';
import { MatButton } from '@angular/material/button';
import { EditorJsService } from './services/editor-js.service';
import { HeaderBlockComponent } from './components/header-block.component';
import { firstValueFrom } from 'rxjs';
import { ToolFabService } from './services/tool-fab.service';

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
export class NgxEditorJs2Component implements OnDestroy {
  editorJsService = inject(EditorJsService);
  toolFabService = inject(ToolFabService);

  addBlockComponent() {
    void firstValueFrom(
      this.editorJsService.addBlockComponent(HeaderBlockComponent)
    );
  }

  ngOnDestroy() {
    this.toolFabService.destroyStream$.next(true);
  }
}
