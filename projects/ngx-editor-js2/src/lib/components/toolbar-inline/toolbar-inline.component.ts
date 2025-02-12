import {
  Component,
  EventEmitter,
  inject,
  input,
  Input,
  Output,
  Renderer2,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'toolbar-inline',
  imports: [MatListModule, MatIconModule, FormsModule],
  host: { class: 'mat-elevation-z24' },
  template: `
    <div class="panel">
      @for (item of options; track $index) {
      <div class="inline-option" (click)="addInlineTag(item.action)">
        <mat-icon>{{ item.icon }}</mat-icon>
      </div>
      }
      <div class="inline-option" (click)="addClassTag('code', 'inline-code')">
        <mat-icon>code</mat-icon>
      </div>
      <div class="inline-option" (click)="openUrlInput()">
        <mat-icon>insert_link</mat-icon>
      </div>
      <div class="inline-option" (click)="clearTags()">
        <mat-icon>format_clear</mat-icon>
      </div>
    </div>

    @if(showURLInputField()) {
    <div class="panel">
      <input
        type="text"
        placeholder="Enter URL"
        class="block-option-input"
        [(ngModel)]="url"
      />
      <div class="inline-option" (click)="createLink()">
        <mat-icon>add</mat-icon>
      </div>
    </div>
    }
  `,
  styles: [
    `
      :host {
        color: var(--mat-sys-on-secondary);
        background: var(--mat-sys-secondary);
        border-radius: 8px;
        .panel {
          display: flex;
          width: 230px;
          flex-wrap: wrap;
          gap: 1px;
        }
        .inline-option {
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .block-option-input {
          width: 197px;
          height: 32px;
          border: none;
          outline: none;
          color: var(--mat-sys-on-secondary);
          background-color: transparent;
          box-sizing: border-box;
        }
      }
    `,
  ],
})
export class ToolbarInlineComponent {
  // @Input() selection!: Selection;
  selection = input.required<Selection>();
  @Output('closeOverlay') closeOverlayEmitter = new EventEmitter();

  renderer = inject(Renderer2);

  url = '';
  showURLInputField = signal(false);
  savedRanges: Range[] = [];
  options = [
    { icon: 'format_bold', action: 'bold' },
    { icon: 'format_italic', action: 'italic' },
    { icon: 'format_underlined', action: 'underline' },
    { icon: 'strikethrough_s', action: 'strikethrough' },
    { icon: 'format_list_bulleted', action: 'insertUnorderedList' },
    { icon: 'format_list_numbered', action: 'insertOrderedList' },
    { icon: 'highlight', action: 'highlightColor' },
    { icon: 'format_align_left', action: 'justifyLeft' },
    { icon: 'format_align_center', action: 'justifyCenter' },
    { icon: 'format_align_right', action: 'justifyRight' },
    { icon: 'format_align_justify', action: 'justifyFull' },
  ];

  addInlineTag(tag: string) {
    // https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative
    document.execCommand(tag);
    this.closeOverlayEmitter.emit();
  }

  addClassTag(tag: string, className: string) {
    const range = this.selection().getRangeAt(0);
    const element = this.renderer.createElement(tag);
    element.className = className ?? '';
    element.innerHTML = range.toString();
    range.deleteContents();
    range.insertNode(element);
    this.closeOverlayEmitter.emit();
  }

  clearTags() {
    document.execCommand('removeFormat');
    document.execCommand('unlink');
    this.closeOverlayEmitter.emit();
  }

  openUrlInput() {
    this.savedRanges.push(this.selection().getRangeAt(0));
    this.showURLInputField.set(true);
  }

  createLink() {
    this.selection().removeAllRanges();
    this.selection().addRange(this.savedRanges.pop()!);
    document.execCommand('createLink', false, this.url);
    this.closeOverlayEmitter.emit();
  }
}
