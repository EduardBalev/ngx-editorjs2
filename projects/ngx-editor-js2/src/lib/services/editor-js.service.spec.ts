import { MockComponent } from 'ng-mocks';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorJsService } from './editor-js.service';
import { BlockMovementService } from './block-movement.service';
import { FormBuilder } from '@angular/forms';
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { of } from 'rxjs';
import {
  BlockComponent,
  NgxEditorJsBlockWithComponent,
  MovePositionActions,
} from '../ngx-editor-js2.interface';
import { HeaderBlockComponent } from '../components/blocks/header-block.component';

describe('EditorJsService', () => {
  let service: EditorJsService;
  let blockMovementServiceMock: jest.Mocked<BlockMovementService>;
  let ngxEditorMock: jest.Mocked<ViewContainerRef>;
  let fixture: ComponentFixture<HeaderBlockComponent>;
  let mockComponentRef: ComponentRef<HeaderBlockComponent>;

  beforeEach(() => {
    blockMovementServiceMock = {
      getNgxEditorJsBlocks: jest.fn().mockReturnValue(of([])),
      removeBlockComponent: jest.fn().mockReturnValue(of(null)),
      moveBlockComponentPosition: jest.fn().mockReturnValue(of(null)),
      updateComponentIndices: jest.fn().mockReturnValue(of(null)),
      newComponentAttached: jest.fn(),
      clearComponentRefs: jest.fn(),
    } as unknown as jest.Mocked<BlockMovementService>;

    ngxEditorMock = {
      createComponent: jest.fn(),
      move: jest.fn(),
      get: jest.fn(),
      clear: jest.fn(),
    } as unknown as jest.Mocked<ViewContainerRef>;

    TestBed.configureTestingModule({
      providers: [
        EditorJsService,
        { provide: BlockMovementService, useValue: blockMovementServiceMock },
        { provide: FormBuilder, useValue: new FormBuilder() },
      ],
    });

    service = TestBed.inject(EditorJsService);
    service.setNgxEditor(ngxEditorMock);

    fixture = TestBed.createComponent(MockComponent(HeaderBlockComponent));
    mockComponentRef = fixture.componentRef;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBlocks$', () => {
    it('should return an empty array when no blocks exist', (done) => {
      blockMovementServiceMock.getNgxEditorJsBlocks.mockReturnValue(of([]));

      service.getBlocks$().subscribe((blocks) => {
        expect(blocks).toEqual([]);
        done();
      });
    });

    // it('should return sorted blocks with correct data', (done) => {
    //   blockMovementServiceMock.getNgxEditorJsBlocks.mockReturnValue(
    //     of([mockComponentRef])
    //   );

    //   service.getBlocks$().subscribe((blocks) => {
    //     expect(blocks).toEqual([
    //       {
    //         blockId: 'mockBlockId',
    //         sortIndex: 0,
    //         componentInstanceName: 'MockBlockComponent',
    //         dataClean: 'mockData',
    //       },
    //     ]);
    //     done();
    //   });
    // });
  // });

  // describe('createNgxEditorJsBlockWithComponent', () => {
  //   it('should create a new NgxEditorJsBlockWithComponent', () => {
  //     const result = service.createNgxEditorJsBlockWithComponent(
  //       HeaderBlockComponent,
  //       1
  //     );
  //     expect(result).toEqual(
  //       of({
  //         blockId: expect.any(String),
  //         sortIndex: 1,
  //         componentInstanceName: 'MockBlockComponent',
  //         component: mockComponentRef,
  //         dataClean: '',
  //         autofocus: true,
  //       })
  //     );
  //   });
  // });

  // describe('addBlockComponent', () => {
  //   it('should call createFormGroupControl, attachComponent, and updateComponentIndices', (done) => {
  //     const block: NgxEditorJsBlockWithComponent = {
  //       blockId: 'testBlock',
  //       sortIndex: 0,
  //       componentInstanceName: 'MockBlockComponent',
  //       component: HeaderBlockComponent,
  //       dataClean: '',
  //     };

  //     service.addBlockComponent(block).subscribe(() => {
  //       expect(ngxEditorMock.createComponent).toHaveBeenCalled();
  //       expect(
  //         blockMovementServiceMock.updateComponentIndices
  //       ).toHaveBeenCalled();
  //       done();
  //     });
  //   });
  // });

  // describe('removeBlockComponent', () => {
  //   it('should call removeBlockComponent on blockMovementService', (done) => {
  //     service.removeBlockComponent(0, 'testBlock').subscribe(() => {
  //       expect(
  //         blockMovementServiceMock.removeBlockComponent
  //       ).toHaveBeenCalledWith(ngxEditorMock, 0, false);
  //       done();
  //     });
  //   });
  // });

  // describe('moveBlockComponentPosition', () => {
  //   it('should move a block to a new position', (done) => {
  //     service.moveBlockComponentPosition(1, 2).subscribe(() => {
  //       expect(ngxEditorMock.move).toHaveBeenCalled();
  //       expect(
  //         blockMovementServiceMock.updateComponentIndices
  //       ).toHaveBeenCalled();
  //       done();
  //     });
  //   });
  // });

  // describe('determineMovePositionAction', () => {
  //   it('should delete a block when action is DELETE', (done) => {
  //     service
  //       .determineMovePositionAction(MovePositionActions.DELETE, 0, 'testBlock')
  //       .subscribe(() => {
  //         expect(
  //           blockMovementServiceMock.removeBlockComponent
  //         ).toHaveBeenCalled();
  //         done();
  //       });
  //   });

  //   it('should move a block when action is MOVE_UP or MOVE_DOWN', (done) => {
  //     service
  //       .determineMovePositionAction(MovePositionActions.UP, 1, 'testBlock')
  //       .subscribe(() => {
  //         expect(
  //           blockMovementServiceMock.moveBlockComponentPosition
  //         ).toHaveBeenCalled();
  //         done();
  //       });
  //   });
  // });

  // describe('clearBlocks', () => {
  //   it('should clear all blocks and reset indices', (done) => {
  //     blockMovementServiceMock.getNgxEditorJsBlocks.mockReturnValue(
  //       of([mockComponentRef])
  //     );

  //     service.clearBlocks().subscribe(() => {
  //       expect(blockMovementServiceMock.clearComponentRefs).toHaveBeenCalled();
  //       expect(ngxEditorMock.clear).toHaveBeenCalled();
  //       done();
  //     });
  //   });
  });
});
