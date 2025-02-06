export const NGX_EDITORJS_OPTIONS = new InjectionToken<NgxEditorjsOptions>(
  'NGX_EDITORJS_OPTIONS'
);

export interface NgxEditorjsOptions {
  consumerSupportedBlocks?: SupportedBlock[];
}
export interface SupportedBlock {
  name: string;
  componentInstanceName: string;
  component: Type<BlockComponent>;
}

export interface NgxEditorJsBlock {
  blockId: string;
  sortIndex: number;
  componentInstanceName: string;
  dataClean: string;
  savedAction?: string;
}
export interface NgxEditorJsBlockWithComponent extends NgxEditorJsBlock {
  component: Type<BlockComponent>;
  autofocus?: boolean;
}

export interface BlockComponent {
  sortIndex: InputSignal<number>;
  formControlName: InputSignal<string>;
  formGroup: InputSignal<FormGroup>;
  blockOptionActions: InputSignal<BlockOptionAction[]>;
  actionCallback?: (string: string) => void;
}

export interface BlockOptionAction {
  action: string;
  icon?: string;
  text?: string;
}

export enum MovePositionActions {
  UP = 'UP',
  DOWN = 'DOWN',
  DELETE = 'DELETE',
}

export type TAddBlockCallback = (
  block: Type<BlockComponent>,
  index: number
) => Observable<unknown>;

export type TMoveBlockPositionCallback = (
  action: MovePositionActions,
  index: number
) => Observable<unknown>;

type ComponentContext = {
  index: number;
  viewContainerRef: ViewContainerRef;
  blockOptionActions: BlockOptionAction[];
  actionCallback: (v: string) => void;
  formControlName: string;
} | null;

@Injectable({
  providedIn: 'root',
})
export class NgxEditorJs2Service {
  editorJsService = inject(EditorJsService);

  consumerSupportedBlocks = new BehaviorSubject<SupportedBlock[]>(
    inject(NGX_EDITORJS_OPTIONS, { optional: true })?.consumerSupportedBlocks ??
      []
  );

  internalSupportedBlocks = new BehaviorSubject<SupportedBlock[]>([
    {
      name: 'Paragraph',
      component: ParagraphBlockComponent,
      componentInstanceName: 'ParagraphBlockComponent',
    },
    {
      name: 'Header',
      component: HeaderBlockComponent,
      componentInstanceName: 'HeaderBlockComponent',
    },
  ]);

  supportedBlocks$ = combineLatest([
    this.internalSupportedBlocks.asObservable(),
    this.consumerSupportedBlocks.asObservable(),
  ]).pipe(map(([internal, consumer]) => [...internal, ...consumer]));

  blocksToLoad = new BehaviorSubject<NgxEditorJsBlock[]>([]);

  loadBlocks$ = this.blocksToLoad.asObservable().pipe(
    delay(0),
    exhaustMap((blocks) =>
      forkJoin([of(blocks), this.editorJsService.clearBlocks()])
    ),
    map(([blocks]) => (blocks.length > 0 ? blocks : this.loadDefaultBlocks())),
    map((blocks) =>
      Array.from(
        new Map(blocks.map((block) => [block.blockId, block])).values()
      )
    ),
    map((blocks) => blocks.sort((a, b) => a.sortIndex - b.sortIndex)),
    switchMap((blocks) => combineLatest([of(blocks), this.supportedBlocks$])),
    map(([blocks, supportedBlocks]) => ({
      blocks,
      supportedBlocksMap: new Map(
        supportedBlocks.map((sb) => [sb.componentInstanceName, sb.component])
      ),
    })),
    map(({ blocks, supportedBlocksMap }) =>
      blocks.map((block) => ({
        ...block,
        component:
          supportedBlocksMap.get(block.componentInstanceName) ??
          HeaderBlockComponent,
      }))
    ),
    mergeMap((blocks) =>
      combineLatest(
        blocks.map((block: NgxEditorJsBlockWithComponent) =>
          this.editorJsService.addBlockComponent(block)
        )
      )
    )
  );

