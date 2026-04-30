import { useState } from 'react';
import { Button, Modal } from '@/components/common';
import useI18n from '@/hooks/useI18n';
import CategoryForm from './CategoryForm';

export default function CategoryItem({ category, onUpdate, onDelete, isUpdating, isDeleting, updateError }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { t } = useI18n();

  const handleUpdate = (name) => {
    onUpdate(
      { id: category.id, data: { name } },
      { onSuccess: () => setIsEditModalOpen(false) }
    );
  };

  const handleDelete = () => {
    onDelete(
      category.id,
      { onSuccess: () => setIsDeleteModalOpen(false) }
    );
  };

  const todoCount = category.todoCount ?? category.todo_count;
  const hasLinkedTodos = Number(todoCount) > 0;
  const todoCountLabel = t('category.todoCount').replace('{count}', String(todoCount ?? 0));
  const movedWarning = t('category.deleteLinkedTodos').replace('{count}', String(todoCount ?? 0));

  return (
    <>
      <div className="rounded-md border border-border-grid bg-white px-4 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-black"># {category.name}</p>
            {todoCount !== undefined && (
              <p className="mt-1 text-xs text-text-secondary">{todoCountLabel}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
              {t('common.edit')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={t('category.editTitle')} size="sm">
        <CategoryForm
          initialName={category.name}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isPending={isUpdating}
        />
        {updateError && (
          <p className="mt-3 text-sm text-brand-red">
            {updateError.response?.data?.error?.message || t('category.updateError')}
          </p>
        )}
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('category.deleteTitle')} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-black">
            &quot;{category.name}&quot; {t('category.deleteConfirm')}
          </p>
          {hasLinkedTodos ? (
            <div className="rounded-md border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-black">
              <p>{movedWarning}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {t('category.deleteLinkedTodosNotice')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">{t('category.deleteNoLinkedTodos')}</p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
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
