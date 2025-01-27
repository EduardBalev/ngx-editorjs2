import { AsyncPipe } from '@angular/common';
import { Component, inject, Input, input, output } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatRipple } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatList, MatListItem } from '@angular/material/list';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { ConsumerSupportedBlock } from '../../services/ngx-editor-js2.service';

@Component({
  selector: 'toolbar-blocks',
  imports: [
    MatFormField,
    MatInput,
    MatList,
    MatListItem,
    MatRipple,
    MatLabel,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  template: `
    <div class="block-list-container mat-elevation-z24">
      <mat-form-field appearance="fill" color="accent">
        <mat-label>Filter</mat-label>
        <input
          class="filter-text"
          matInput
          [formControl]="blockCtrl"
          [autofocus]="true"
        />
      </mat-form-field>
      @if(filteredBlocks$ | async; as filteredBlocks) {
      <mat-list class="block-list-panel">
        @if (filteredBlocks.length <= 0) {
        <mat-list-item matRipple mat-list-item> No Results </mat-list-item>
        } @else { @for(block of filteredBlocks; track $index) {
        <mat-list-item matRipple mat-list-item (click)="addBlock(block)">
          {{ block.name }}
        </mat-list-item>
        } }
      </mat-list>
      }
    </div>
  `,
  styles: [
    `
      :host {
        .mat-mdc-list-base {
          padding-top: 0px;
          margin-top: -14px;
        }

        .block-list-container {
          background: var(--mat-sys-surface);
          border-radius: 4px;
        }

        .block-list-panel {
          max-width: 280px;
          max-height: 240px;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          overflow: auto;
          color: var(--mat-sys-on-tertiary-container);
        }

        mat-list-item {
          cursor: pointer;
          user-select: none;
          &:hover,
          &:focus {
            background: var(--mat-sys-surface-bright);
          }
        }
      }
    `,
  ],
})
export class ToolbarBlocksComponent {
  addBlockEmitter = output<string>({ alias: 'addBlock' });
  supportedBlocks = input<ConsumerSupportedBlock[]>([]);
  supportedBlocks$ = toObservable(this.supportedBlocks);

  blockCtrl = new FormControl([]);
  filter$ = this.blockCtrl.valueChanges.pipe(startWith(''));

  filteredBlocks$ = combineLatest([this.supportedBlocks$, this.filter$]).pipe(
    map(([blocks, filterString]) => {
      if (typeof filterString !== 'string') filterString = '';
      filterString = filterString.replace(/\\/g, '');
      const pattern = filterString
        ?.split('')
        .map((v: string) => `(?=.*${v})`)
        .join('');
      const regex = new RegExp(`${pattern}`, 'gi');

      // return blocks.filter(block => regex.exec(block));
      return blocks.filter((block) => block.name.match(regex));
    })
  );

  addBlock(block: any) {
    this.addBlockEmitter.emit(block);
  }
}
