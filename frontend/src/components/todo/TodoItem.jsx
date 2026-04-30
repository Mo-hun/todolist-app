import { useState } from 'react';
import { Badge, Button, Modal } from '@/components/common';
import TodoForm from './TodoForm';
import useI18n from '@/hooks/useI18n';
import {
  formatDueDate,
  getTodoBadgeColor,
  getTodoColorClass,
  getTodoCompletedLabel,
  getTodoStatusLabel,
} from '@/utils/todoUtils';

export default function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  isToggling,
  isUpdating,
  isDeleting,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { t, language } = useI18n();

  const handleUpdate = (data) => {
    onUpdate(
      { id: todo.id, data },
      { onSuccess: () => setIsEditModalOpen(false) }
    );
  };

  const handleDelete = () => {
    onDelete(
      todo.id,
      { onSuccess: () => setIsDeleteModalOpen(false) }
    );
  };

  return (
    <>
      <article className={`rounded-md border px-4 py-4 shadow-sm ${getTodoColorClass(todo)}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <input
              type="checkbox"
              checked={todo.is_completed}
              onChange={() => onToggle(todo.id)}
              disabled={isToggling}
              aria-label={`${todo.title} ${t('todo.toggleLabel')}`}
              className="mt-1 h-4 w-4 rounded border-border-grid text-brand-blue focus:ring-brand-blue"
            />
            <div className="min-w-0">
              <p className={`text-sm font-medium text-black ${todo.is_completed ? 'line-through text-gray-400' : ''}`}>
                {todo.title}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {todo.category_name ? <Badge color="gray">#{todo.category_name}</Badge> : <Badge color="gray">#{t('todo.uncategorized')}</Badge>}
                <Badge color={getTodoBadgeColor(todo)}>{getTodoStatusLabel(todo, language)}</Badge>
                <span className="text-xs text-text-secondary">
                  {todo.is_completed ? getTodoCompletedLabel(language) : formatDueDate(todo.due_date, language)}
                </span>
              </div>
              {todo.description && (
                <p className="mt-2 text-sm text-text-secondary">{todo.description}</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 gap-2 self-end sm:self-start">
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
              {t('common.edit')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </article>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={t('todo.editTitle')}>
        <TodoForm
          initialValues={todo}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isPending={isUpdating}
        />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('todo.deleteTitle')} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-black">{t('todo.deleteWarning')}</p>
          <p className="text-sm text-text-secondary">&quot;{todo.title}&quot;</p>
          <p className="text-sm text-text-secondary">{t('todo.deleteDataWarning')}</p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" loading={isDeleting} onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
