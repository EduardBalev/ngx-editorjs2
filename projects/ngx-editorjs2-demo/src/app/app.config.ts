import {
  ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideExperimentalZonelessChangeDetection(),
    // {
    //   provide: NGX_EDITORJS_OPTIO,
    //   useValue: {
    //     blocks: [
    //       {
    //         name: 'Image',
    //         component: NgxEditorjs2ImageBlockComponent,
    //         componentInstanceName: 'NgxEditorjs2ImageBlockComponent',
    //       },
    //     ],
    //   },
    // },
  ],
};
