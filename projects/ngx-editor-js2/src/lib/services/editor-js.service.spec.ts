import { MockComponent } from 'ng-mocks';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorJsService } from './editor-js.service';
import { BlockMovementService } from './block-movement.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
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

    fixture = TestBed.createComponent(HeaderBlockComponent);
    mockComponentRef = fixture.componentRef;
    // Create a mock FormGroup
    const mockFormGroup = new FormGroup({
      mockBlockId: new FormControl('mockData'),
    });

    mockComponentRef.setInput('formControlName', 'mockBlockId');
    mockComponentRef.setInput('formGroup', mockFormGroup);
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

    it('should return sorted blocks with correct data', (done) => {
      // Arrange: Mock component references in unsorted order
      const mockComponentRef1 = {
        instance: {
          formControlName: jest.fn().mockReturnValue('block1'),
          sortIndex: jest.fn().mockReturnValue(2), // Higher index (should be sorted last)
          constructor: { name: 'BMockBlockComponent' },
          formGroup: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({ value: 'data1' }),
          }),
        },
      } as unknown as ComponentRef<BlockComponent>;

      const mockComponentRef2 = {
        instance: {
          formControlName: jest.fn().mockReturnValue('block2'),
          sortIndex: jest.fn().mockReturnValue(1), // Lower index (should be sorted first)
          constructor: { name: 'AMockBlockComponent' },
          formGroup: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({ value: 'data2' }),
          }),
        },
      } as unknown as ComponentRef<BlockComponent>;

      // Mock getNgxEditorJsBlocks to return the blocks in unsorted order
      blockMovementServiceMock.getNgxEditorJsBlocks.mockReturnValue(
        of([mockComponentRef1, mockComponentRef2]) // Unsorted
      );

      // Act
      service.getBlocks$().subscribe((blocks) => {
        // Assert: Blocks should be sorted by `sortIndex`
        expect(blocks).toEqual([
          {
            blockId: 'block2', // This should be first (sortIndex = 1)
            sortIndex: 1,
            componentInstanceName: 'MockBlockComponent',
            dataClean: 'data2',
          },
          {
            blockId: 'block1', // This should be second (sortIndex = 2)
            sortIndex: 2,
            componentInstanceName: 'MockBlockComponent',
            dataClean: 'data1',
          },
        ]);
        done();
      });
    });
  });

  describe('createNgxEditorJsBlockWithComponent', () => {
    it('should create a new NgxEditorJsBlockWithComponent', async () => {
      const result = await firstValueFrom(
        service.createNgxEditorJsBlockWithComponent(HeaderBlockComponent, 0)
      );

      expect(result).toEqual({
        blockId: expect.any(String), // Allow any dynamically generated UID
        sortIndex: 0, // The passed index should match
        componentInstanceName: 'HeaderBlockComponent',
        component: HeaderBlockComponent, // Expect component class/type, not instance
        dataClean: '',
        autofocus: true,
      });
    });
  });

  describe('addBlockComponent', () => {
    it('should call createFormGroupControl, attachComponent, and updateComponentIndices with correct args', (done) => {
      // Arrange - Mock block
      const block: NgxEditorJsBlockWithComponent = {
        blockId: 'testBlock',
        sortIndex: 0,
        componentInstanceName: 'MockBlockComponent',
        component: HeaderBlockComponent,
        dataClean: '',
        autofocus: true,
      };

      // Mock FormControl
      const mockFormControl = new FormControl<string | null>('mockValue');

      // Mock ComponentRef
      const mockComponentRef = {
        instance: {}, // Fake instance of component
      } as ComponentRef<BlockComponent>;

      // Mock dependencies
      jest
        .spyOn(service, 'createFormGroupControl')
        .mockReturnValue(of(mockFormControl));
      jest
        .spyOn(service, 'attachComponent')
        .mockReturnValue(of(mockComponentRef));
      jest
        .spyOn(blockMovementServiceMock, 'updateComponentIndices')
        .mockReturnValue(of(void 0));

      // Act - Call the function
      service.addBlockComponent(block).subscribe(() => {
        // Assert - Verify that each method was called with the expected arguments
        expect(service.createFormGroupControl).toHaveBeenCalledWith(block);
        expect(service.attachComponent).toHaveBeenCalledWith(block);
        expect(
          blockMovementServiceMock.updateComponentIndices
        ).toHaveBeenCalledWith(service.ngxEditor);

        done();
      });
    });
  });

  describe('removeBlockComponent', () => {
    it('should call removeBlockComponent on blockMovementService', (done) => {
      service.removeBlockComponent(0, 'testBlock').subscribe(() => {
        expect(
          blockMovementServiceMock.removeBlockComponent
        ).toHaveBeenCalledWith(ngxEditorMock, 0, false);
        done();
      });
    });
  });

  describe('moveBlockComponentPosition', () => {
    it('should move a block to a new position', (done) => {
      // Arrange: Mock ViewRef (or whatever `get()` should return)
      const mockViewRef = mockComponentRef.hostView;

      // Mock ngxEditor.get to return the mockViewRef
      jest.spyOn(ngxEditorMock, 'get').mockReturnValue(mockViewRef);

      // Spy on ngxEditor.move
      jest.spyOn(ngxEditorMock, 'move').mockImplementation();

      // Mock updateComponentIndices to return an observable
      jest
        .spyOn(blockMovementServiceMock, 'updateComponentIndices')
        .mockReturnValue(of(void 0));

      // Act
      service.moveBlockComponentPosition(1, 2).subscribe(() => {
        // Assert
        expect(ngxEditorMock.get).toHaveBeenCalledWith(1); // Ensure get() is called with the correct index
        expect(ngxEditorMock.move).toHaveBeenCalledWith(mockViewRef, 2); // Ensure move() is called correctly
        expect(
          blockMovementServiceMock.updateComponentIndices
        ).toHaveBeenCalledWith(service.ngxEditor); // Ensure indices update

        done();
      });
    });
  });

  describe('determineMovePositionAction', () => {
    it('should delete a block when action is DELETE', (done) => {
      service
        .determineMovePositionAction(MovePositionActions.DELETE, 0, 'testBlock')
        .subscribe(() => {
          expect(
            blockMovementServiceMock.removeBlockComponent
          ).toHaveBeenCalled();
          done();
        });
    });

    it('should move a block when action is MOVE_UP or MOVE_DOWN', (done) => {
      service
        .determineMovePositionAction(MovePositionActions.UP, 1, 'testBlock')
        .subscribe(() => {
          expect(
            blockMovementServiceMock.moveBlockComponentPosition
          ).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('clearBlocks', () => {
    it('should clear all blocks, sort them correctly, and reset indices', (done) => {
      // Arrange - Mock component references with different sortIndex values
      const mockComponentRef1 = {
        instance: {
          sortIndex: jest.fn().mockReturnValue(2), // Higher index
          formControlName: jest.fn().mockReturnValue('block2'),
        },
      } as unknown as ComponentRef<BlockComponent>;

      const mockComponentRef2 = {
        instance: {
          sortIndex: jest.fn().mockReturnValue(1), // Lower index
          formControlName: jest.fn().mockReturnValue('block1'),
        },
      } as unknown as ComponentRef<BlockComponent>;

      // Mock getNgxEditorJsBlocks() to return unsorted component refs
      blockMovementServiceMock.getNgxEditorJsBlocks.mockReturnValue(
        of([mockComponentRef1, mockComponentRef2]) // Unsorted order
      );

      // Spy on removeBlockComponent to track call order and return correct type
      const removeBlockSpy = jest
        .spyOn(service, 'removeBlockComponent')
        .mockReturnValue(of([true, void 0] as [boolean, void])); // ✅ Correct tuple type

      // Spy on updateComponentIndices
      jest
        .spyOn(blockMovementServiceMock, 'updateComponentIndices')
        .mockReturnValue(of(void 0));

      // Act
      service.clearBlocks().subscribe(() => {
        // Assert - Ensure sorting is correct and removeBlockComponent is called in order
        expect(removeBlockSpy).toHaveBeenNthCalledWith(
          1,
          1 + 1, // Lower index (1) first, so we expect removeBlockComponent(2, "block1", true)
          'block1',
          true
        );
        expect(removeBlockSpy).toHaveBeenNthCalledWith(
          2,
          2 + 1, // Higher index (2) second, so we expect removeBlockComponent(3, "block2", true)
          'block2',
          true
        );

        // Ensure final cleanup methods are called
        expect(blockMovementServiceMock.clearComponentRefs).toHaveBeenCalled();
        expect(ngxEditorMock.clear).toHaveBeenCalled();

        done();
      });
    });
  });

  describe('attachComponent', () => {
    it('should create and attach a component with correct inputs', (done) => {
      // Arrange - Mock ComponentRef
      const mockComponentInstance = {
        actionCallback: jest.fn(),
      };

      const mockComponentRef = {
        instance: mockComponentInstance,
        setInput: jest.fn(), // Spy on setInput
      } as unknown as ComponentRef<BlockComponent>;

      // Mock ngxEditor.createComponent to return mockComponentRef
      jest
        .spyOn(ngxEditorMock, 'createComponent')
        .mockReturnValue(mockComponentRef);

      // Spy on blockMovementService.newComponentAttached
      jest.spyOn(blockMovementServiceMock, 'newComponentAttached');

      // Create test input
      const block: NgxEditorJsBlockWithComponent = {
        blockId: 'testBlock',
        sortIndex: 1,
        componentInstanceName: 'MockBlockComponent',
        component: HeaderBlockComponent,
        dataClean: '',
        autofocus: true,
        savedAction: 'mockAction', // Mock action for testing
      };

      // Act
      service.attachComponent(block).subscribe((result) => {
        // Assert
        expect(ngxEditorMock.createComponent).toHaveBeenCalledWith(
          HeaderBlockComponent,
          { index: 1 }
        );
        expect(mockComponentRef.setInput).toHaveBeenCalledWith('sortIndex', 1);
        expect(mockComponentRef.setInput).toHaveBeenCalledWith(
          'formGroup',
          service.formGroup
        );
        expect(mockComponentRef.setInput).toHaveBeenCalledWith(
          'formControlName',
          'testBlock'
        );
        expect(mockComponentRef.setInput).toHaveBeenCalledWith(
          'autofocus',
          true
        );

        // Verify action callback is called if savedAction is set
        expect(mockComponentInstance.actionCallback).toHaveBeenCalledWith(
          'mockAction'
        );

        // Verify newComponentAttached is called with the componentRef
        expect(
          blockMovementServiceMock.newComponentAttached
        ).toHaveBeenCalledWith(mockComponentRef);

        // Ensure correct value is returned
        expect(result).toBe(mockComponentRef);

        done();
      });
    });
  });

  describe('createFormGroupControl', () => {
    let formBuilderMock: Partial<FormBuilder>;
    let formGroupMock: Partial<FormGroup>;

    beforeEach(() => {
      // Manually mock FormBuilder
      formBuilderMock = {
        control: jest.fn((value) => new FormControl(value)), // Return real FormControl
      };

      // Manually mock FormGroup
      formGroupMock = {
        addControl: jest.fn(), // Spy on addControl
      } as Partial<FormGroup>;

      // Assign mocks to the service
      service.formBuilder = formBuilderMock as FormBuilder;
      service.formGroup = formGroupMock as FormGroup;
    });

    it('should create a new form control and add it to the form group', (done) => {
      // Arrange: Test block data
      const block: NgxEditorJsBlockWithComponent = {
        blockId: 'testBlock',
        sortIndex: 0,
        componentInstanceName: 'MockBlockComponent',
        component: HeaderBlockComponent,
        dataClean: 'mockData',
        autofocus: true,
      };

      // Act
      service.createFormGroupControl(block).subscribe((formControl) => {
        // Assert: Ensure form control is created with correct data
        expect(formControl.value).toBe('mockData');

        // Ensure formGroup.addControl is called with correct arguments
        expect(formGroupMock.addControl).toHaveBeenCalledWith(
          'testBlock',
          formControl
        );

        done();
      });
    });
  });
});
