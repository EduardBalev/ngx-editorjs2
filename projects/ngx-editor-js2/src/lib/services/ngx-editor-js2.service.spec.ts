// import { TestBed } from '@angular/core/testing';
// import { NgxEditorJs2Service, NGX_EDITORJS_OPTIONS } from './ngx-editor-js2.service';
// import { EditorJsService } from './editor-js.service';
// import { BehaviorSubject, of } from 'rxjs';
// import { SupportedBlock, NgxEditorJsBlock, BlockComponent, NgxEditorJsBlockWithComponent } from '../ngx-editor-js2.interface';
// import { HeaderBlockComponent } from '../components/blocks/header-block.component';
// import { ParagraphBlockComponent } from '../components/blocks/paragraph-block.component';
// import { FormControl } from '@angular/forms';
// import { ComponentRef } from '@angular/core';

// describe('NgxEditorJs2Service', () => {
//   let service: NgxEditorJs2Service;
//   let editorJsServiceSpy: jasmine.SpyObj<EditorJsService>;

//   beforeEach(() => {
//     // Mock the EditorJsService
//     const editorJsSpy = jasmine.createSpyObj('EditorJsService', ['clearBlocks', 'addBlockComponent']);

//     TestBed.configureTestingModule({
//       providers: [
//         NgxEditorJs2Service,
//         { provide: EditorJsService, useValue: editorJsSpy },
//         {
//           provide: NGX_EDITORJS_OPTIONS,
//           useValue: { consumerSupportedBlocks: [] },
//         },
//       ],
//     });

//     service = TestBed.inject(NgxEditorJs2Service);
//     editorJsServiceSpy = TestBed.inject(EditorJsService) as jasmine.SpyObj<EditorJsService>;

//     // Mock Observables
//     editorJsServiceSpy.clearBlocks.and.returnValue(of(null));
//     editorJsServiceSpy.addBlockComponent.and.returnValue(of([new FormControl<string | null>(null), {} as ComponentRef<BlockComponent>, {}]));
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   it('should initialize with default supported blocks', (done) => {
//     service.supportedBlocks$.subscribe((blocks) => {
//       expect(blocks.length).toBe(2);
//       expect(blocks.some((b) => b.name === 'Paragraph')).toBeTrue();
//       expect(blocks.some((b) => b.name === 'Header')).toBeTrue();
//       done();
//     });
//   });

//   it('should load default blocks when no blocks are provided', () => {
//     const result = service.determineToloadDefaultBlocks([]);
//     expect(result.length).toBe(1);
//     expect(result[0].componentInstanceName).toBe('HeaderBlockComponent');
//   });

//   it('should remove duplicate blocks with the same ID', () => {
//     const blocks: NgxEditorJsBlockWithComponent[] = [
//       { blockId: '1', sortIndex: 0, componentInstanceName: 'HeaderBlockComponent', dataClean: '', savedAction: '', component: HeaderBlockComponent },
//       { blockId: '1', sortIndex: 1, componentInstanceName: 'HeaderBlockComponent', dataClean: '', savedAction: '', component: HeaderBlockComponent },
//     ];

//     const result = service.removeDuplicateBlocksWithSameIds(blocks);
//     expect(result.length).toBe(1);
//   });

//   it('should sort blocks by sortIndex', () => {
//     const blocks: NgxEditorJsBlock[] = [
//       { blockId: '2', sortIndex: 2, componentInstanceName: 'HeaderBlockComponent', dataClean: '', savedAction: '' },
//       { blockId: '1', sortIndex: 0, componentInstanceName: 'ParagraphBlockComponent', dataClean: '', savedAction: '' },
//       { blockId: '3', sortIndex: 1, componentInstanceName: 'HeaderBlockComponent', dataClean: '', savedAction: '' },
//     ];

//     const result = service.sortBlocks(blocks);
//     expect(result[0].blockId).toBe('1');
//     expect(result[1].blockId).toBe('3');
//     expect(result[2].blockId).toBe('2');
//   });

//   it('should merge internal and consumer-supported blocks', (done) => {
//     service.consumerSupportedBlocks.next([
//       { name: 'CustomBlock', componentInstanceName: 'CustomBlockComponent', component: HeaderBlockComponent },
//     ]);

//     service.supportedBlocks$.subscribe((blocks) => {
//       expect(blocks.length).toBe(3);
//       expect(blocks.some((b) => b.name === 'CustomBlock')).toBeTrue();
//       done();
//     });
//   });

//   it('should create a lookup map for supported blocks', () => {
//     const supportedBlocks: SupportedBlock[] = [
//       { name: 'Paragraph', componentInstanceName: 'ParagraphBlockComponent', component: ParagraphBlockComponent },
//       { name: 'Header', componentInstanceName: 'HeaderBlockComponent', component: HeaderBlockComponent },
//     ];

//     const result = service.createALookupMapForSupportedBlocks([], supportedBlocks);
//     expect(result.supportedBlocksMap.has('ParagraphBlockComponent')).toBeTrue();
//     expect(result.supportedBlocksMap.has('HeaderBlockComponent')).toBeTrue();
//   });

//   it('should find and assign components to blocks', () => {
//     const blocks: NgxEditorJsBlock[] = [
//       { blockId: '1', sortIndex: 0, componentInstanceName: 'HeaderBlockComponent', dataClean: '', savedAction: '' },
//     ];

//     const supportedBlocksMap = new Map<string, any>();
//     supportedBlocksMap.set('HeaderBlockComponent', HeaderBlockComponent);

//     const result = service.findAndMarshalBlocksComponent(blocks, supportedBlocksMap);
//     expect(result[0].component).toBe(HeaderBlockComponent);
//   });

//   it('should clear blocks from EditorJsService', (done) => {
//     service.clearBlocksFromEditorJs([]).subscribe(() => {
//       expect(editorJsServiceSpy.clearBlocks).toHaveBeenCalled();
//       done();
//     });
//   });

//   it('should add blocks to EditorJsService', (done) => {
//     const blocks: NgxEditorJsBlockWithComponent[] = [
//       { blockId: '1', sortIndex: 0, componentInstanceName: 'HeaderBlockComponent', dataClean: '', savedAction: '' },
//     ].map((block) => ({
//       ...block,
//       component: HeaderBlockComponent,
//     }));

//     service.addBlocksToEditorJs(blocks).subscribe(() => {
//       expect(editorJsServiceSpy.addBlockComponent).toHaveBeenCalledTimes(1);
//       done();
//     });
//   });
// });