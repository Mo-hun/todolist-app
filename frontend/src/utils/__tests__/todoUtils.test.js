import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatDueDate,
  getTodoBadgeColor,
  getTodoColorClass,
  getTodoStatusLabel,
} from '../todoUtils';

const buildTodo = (overrides = {}) => ({
  id: 1,
  title: '할일',
  is_completed: false,
  is_overdue: false,
  is_due_soon: false,
  due_date: null,
  ...overrides,
});

describe('todoUtils', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('완료된 할일은 초록 배경과 취소선 클래스를 반환한다', () => {
    const className = getTodoColorClass(buildTodo({ is_completed: true }));
    expect(className).toContain('bg-green-50');
    expect(className).toContain('line-through');
    expect(className).toContain('text-gray-400');
  });

  it('기한초과 할일은 빨간 배경 클래스를 반환한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-29T12:00:00.000Z'));

    const className = getTodoColorClass(buildTodo({ due_date: '2026-04-28T10:00:00.000Z' }));
    expect(className).toContain('bg-red-50');
    expect(className).toContain('border-red-300');
  });

  it('기한임박 할일은 주황 배경 클래스를 반환한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-29T12:00:00.000Z'));

    const className = getTodoColorClass(buildTodo({ due_date: '2026-04-30T08:00:00.000Z' }));
    expect(className).toContain('bg-orange-50');
    expect(className).toContain('border-orange-300');
  });

  it('마감일이 없으면 기본 클래스를 반환한다', () => {
    expect(getTodoColorClass(buildTodo())).toBe('bg-white border-gray-200');
  });

  it('상태에 따라 적절한 Badge color와 label을 반환한다', () => {
    expect(getTodoBadgeColor(buildTodo())).toBe('gray');
    expect(getTodoStatusLabel(buildTodo())).toBe('진행중');
    expect(getTodoBadgeColor(buildTodo({ is_due_soon: true }))).toBe('orange');
    expect(getTodoStatusLabel(buildTodo({ is_due_soon: true }))).toBe('기한임박');
    expect(getTodoBadgeColor(buildTodo({ is_overdue: true }))).toBe('red');
    expect(getTodoStatusLabel(buildTodo({ is_overdue: true }))).toBe('기한초과');
    expect(getTodoBadgeColor(buildTodo({ is_completed: true }))).toBe('green');
    expect(getTodoStatusLabel(buildTodo({ is_completed: true }))).toBe('완료');
  });

  it('formatDueDate는 null과 실제 날짜를 처리한다', () => {
    expect(formatDueDate(null)).toBe('마감일 없음');
    expect(formatDueDate('2026-05-01T00:00:00.000Z')).toContain('마감:');
  });

  it('언어에 따라 상태 라벨과 마감일 문구를 현지화한다', () => {
    expect(getTodoStatusLabel(buildTodo({ is_completed: true }), 'en')).toBe('Completed');
    expect(getTodoStatusLabel(buildTodo({ is_due_soon: true }), 'ja')).toBe('期限間近');
    expect(formatDueDate(null, 'en')).toBe('No due date');
    expect(formatDueDate('2026-05-01T00:00:00.000Z', 'ja')).toContain('期限:');
  });
});
