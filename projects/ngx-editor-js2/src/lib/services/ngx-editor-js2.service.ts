import { inject, Injectable, InjectionToken, Type } from '@angular/core';
import { HeaderBlockComponent } from '../components/blocks/header-block.component';
import { ParagraphBlockComponent } from '../components/blocks/paragraph-block.component';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { BlockComponent } from './editor-js.service';

export const NGX_EDITORJS_OPTIONS = new InjectionToken<NgxEditorjsOptions>(
  'NGX_EDITORJS_OPTIONS'
);

export interface NgxEditorjsOptions {
  consumerSupportedBlocks?: SupportedBlock[];
}
export interface SupportedBlock {
  name: string;
  component: Type<BlockComponent>;
}

@Injectable({
  providedIn: 'root',
})
export class NgxEditorJs2Service {
  consumerSupportedBlocks = new BehaviorSubject<SupportedBlock[]>(
    inject(NGX_EDITORJS_OPTIONS, { optional: true })?.consumerSupportedBlocks ??
      []
  );

  internalSupportedBlocks = new BehaviorSubject<SupportedBlock[]>([
    {
      name: 'Paragraph',
      component: ParagraphBlockComponent,
    },
    {
      name: 'Header',
      component: HeaderBlockComponent,
    },
  ]);

  supportedBlocks$ = combineLatest([
    this.internalSupportedBlocks.asObservable(),
    this.consumerSupportedBlocks.asObservable(),
  ]).pipe(map(([internal, consumer]) => [...internal, ...consumer]));
}
