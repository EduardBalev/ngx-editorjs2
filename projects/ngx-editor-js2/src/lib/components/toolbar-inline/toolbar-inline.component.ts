import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'toolbar-inline',
  imports: [MatListModule, MatIconModule, MatRippleModule, FormsModule, NgIf],
  template: `
    <div class="block-list-container mat-elevation-z8">
      <div class="block-option-list-panel">
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('bold')"
        >
          <mat-icon>format_bold</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('italic')"
        >
          <mat-icon>format_italic</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('underlined')"
        >
          <mat-icon>format_underlined</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('strikethrough')"
        >
          <mat-icon>strikethrough_s</mat-icon>
        </div>
        <!-- <div class="block-option-list-item"
      matRipple
      (click)="addInlineTag('hiliteColor', 'red')">
      <mat-icon>highlight</mat-icon>
    </div> -->
        <div
          class="block-option-list-item"
          matRipple
          (click)="addCustomInlineTag('code', 'inline-code-example')"
        >
          <mat-icon>code</mat-icon>
        </div>
        <div class="block-option-list-item" matRipple (click)="openUrlInput()">
          <mat-icon>insert_link</mat-icon>
        </div>
        <div class="block-option-list-item" matRipple (click)="clearTags()">
          <mat-icon>format_clear</mat-icon>
        </div>

        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('justifyLeft')"
        >
          <mat-icon>format_align_left</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('justifyCenter')"
        >
          <mat-icon>format_align_center</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('justifyRight')"
        >
          <mat-icon>format_align_right</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('justifyFull')"
        >
          <mat-icon>format_align_justify</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('insertUnorderedList')"
        >
          <mat-icon>format_list_bulleted</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('insertOrderedList')"
        >
          <mat-icon>format_list_numbered</mat-icon>
        </div>
        <div
          class="block-option-list-item"
          matRipple
          (click)="addInlineTag('hiliteColor', 'yellow')"
        >
          <mat-icon>highlight</mat-icon>
        </div>
      </div>
      <div *ngIf="showURLInputField" class="block-option-list-panel">
        <input
          type="text"
          placeholder="Enter URL"
          class="block-option-input"
          [(ngModel)]="url"
        />
        <div class="block-option-list-item" matRipple (click)="createLink()">
          <mat-icon>add</mat-icon>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        color: var(--mat-sys-on-tertiary-container);
        background: var(--mat-sys-tertiary-container);
        .block-list-container {
          border-radius: 4px;
        }

        .block-option-list-panel {
          display: flex;
          width: 230px;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 1px;
          border-radius: 4px;
          overflow: auto;
        }

        .block-option-list-item {
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .block-option-input {
          width: 197px;
          height: 32px;
          border: none;
          outline: none;
          background-color: transparent;
          color: #000;
          font-size: 14px;
          font-weight: 400;
          padding: 0 0 0 5px;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          box-sizing: border-box;
        }

        .block-option-list-item-text {
          font-size: 16px;
        }

        .block-option-list-item-text {
          user-select: none;
        }
      }
    `,
  ],
})
export class ToolbarInlineComponent {
  @Input() selection!: Selection;

  @Output('closeInlineToobarOverlay') closeInlineToobarOverlayEmitter =
    new EventEmitter();

  url: string = '';
  showURLInputField: boolean = false;
  savedRanges: Range[] = [];

  constructor(private readonly renderer: Renderer2) {}

  ngOnInit(): void {}

  closeInlineToobarOverlay() {
    this.closeInlineToobarOverlayEmitter.emit();
  }

  addInlineTag(tag: string, optionValue?: string | null) {
    // https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative
    document.execCommand(tag, true, optionValue!);
    this.closeInlineToobarOverlay();
  }

  addCustomInlineTag(tag: string, className?: string | null) {
    const range = this.selection.getRangeAt(0);
    const element = this.renderer.createElement(tag);
    element.className = className ?? '';
    element.innerHTML = range.toString();
    range.deleteContents();
    range.insertNode(element);
    this.closeInlineToobarOverlay();
  }

  clearTags() {
    document.execCommand('removeFormat');
    document.execCommand('unlink');
    this.closeInlineToobarOverlay();
  }

  openUrlInput() {
    this.savedRanges.push(this.selection.getRangeAt(0));
    this.showURLInputField = true;
  }

  createLink() {
    this.selection.removeAllRanges();
    this.selection.addRange(this.savedRanges.pop()!);
    document.execCommand('createLink', false, this.url);
    this.closeInlineToobarOverlay();
  }
}
