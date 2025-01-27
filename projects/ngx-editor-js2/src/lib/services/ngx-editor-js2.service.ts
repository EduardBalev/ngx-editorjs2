import { inject, Injectable, InjectionToken, Type } from '@angular/core';

export const NGX_EDITORJS_OPTIONS = new InjectionToken<NgxEditorjsOptions>(
  'NGX_EDITORJS_OPTIONS'
);

export interface NgxEditorjsOptions {
  consumerSupportedBlocks?: ConsumerSupportedBlock[];
}
export interface ConsumerSupportedBlock {
  name: string;
  type: string;
  component: Type<unknown>;
  componentInstanceName: string;
}

@Injectable({
  providedIn: 'root',
})
export class NgxEditorJs2Service {
  consumerSupportedBlocks: ConsumerSupportedBlock[] =
    inject(NGX_EDITORJS_OPTIONS, { optional: true })?.consumerSupportedBlocks ??
    [];

  internalSupportedBlocks: ConsumerSupportedBlock[] = [
    // ! START HERE!!!!!!!!!
  ];
}
