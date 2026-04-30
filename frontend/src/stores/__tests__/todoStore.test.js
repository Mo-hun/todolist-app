import { beforeEach, describe, expect, it } from 'vitest';
import useTodoStore from '../todoStore';

beforeEach(() => {
  useTodoStore.setState({ filter: 'all', sortBy: 'created_at' });
  localStorage.clear();
});

describe('todoStore', () => {
  it('초기 상태가 올바르다', () => {
    const { filter, sortBy } = useTodoStore.getState();
    expect(filter).toBe('all');
    expect(sortBy).toBe('created_at');
  });

  it('setFilter 호출 후 filter 상태가 변경된다', () => {
    const { setFilter } = useTodoStore.getState();
    setFilter('in_progress');
    expect(useTodoStore.getState().filter).toBe('in_progress');

    setFilter('completed');
    expect(useTodoStore.getState().filter).toBe('completed');

    setFilter('overdue');
    expect(useTodoStore.getState().filter).toBe('overdue');

    setFilter('all');
    expect(useTodoStore.getState().filter).toBe('all');
  });

  it('setSortBy 호출 후 sortBy 상태가 변경된다', () => {
    const { setSortBy } = useTodoStore.getState();
    setSortBy('due_date');
    expect(useTodoStore.getState().sortBy).toBe('due_date');

    setSortBy('title');
    expect(useTodoStore.getState().sortBy).toBe('title');

    setSortBy('created_at');
    expect(useTodoStore.getState().sortBy).toBe('created_at');
  });
});
