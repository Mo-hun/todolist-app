import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Modal } from '@/components/common';
import { TodoForm, TodoList } from '@/components/todo';
import { LanguageSwitcher, DarkModeToggle } from '@/components/settings';
import { useGetCategories } from '@/hooks/useCategories';
import { useCreateTodoMutation, useGetTodos } from '@/hooks/useTodos';
import useAuthStore from '@/stores/authStore';
import useCategoryStore from '@/stores/categoryStore';
import useTodoStore from '@/stores/todoStore';
import useI18n from '@/hooks/useI18n';

const statusTabs = [
  { value: 'all', label: 'filter.all' },
  { value: 'in_progress', label: 'filter.active' },
  { value: 'completed', label: 'filter.completed' },
];

function groupTodos(todos) {
  return {
    active: todos.filter((todo) => !todo.is_completed),
    completed: todos.filter((todo) => todo.is_completed),
  };
}

export default function MainPage() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const selectedCategoryId = useCategoryStore((state) => state.selectedCategoryId);
  const selectCategory = useCategoryStore((state) => state.selectCategory);
  const filter = useTodoStore((state) => state.filter);
  const setFilter = useTodoStore((state) => state.setFilter);
  const sortBy = useTodoStore((state) => state.sortBy);
  const setSortBy = useTodoStore((state) => state.setSortBy);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { t } = useI18n();

  const { data: categories = [] } = useGetCategories();
  const { data, isLoading } = useGetTodos({
    filter,
    sortBy,
    categoryId: selectedCategoryId,
  });
  const { mutate: createTodo, isPending } = useCreateTodoMutation();

  const todos = useMemo(() => {
    const todoItems = data?.todos ?? [];
    const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

    return todoItems.map((todo) => ({
      ...todo,
      category_name: todo.category_id ? categoryMap.get(todo.category_id) ?? null : null,
    }));
  }, [categories, data?.todos]);
  const groupedTodos = useMemo(() => groupTodos(todos), [todos]);

  const emptyMessage = t('todo.emptyList');
  const hasAnyTodos = todos.length > 0;

  const handleCreate = (formData) => {
    createTodo(formData, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-border-grid px-4 py-4 sm:px-6 dark:border-gray-600">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-xl font-bold text-black dark:text-gray-100">TodoList</Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <DarkModeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-brand-blue dark:text-gray-400"
            >
              {t('nav.logout')} →
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div>
              <p className="mb-3 text-sm font-semibold text-black">{t('nav.categories')}</p>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                <button
                  type="button"
                  onClick={() => selectCategory(null)}
                  className={`rounded-md px-3 py-2 text-sm text-left transition-colors ${selectedCategoryId === null ? 'bg-brand-blue text-white' : 'bg-[#F2F2F7] text-black'}`}
                >
                  {t('filter.all')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    className={`rounded-md px-3 py-2 text-sm text-left transition-colors ${selectedCategoryId === category.id ? 'bg-brand-blue text-white' : 'bg-[#F2F2F7] text-black'}`}
                  >
                    {category.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => selectCategory('uncategorized')}
                  className={`rounded-md px-3 py-2 text-sm text-left transition-colors ${selectedCategoryId === 'uncategorized' ? 'bg-brand-blue text-white' : 'bg-[#F2F2F7] text-black'}`}
                >
                  {t('todo.uncategorized')}
                </button>
              </div>
            </div>

            <div className="hidden border-t border-border-grid pt-4 lg:block">
              <Link to="/categories" className="text-sm font-medium text-text-secondary hover:text-brand-blue">
                {t('nav.categories')} →
              </Link>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 border-b border-border-grid">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setFilter(tab.value)}
                    className={`pb-3 text-sm font-medium ${filter === tab.value ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-text-secondary dark:text-gray-400'}`}
                  >
                    {t(tab.label)}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  aria-label={t('todo.sortLabel')}
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-md border border-border-grid px-3 py-2 text-sm outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="created_at">{t('todo.sort.createdAt')}</option>
                  <option value="updated_at">{t('todo.sort.updatedAt')}</option>
                  <option value="due_date">{t('todo.sort.dueDate')}</option>
                </select>
                <Button onClick={() => setIsCreateModalOpen(true)} className="justify-center">
                  + {t('todo.addTodo')}
                </Button>
              </div>
            </div>

            {!hasAnyTodos && (
              <TodoList
                todos={[]}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
              />
            )}

            {hasAnyTodos && filter !== 'completed' && groupedTodos.active.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-black">
                  {t('filter.active')} ({groupedTodos.active.length})
                </p>
                <TodoList
                  todos={groupedTodos.active}
                  isLoading={false}
                  emptyMessage={emptyMessage}
                />
              </div>
            )}

            {hasAnyTodos && (filter === 'all' || filter === 'completed') && groupedTodos.completed.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-black">
                  {t('filter.completed')} ({groupedTodos.completed.length})
                </p>
                <TodoList
                  todos={groupedTodos.completed}
                  isLoading={false}
                  emptyMessage={emptyMessage}
                />
              </div>
            )}

            <div className="border-t border-border-grid pt-2 lg:hidden">
              <Link to="/categories" className="text-sm font-medium text-text-secondary hover:text-brand-blue">
                {t('nav.categories')} →
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('todo.createTitle')}>
        <TodoForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isPending={isPending}
        />
      </Modal>
    </div>
  );
}
