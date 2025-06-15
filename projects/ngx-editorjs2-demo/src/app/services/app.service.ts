import { Injectable } from '@angular/core';
import { NgxEditorJsBlock } from 'ngx-editor-js2';
import { BehaviorSubject, lastValueFrom, Observable, tap } from 'rxjs';

export const TEST_DATA: NgxEditorJsBlock[] = [
  {
    blockId: 'tmdjr',
    sortIndex: 0,
    componentInstanceName: 'HeaderBlockComponent',
    savedAction: 'h1',
    dataClean: "Let's get <b>started</b>... 🚀<br>",
  },
  {
    blockId: 'uhape',
    sortIndex: 1,
    componentInstanceName: 'ParagraphBlockComponent',
    savedAction: 'medium',
    dataClean:
      "<ul><li>Leveraging MVVM: Angular's adoption of the MVVM pattern is critical for structuring applications that are both manageable and scalable. Embracing this pattern will facilitate better state management and UI/data separation.</li><li><br></li><li>Mastering RxJS: Familiarity with RxJS operators is essential for effective reactive programming. Operators such as map, filter, and combineLatest are fundamental tools for data stream manipulation.</li><li><br></li><li>Utilizing Async Pipe: The async pipe is a cornerstone of Angular's reactivity, simplifying subscription management and preventing memory leaks by automatically subscribing to and unsubscribing from Observables</li></ul>",
  },
];

export const TEST_DATA_TWO: NgxEditorJsBlock[] = [
  {
    blockId: 'iovlbzgosf',
    sortIndex: 0,
    componentInstanceName: 'HeaderBlockComponent',
    dataClean: 'Different Prerequisites',
    savedAction: 'h1',
  },
  {
    blockId: 'bu23hwyltwl',
    sortIndex: 1,
    componentInstanceName: 'ParagraphBlockComponent',
    dataClean:
      'Skips the very first call to startViewTransition. This can be useful for disabling the animation during the applications initial loading phase.',
    savedAction: 'meduim',
  },
  {
    blockId: 'bu23hwyltss',
    sortIndex: 2,
    componentInstanceName: 'ParagraphBlockComponent',
    dataClean: 'SOmeehting Different then the last one',
    savedAction: 'meduim',
  },
  {
    blockId: 'iovlbzgosuu',
    sortIndex: 3,
    componentInstanceName: 'HeaderBlockComponent',
    dataClean: 'Woah! This is cool..',
    savedAction: 'h3',
  },
  {
    blockId: 'bu23hwyltsww',
    sortIndex: 2,
    componentInstanceName: 'ParagraphBlockComponent',
    dataClean:
      'Material Design uses color to create accessible, personal color schemes that communicate your products hierarchy, state, and brand. See Material Designs Color System page to learn more about its use and purpose.',
    savedAction: 'small',
  },
];

@Injectable({
  providedIn: 'root',
})
export class AppService {
  ngxEditorJsBlocks = new BehaviorSubject<NgxEditorJsBlock[]>([]);
  ngxEditorJsBlocks$ = this.ngxEditorJsBlocks.asObservable();

  requestBlocks = new BehaviorSubject<{}>({});
  requestBlocks$ = this.requestBlocks.asObservable();

  handleBlocks(blocks$: Observable<NgxEditorJsBlock[]>) {
    void lastValueFrom(blocks$.pipe(tap(console.table)));
  }
}
