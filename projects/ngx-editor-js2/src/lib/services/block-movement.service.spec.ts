import { ComponentRef, ViewContainerRef } from '@angular/core';
import { BlockMovementService } from './block-movement.service';
import { BlockComponent, MovePositionActions } from '../ngx-editor-js2.interface';
import { of } from 'rxjs';

describe('BlockMovementService', () => {
  let service: BlockMovementService;
  let ngxEditorMock: jest.Mocked<ViewContainerRef>;
  let mockComponentRef: ComponentRef<BlockComponent>;

  beforeEach(() => {
    service = new BlockMovementService();

    // Mock ngxEditor
    ngxEditorMock = {
      length: 3,
      indexOf: jest.fn((view) => (view as any).mockIndex),
      move: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ViewContainerRef>;

    // Mock ComponentRef
    mockComponentRef = {
      instance: {},
      hostView: { mockIndex: 1 },
      setInput: jest.fn(),
    } as unknown as ComponentRef<BlockComponent>;
  });

  // ✅ 1. clearComponentRefs()
  it('should clear all component refs', () => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);
    service.clearComponentRefs();
    expect(service.componentRefMap.size).toBe(0);
  });

  // ✅ 2. getNgxEditorJsBlocks()
  it('should return all component refs', (done) => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);

    service.getNgxEditorJsBlocks().subscribe((blocks) => {
      expect(blocks).toEqual([mockComponentRef]);
      done();
    });
  });

  // ✅ 3. newComponentAttached()
  it('should add a component ref to componentRefMap', () => {
    service.newComponentAttached(mockComponentRef);
    expect(service.componentRefMap.has(mockComponentRef.instance)).toBe(true);
  });

  // ✅ 4. updateComponentIndices()
  it('should update component sort indices', (done) => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);

    service.updateComponentIndices(ngxEditorMock).subscribe(() => {
      expect(mockComponentRef.setInput).toHaveBeenCalledWith('sortIndex', 1);
      done();
    });
  });

  // ✅ 5. moveBlockComponentPosition()
  it('should move a block up when MovePositionActions.UP is used', (done) => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);
    jest.spyOn(ngxEditorMock, 'length', 'get').mockReturnValue(3);

    service.moveBlockComponentPosition(ngxEditorMock, MovePositionActions.UP, 2).subscribe(() => {
      expect(ngxEditorMock.move).toHaveBeenCalledWith(mockComponentRef.hostView, 0);
      expect(mockComponentRef.setInput).toHaveBeenCalledWith('sortIndex', 0);
      expect(mockComponentRef.setInput).toHaveBeenCalledWith('autofocus', true);
      done();
    });
  });

  it('should move a block down when MovePositionActions.DOWN is used', (done) => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);
    jest.spyOn(ngxEditorMock, 'length', 'get').mockReturnValue(3);

    service.moveBlockComponentPosition(ngxEditorMock, MovePositionActions.DOWN, 1).subscribe(() => {
      expect(ngxEditorMock.move).toHaveBeenCalledWith(mockComponentRef.hostView, 2);
      expect(mockComponentRef.setInput).toHaveBeenCalledWith('sortIndex', 2);
      expect(mockComponentRef.setInput).toHaveBeenCalledWith('autofocus', true);
      done();
    });
  });

  // ✅ 6. removeBlockComponent()
  it('should remove a block component from ngxEditor and componentRefMap', (done) => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);

    service.removeBlockComponent(ngxEditorMock, 2, false).subscribe(() => {
      expect(service.componentRefMap.has(mockComponentRef.instance)).toBe(false);
      expect(ngxEditorMock.remove).toHaveBeenCalledWith(1);
      done();
    });
  });

  it('should not remove the last component if clear is false', (done) => {
    service.componentRefMap.set(mockComponentRef.instance, mockComponentRef);

    service.removeBlockComponent(ngxEditorMock, 2, false).subscribe((result) => {
      expect(result).toBe(false);
      expect(ngxEditorMock.remove).not.toHaveBeenCalled();
      done();
    });
  });
});