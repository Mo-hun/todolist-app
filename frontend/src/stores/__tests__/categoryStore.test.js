import { beforeEach, describe, expect, it } from 'vitest';
import useCategoryStore from '../categoryStore';

beforeEach(() => {
  useCategoryStore.setState({ selectedCategoryId: null });
  localStorage.clear();
});

describe('categoryStore', () => {
  it('초기 상태가 올바르다', () => {
    const { selectedCategoryId } = useCategoryStore.getState();
    expect(selectedCategoryId).toBeNull();
  });

  it('selectCategory 호출 후 selectedCategoryId가 변경된다', () => {
    const { selectCategory } = useCategoryStore.getState();
    selectCategory(42);
    expect(useCategoryStore.getState().selectedCategoryId).toBe(42);

    selectCategory('uuid-1234');
    expect(useCategoryStore.getState().selectedCategoryId).toBe('uuid-1234');
  });

  it('clearCategory 호출 후 selectedCategoryId가 null로 복원된다', () => {
    const { selectCategory, clearCategory } = useCategoryStore.getState();
    selectCategory(42);
    clearCategory();
    expect(useCategoryStore.getState().selectedCategoryId).toBeNull();
  });
});