  loadDefaultBlocks() {
    return [
      {
        blockId: 'tmdjr',
        sortIndex: 0,
        componentInstanceName: 'HeaderBlockComponent',
        dataClean: "Let's get started... 🚀",
        savedAction: 'h1',
      },
    ];
  }
}

const createUID = () => Math.random().toString(36).substring(7);
@Injectable({
  providedIn: 'root',
})
export class EditorJsService {
  formBuilder = inject(FormBuilder);
  blockMovementService = inject(BlockMovementService);

  componentRefMap = new Map<object, unknown>();

  ngxEditor!: ViewContainerRef;
  formGroup = this.formBuilder.group({});

  // TODO - Handle this idiomatically
  setNgxEditor(ngxEditor: ViewContainerRef) {
    this.ngxEditor = ngxEditor;
  }

  getBlocks$(): Observable<NgxEditorJsBlock[]> {
    return new Observable<NgxEditorJsBlock[]>((observer) => {
      lastValueFrom(
        this.blockMovementService.getNgxEditorJsBlocks().pipe(
          map((componentRefs) =>
            componentRefs.map<NgxEditorJsBlock>(({ instance }) => ({
              blockId: instance.formControlName(),
              sortIndex: instance.sortIndex(),
              componentInstanceName: instance.constructor.name.slice(1),
              dataClean: instance.formGroup().get(instance.formControlName())
                ?.value,
            }))
          ),
          map((blocks) => blocks.sort((a, b) => a.sortIndex - b.sortIndex))
        )
      )
        .then((blocks) => {
          observer.next(blocks);
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  createNgxEditorJsBlockWithComponent(
    blockComponent: Type<BlockComponent>,
    componentContextPositionIndex: number
  ) {
    return of<NgxEditorJsBlockWithComponent>({
      blockId: createUID(),
      sortIndex: componentContextPositionIndex,
      componentInstanceName: blockComponent.name,
      component: blockComponent,
      // TODO - Force content-type for dataClean? JSON, HTML, etc.
      // TODO - And maybe rename dataClean to just data?
      dataClean: '',
      autofocus: true,
    });
  }

  addBlockComponent(ngxEditorJsBlock: NgxEditorJsBlockWithComponent) {
    return forkJoin([
      this.createFormGroupControl(ngxEditorJsBlock),
      this.attachComponent(ngxEditorJsBlock),
      this.blockMovementService.updateComponentIndices(this.ngxEditor),
    ]);
  }

  createFormGroupControl({
    blockId,
    dataClean,
  }: NgxEditorJsBlockWithComponent) {
    return of(this.formBuilder.control(dataClean, [])).pipe(
      tap((formControl) => this.formGroup.addControl(blockId, formControl))
    );
  }

  attachComponent({
    component,
    blockId,
    autofocus,
    savedAction,
    sortIndex: index,
  }: NgxEditorJsBlockWithComponent) {
    return of(blockId).pipe(
      map((controlName) => {
        const componentRef = this.ngxEditor.createComponent(component, {
          index,
        });
        componentRef.setInput('sortIndex', index);
        componentRef.setInput('formGroup', this.formGroup);
        componentRef.setInput('formControlName', controlName);
        componentRef.setInput('autofocus', autofocus);

        savedAction && componentRef.instance.actionCallback?.(savedAction);

        this.blockMovementService.newComponentAttached(componentRef);
        return componentRef;
      })
    );
  }

  determineMovePositionAction(
    action: MovePositionActions,
    index: number,
    formControlName: string
  ) {
    return iif(
      () => action === MovePositionActions.DELETE,
      this.removeBlockComponent(index, formControlName),
      this.blockMovementService.moveBlockComponentPosition(
        this.ngxEditor,
        action,
        index
      )
    ).pipe(
      switchMap(() =>
        this.blockMovementService.updateComponentIndices(this.ngxEditor)
      )
    );
  }

  moveBlockComponentPosition(previousIndex: number, currentIndex: number) {
    return of(this.ngxEditor.get(previousIndex)).pipe(
      filter((viewRef) => !!viewRef),
      tap((viewRef) => {
        this.ngxEditor.move(viewRef, currentIndex);
      }),
      switchMap(() =>
        this.blockMovementService.updateComponentIndices(this.ngxEditor)
      ),
      defaultIfEmpty(false)
    );
  }

  removeBlockComponent(index: number, formControlName: string, clear = false) {
    return combineLatest([
      this.blockMovementService.removeBlockComponent(
        this.ngxEditor,
        index,
        clear
      ),
      of(this.formGroup.removeControl(formControlName)),
    ]);
  }

  clearBlocks() {
    return this.blockMovementService.getNgxEditorJsBlocks().pipe(
      filter((componentRefs) => componentRefs.length > 0),
      map((componentRefs) =>
        componentRefs.sort(
          (a, b) => a.instance.sortIndex() - b.instance.sortIndex()
        )
      ),
      mergeMap((componentRefs) =>
        forkJoin(
          Array.from(componentRefs.values()).map((componentRef) =>
            this.removeBlockComponent(
              componentRef.instance.sortIndex() + 1,
              componentRef.instance.formControlName(),
              true
            )
          )
        )
      ),
      switchMap(() =>
        this.blockMovementService.updateComponentIndices(this.ngxEditor)
      ),
      tap(() => {
        this.blockMovementService.clearComponentRefs()
        this.ngxEditor.clear()
      }),
      defaultIfEmpty(false)
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class BlockMovementService {
  componentRefMap = new Map<object, ComponentRef<BlockComponent>>();

  clearComponentRefs() {
    this.componentRefMap.clear();
  }

  getNgxEditorJsBlocks() {
    return of(Array.from(this.componentRefMap.values()));
  }

  newComponentAttached(componentRef: ComponentRef<BlockComponent>) {
    this.componentRefMap.set(componentRef.instance, componentRef);
  }

  updateComponentIndices(ngxEditor: ViewContainerRef) {
    return from(this.componentRefMap.values()).pipe(
      tap((componentRef: any) =>
        componentRef.setInput(
          'sortIndex',
          ngxEditor.indexOf(componentRef.hostView)
        )
      )
    );
  }

  moveBlockComponentPosition(
    ngxEditor: ViewContainerRef,
    action: MovePositionActions,
    index: number
  ) {
    return of(Array.from(this.componentRefMap.values())).pipe(
      map((componentRefs) =>
        componentRefs.find(
          (componentRef) =>
            ngxEditor.indexOf(componentRef.hostView) === index - 1
        )
      ),
      filter((componentRef) => !!componentRef),
      map((componentRef) => ({
        componentRef,
        totalComponents: ngxEditor.length - 1,
        currentIndex: ngxEditor.indexOf(componentRef.hostView),
        newIndex: (index: number) =>
          action === MovePositionActions.UP ? index - 1 : index + 1,
      })),
      map(({ componentRef, totalComponents, currentIndex, newIndex }) => ({
        componentRef,
        currentIndex,
        newIndex: Math.max(
          0,
          Math.min(newIndex(currentIndex), totalComponents)
        ),
      })),
      filter(({ currentIndex, newIndex }) => currentIndex !== newIndex),
      tap(({ componentRef, newIndex }) => {
        ngxEditor.move(componentRef.hostView, newIndex);
        componentRef.setInput('sortIndex', newIndex);
        componentRef.setInput('autofocus', true);
      }),
      defaultIfEmpty(false)
    );
  }

  removeBlockComponent(
    ngxEditor: ViewContainerRef,
    index: number,
    clear = false
  ) {
    return of(Array.from(this.componentRefMap.values())).pipe(
      filter((componentRefs) => clear || componentRefs.length !== 1),
      map((componentRefs) =>
        componentRefs.find(
          (componentRef) =>
            ngxEditor.indexOf(componentRef.hostView) === index - 1
        )
      ),
      map((componentRef) =>
        this.componentRefMap.delete(componentRef?.instance ?? {})
      ),
      tap((successful) => successful && ngxEditor.remove(index - 1)),
      defaultIfEmpty(false)
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class ToolbarInlineService {
  overlay = inject(Overlay);
  overlayRef!: OverlayRef;

  determineToDisplayInlineToolbarBlock(_event: Event) {
    this.overlayRef?.hasAttached() && this.overlayRef.dispose(); // So hacky
    return of(window.getSelection()).pipe(
      filter((selection) => selection !== null),
      filter((selection) => selection.rangeCount > 0),
      filter((selection) => selection.toString().length > 0),
      filter((selection) => selection.toString() !== ''),
      map((selection) => ({
        selection,
        parant: this.getSelectionParent(selection),
      })),
      filter(({ parant }) => this.isSelectionInABlock(parant as HTMLElement)),
      exhaustMap(({ selection }) => this.attachInlineToolbar(selection))
    );
  }

  getSelectionParent(selection: Selection): HTMLElement | null {
    const range = selection.getRangeAt(0);
    return range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement;
  }

  isSelectionInABlock(target: HTMLElement | null) {
    return !!target && target.closest('ngx-editor-js2') !== null;
  }

  attachInlineToolbar(selection: Selection) {
    return of(selection.getRangeAt(0)).pipe(
      map((range) => range.getBoundingClientRect()),
      map((selectionRect) => this.createOverlay(selectionRect)),
      tap((overlayRef) => (this.overlayRef = overlayRef)),
      map((overlayRef) => {
        // To tired to do this properly right now
        // passing the refs down the pipe adds a bug
        // user selects text with a drag
        // (mousedown → mousemove → wait → mousemove → mouseup)
        const { instance: inlineToolbar } = overlayRef.attach(
          new ComponentPortal(ToolbarInlineComponent)
        );
        inlineToolbar.selection = selection;
        lastValueFrom(
          merge(
            overlayRef.backdropClick(),
            inlineToolbar.closeInlineToobarOverlayEmitter
          ).pipe(
            tap(() => overlayRef.dispose()),
            tap(() => selection.removeAllRanges())
          )
        );
        return true;
      })
    );
  }

  createOverlay(selectionRect: DOMRect) {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(selectionRect)
        .withPositions([
          {
            offsetY: 8,
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
        ]),
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class ToolFabService {
  ngxEditorJs2Service = inject(NgxEditorJs2Service);
  editorJsService = inject(EditorJsService);
  componentContext = new BehaviorSubject<ComponentContext>(null);
  toolbarComponentRef$ = combineLatest({
    componentContext: this.componentContext.asObservable(),
    supportedBlocks: this.ngxEditorJs2Service.supportedBlocks$,
  }).pipe(
    filter(({ componentContext }) => componentContext !== null),
    distinctUntilChanged(
      ({ componentContext: previous }, { componentContext: current }) =>
        previous!.index !== current!.index ||
        previous!.viewContainerRef !== current!.viewContainerRef
          ? (previous!.viewContainerRef.clear(), false)
          : true
    ),
    map(({ componentContext, supportedBlocks }) => {
      const {
        index,
        viewContainerRef,
        blockOptionActions,
        actionCallback,
        formControlName,
      } = componentContext!;
      const componentRef = viewContainerRef.createComponent(ToolbarComponent);
      componentRef.setInput('componentContextPositionIndex', index + 1);
      componentRef.setInput('supportedBlocks', supportedBlocks);
      componentRef.setInput('blockOptionActions', blockOptionActions);
      componentRef.setInput('actionCallback', actionCallback);
      componentRef.setInput('formControlName', formControlName);
      componentRef.setInput('addBlockCallback', this.addBlock.bind(this));
      componentRef.setInput(
        'moveBlockPositionCallback',
        this.movePositionAction.bind(this)
      );
      return componentRef;
    }),
  );

  addBlock(block: Type<BlockComponent>, index: number) {
    return this.editorJsService
      .createNgxEditorJsBlockWithComponent(block, index)
      .pipe(
        switchMap((block) => this.editorJsService.addBlockComponent(block))
      );
  }

  movePositionAction(
    action: MovePositionActions,
    index: number,
    formControlName: string
  ) {
    return lastValueFrom(
      this.editorJsService.determineMovePositionAction(
        action,
        index,
        formControlName
      )
    );
  }
}

export type ToolbarComponentRef = Observable<ComponentRef<ToolbarComponent>>;

@Directive({
  selector: '[toolbarFab]',
})
export class ToolbarFabDirective {
  toolFabService = inject(ToolFabService);
  viewContainerRef = inject(ViewContainerRef);

  autofocus = input<boolean>();
  blockOptionActions = input<BlockOptionAction[]>();
  actionCallback = input.required<(action: string) => void>();
  componentContextPositionIndex = input.required<number>();
  formControlName = input.required<string>();

  @HostListener('mouseenter') onMouseEnter() {
    this.toolFabService.componentContext.next({
      viewContainerRef: this.viewContainerRef,
      blockOptionActions: this.blockOptionActions() ?? [],
      actionCallback: this.actionCallback(),
      index: this.componentContextPositionIndex(),
      formControlName: this.formControlName(),
    });
  }

  constructor() {
    effect(() => {
      this.autofocus() && this.onMouseEnter();
    });
  }
}

@Directive({
  selector: '[controlAccessor]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ControlAccessorDirective),
      multi: true,
    },
  ],
})
export class ControlAccessorDirective implements ControlValueAccessor {
  elementRef = inject(ElementRef);

  defaultValue = input<string>();

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(): void {
    this.elementRef.nativeElement.innerText = this.defaultValue() || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  @HostListener('input')
  onInput(): void {
    this.onChange(this.elementRef.nativeElement.innerText);
  }
}

@Directive({
  selector: '[cleanPasteData]',
})
export class CleanPasteDataDirective {
  @HostListener('paste', ['$event'])
  onPaste(event: Event) {
    event.preventDefault();
    const text = (event as ClipboardEvent).clipboardData?.getData('text/plain');
    document.execCommand('insertText', false, text);
  }
}

@Directive({
  selector: '[autofocus]',
})
export class AutofocusDirective implements AfterContentInit {
  elementRef = inject(ElementRef);

  autofocus = input<boolean>(false);

  ngAfterContentInit() {
    this.autofocus() && this.elementRef.nativeElement.focus?.();
  }
}

@Component({
  selector: 'ngx-editor-js2',
  imports: [EditorJsComponent, AsyncPipe],
  template: `
    <editor-js
      [blocks]="blocks()"
      [bootstrapEditorJs]="bootstrapEditorJs$ | async"
    ></editor-js>
  `,
})
export class NgxEditorJs2Component {
  inlineToolbarSerivce = inject(ToolbarInlineService);
  editorJsService = inject(EditorJsService);
  ngxEditorJs2Service = inject(NgxEditorJs2Service);

  blocks = input<NgxEditorJsBlock[]>([]);
  blocksRequested = output<Observable<NgxEditorJsBlock[]>>();
  requestBlocks = input.required({
    transform: (_v: unknown) =>
      this.blocksRequested.emit(this.editorJsService.getBlocks$()),
  });

  bootstrapEditorJs$ = combineLatest([
    inject(ToolFabService).toolbarComponentRef$,
    this.ngxEditorJs2Service.loadBlocks$,
    fromEvent(document, 'selectionchange').pipe(
      debounceTime(200),
      switchMap((event) =>
        this.inlineToolbarSerivce.determineToDisplayInlineToolbarBlock(event)
      )
    )
  ]);
}

@Component({
  selector: 'editor-js',
  imports: [CdkDropList],
  template: `
    <div cdkDropList class="block-list" (cdkDropListDropped)="drop($event)">
      <ng-container #ngxEditor></ng-container>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        .block-list {
          min-height: 60px;
        }
      }
    `,
  ],
})
export class EditorJsComponent {
  editorJsService = inject(EditorJsService);
  ngxEditorJs2Service = inject(NgxEditorJs2Service);

  bootstrapEditorJs = input();
  blocks = input.required({
    transform: (value: NgxEditorJsBlock[]) =>
      this.ngxEditorJs2Service.blocksToLoad.next(value),
  });

  ngxEditor = viewChild.required('ngxEditor', { read: ViewContainerRef });

  constructor() {
    effect(() => {
      this.editorJsService.setNgxEditor(this.ngxEditor());
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    lastValueFrom(
      this.editorJsService.moveBlockComponentPosition(
        event.previousIndex,
        event.currentIndex
      )
    ).then(() => {
      requestAnimationFrame(() => {
        document.querySelectorAll('.cdk-drag-animating').forEach((el) => {
          const element = el as HTMLElement;
          element.classList.remove('cdk-drag-animating');
          void element.offsetWidth;
          element.classList.add('cdk-drag-animating');
        });
      });
    });
  }
}

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
        color: var(--mat-sys-on-secondary);
        background: var(--mat-sys-secondary);
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

@Component({
  selector: 'toolbar',
  imports: [
    CdkDragHandle,
    MatRipple,
    OverlayModule,
    ToolbarBlockOptionsComponent,
    ToolbarBlocksComponent,
  ],
  template: `
    <div class="toolbar-buttons-container">
      <div
        class="toolbar-buttons mat-elevation-z4"
        #blockListTigger="cdkOverlayOrigin"
        cdkOverlayOrigin
        matRipple
        (click)="openBlocksList()"
      >
        <span class="material-icons">add</span>
      </div>
      <div
        class="toolbar-buttons mat-elevation-z4"
        #blockOptionListTigger="cdkOverlayOrigin"
        cdkDragHandle
        cdkOverlayOrigin
        matRipple
        (click)="openBlockOptionList()"
      >
        <span class="material-icons">drag_indicator</span>
      </div>
    </div>

    <!-- Block type search list -->
    <ng-template
      cdkConnectedOverlay
      (overlayOutsideClick)="openBlocks.set(false)"
      [cdkConnectedOverlayOrigin]="blockListTigger"
      [cdkConnectedOverlayOpen]="openBlocks()"
      [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayOffsetY]="15"
      [cdkConnectedOverlayBackdropClass]="'cdk-overlay-transparent-backdrop'"
    >
      <toolbar-blocks
        [supportedBlocks]="supportedBlocks()"
        (addBlock)="addBlock($event)"
      ></toolbar-blocks>
    </ng-template>

    <!-- Options List-->
    <ng-template
      cdkConnectedOverlay
      (overlayOutsideClick)="openBlocksOption.set(false)"
      [cdkConnectedOverlayOrigin]="blockOptionListTigger"
      [cdkConnectedOverlayOpen]="openBlocksOption()"
      [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayOffsetX]="-49"
      [cdkConnectedOverlayOffsetY]="15"
      [cdkConnectedOverlayBackdropClass]="'cdk-overlay-transparent-backdrop'"
    >
      <toolbar-block-options
        [blockOptionActions]="blockOptionActions()"
        (handleAction)="handleAction($event)"
        (moveBlockPosition)="moveBlockPosition($event)"
      ></toolbar-block-options>
    </ng-template>
  `,
  styles: [
    `
      :host {
        .toolbar-buttons-container {
          position: relative;
          display: flex;
          gap: 10px;
        }
        .toolbar-buttons {
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 4px;
          margin-bottom: 14px;
          user-select: none;
          color: var(--mat-sys-on-tertiary-container);
          background: var(--mat-sys-tertiary-container);
        }
        .toolbar-buttons {
          &:hover,
          &:focus {
            background: var(--mat-sys-surface-bright);
          }
        }
      }
      @media (min-width: 768px) {
        :host {
          position: absolute;
          margin-left: -80px;
          top: 0;
        }
      }
    `,
  ],
})
export class ToolbarComponent {
  componentContextPositionIndex = input.required<number>();
  supportedBlocks = input.required<SupportedBlock[]>();
  blockOptionActions = input<BlockOptionAction[]>();
  actionCallback = input<(action: string) => void>(() => () => {});
  formControlName = input<string>();
  addBlockCallback = input.required<TAddBlockCallback>();
  moveBlockPositionCallback = input.required<TMoveBlockPositionCallback>();

  openBlocks = signal<boolean>(false);
  openBlocksOption = signal<boolean>(false);

  openBlocksList() {
    this.openBlocks.update((prev) => !prev);
  }

  openBlockOptionList() {
    this.openBlocksOption.update((prev) => !prev);
  }

  moveBlockPosition(action: MovePositionActions) {
    this.closeLists();
    this.moveBlockPositionCallback()(
      action,
      this.componentContextPositionIndex()
    );
  }

  handleAction(action: string) {
    this.closeLists();
    this.actionCallback()(action);
  }

  addBlock(block: Type<BlockComponent>) {
    this.closeLists();
    firstValueFrom(
      this.addBlockCallback()(block, this.componentContextPositionIndex())
    );
  }

  closeLists() {
    this.openBlocks.set(false);
    this.openBlocksOption.set(false);
  }
}

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
          background: var(--mat-sys-secondary-container);
          border-radius: 4px;
        }

        .block-list-panel {
          max-width: 280px;
          max-height: 240px;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          overflow: auto;
          color: var(--mat-sys-on-secondary-container);
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
  addBlockEmitter = output<Type<BlockComponent>>({ alias: 'addBlock' });
  supportedBlocks = input<SupportedBlock[]>([]);
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

  addBlock(block: SupportedBlock) {
    this.addBlockEmitter.emit(block?.component);
  }
}

@Component({
  selector: 'toolbar-block-options',
  imports: [MatIcon, MatRipple],
  template: `
    <div class="actions-panel mat-elevation-z24">
      <div class="action-btn" matRipple (click)="movePosition(Position.UP)">
        <mat-icon>arrow_upward</mat-icon>
      </div>
      <div class="action-btn" matRipple (click)="movePosition(Position.DELETE)">
        <mat-icon>delete</mat-icon>
      </div>
      <div class="action-btn" matRipple (click)="movePosition(Position.DOWN)">
        <mat-icon>arrow_downward</mat-icon>
      </div>
      @for(blockOptionAction of blockOptionActions(); track $index) {
      <div
        class="action-btn"
        (click)="handleAction(blockOptionAction.action)"
        matRipple
      >
        @if (blockOptionAction.text) {
        {{ blockOptionAction.text }}
        } @else {
        <mat-icon>{{ blockOptionAction.icon }}</mat-icon>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        .actions-panel {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 1px;
          width: 128px;
          max-height: 128px;
          border-radius: 4px;
          overflow: auto;
          background: var(--mat-sys-secondary);
          .action-btn {
            cursor: pointer;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;

            color: var(--mat-sys-on-secondary);
            background: var(--mat-sys-secondary);
            &:hover,
            &:focus {
              color: var(--mat-sys-secondary);
              background: var(--mat-sys-on-secondary);
            }
          }
        }
      }
    `,
  ],
})
export class ToolbarBlockOptionsComponent {
  readonly Position = MovePositionActions;

  blockOptionActions = input<BlockOptionAction[]>();

  handleActionEmitter = output<string>({ alias: 'handleAction' });
  moveBlockPositionEmitter = output<MovePositionActions>({
    alias: 'moveBlockPosition',
  });

  movePosition(action: MovePositionActions) {
    this.moveBlockPositionEmitter.emit(action);
  }

  handleAction(action: string) {
    this.handleActionEmitter.emit(action);
  }
}

@Component({
  selector: 'paragraph-block',
  host: { class: 'position-relative block cdk-drag-animating' },
  hostDirectives: [CdkDrag],
  imports: [
    ReactiveFormsModule,
    ControlAccessorDirective,
    AutofocusDirective,
    ToolbarFabDirective,
    NgClass,
  ],
  template: `
    <ng-container [formGroup]="formGroup()">
      <p
        controlAccessor
        contentEditable
        toolbarFab
        [ngClass]="className()"
        [defaultValue]="formGroup().get(formControlName())?.value"
        [actionCallback]="actionCallbackBind"
        [autofocus]="autofocus()"
        [blockOptionActions]="blockOptionActions()"
        [formControlName]="formControlName()"
        [componentContextPositionIndex]="sortIndex()"
      ></p>
    </ng-container>
  `,
  styles: [
    `
      :host {
        .small {
          font: var(--mat-sys-body-small);
        }
        .medium {
          font: var(--mat-sys-body-medium);
        }
        .large {
          font: var(--mat-sys-body-large);
        }
        .title-small {
          font: var(--mat-sys-title-small);
        }
        .title-medium {
          font: var(--mat-sys-title-medium);
        }
        .title-large {
          font: var(--mat-sys-title-large);
        }
      }
    `,
  ],
})
export class ParagraphBlockComponent implements BlockComponent {
  sortIndex = input<number>(0);
  autofocus = input<boolean>(true);
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  blockOptionActions = input<BlockOptionAction[]>([
    { action: 'small', icon: 'density_small' },
    { action: 'medium', icon: 'density_medium' },
    { action: 'large', icon: 'density_large' },
    { action: 'title-small', text: 'TS' },
    { action: 'title-medium', text: 'TM' },
    { action: 'title-large', text: 'TL' },
  ]);

  className = signal<string>('medium');
  actionCallbackBind = this.actionCallback.bind(this);

  actionCallback(action: string) {
    this.className.update(() => action);
  }
}

@Component({
  selector: 'header-block',
  host: { class: 'position-relative block cdk-drag-animating' },
  hostDirectives: [CdkDrag],
  imports: [
    ReactiveFormsModule,
    ControlAccessorDirective,
    AutofocusDirective,
    ToolbarFabDirective,
    CleanPasteDataDirective,
    NgSwitch,
    NgSwitchCase,
    NgTemplateOutlet,
  ],
  template: `
    <ng-container [ngSwitch]="selectedHeaderTag()">
      <h1 *ngSwitchCase="'h1'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h1>
      <h2 *ngSwitchCase="'h2'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h2>
      <h3 *ngSwitchCase="'h3'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h3>
      <h4 *ngSwitchCase="'h4'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h4>
      <h5 *ngSwitchCase="'h5'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h5>
      <h6 *ngSwitchCase="'h6'">
        <ng-container *ngTemplateOutlet="sharedHeaderTemplate"></ng-container>
      </h6>
    </ng-container>

    <ng-template [formGroup]="formGroup()" #sharedHeaderTemplate>
      <span
        controlAccessor
        cleanPasteData
        contentEditable
        toolbarFab
        [defaultValue]="formGroup().get(formControlName())?.value"
        [actionCallback]="actionCallbackBind"
        [blockOptionActions]="blockOptionActions()"
        [autofocus]="autofocus()"
        [formControlName]="formControlName()"
        [componentContextPositionIndex]="sortIndex()"
      ></span>
    </ng-template>
  `,
  styles: [
    `
      :host {
        :is(h1, h2, h3, h4, h5, h6) {
          margin: 0;
          span {
            display: block;
            line-height: inherit;
          }
        }

        h1 > * {
          font: var(--mat-sys-display-large);
        }
        h2 > * {
          font: var(--mat-sys-display-medium);
        }
        h3 > * {
          font: var(--mat-sys-display-small);
        }
        h4 > * {
          font: var(--mat-sys-headline-large);
        }
        h5 > * {
          font: var(--mat-sys-headline-medium);
        }
        h6 > * {
          font: var(--mat-sys-headline-small);
        }
      }
    `,
  ],
})
export class HeaderBlockComponent implements BlockComponent {
  sortIndex = input<number>(0);
  autofocus = input<boolean>(true);
  formGroup = input.required<FormGroup>();
  formControlName = input.required<string>();
  blockOptionActions = input<BlockOptionAction[]>([
    { action: 'h1', text: 'H1' },
    { action: 'h2', text: 'H2' },
    { action: 'h3', text: 'H3' },
    { action: 'h4', text: 'H4' },
    { action: 'h5', text: 'H5' },
    { action: 'h6', text: 'H6' },
  ]);

  selectedHeaderTag = signal<string>('h1');
  actionCallbackBind = this.actionCallback.bind(this);

  actionCallback(selectedAction: string) {
    this.selectedHeaderTag.set(selectedAction);
  }
}
