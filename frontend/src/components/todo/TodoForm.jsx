import { useState } from 'react';
import { Button, InputField } from '@/components/common';
import { useGetCategories } from '@/hooks/useCategories';
import useI18n from '@/hooks/useI18n';

function toDateInputValue(value) {
  if (!value) return '';
  return value.slice(0, 10);
}

export default function TodoForm({ initialValues, onSubmit, onCancel, isPending }) {
  const { data: categories = [] } = useGetCategories();
  const { t } = useI18n();
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? '');
  const [dueDate, setDueDate] = useState(toDateInputValue(initialValues?.due_date));
  const [error, setError] = useState('');
  const isEditMode = Boolean(initialValues?.id);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError(t('todo.titleError'));
      return;
    }

    setError('');
    onSubmit({
      title: title.trim(),
      description: description.trim() || '',
      due_date: dueDate || '',
      category_id: categoryId || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        label={t('todo.titleLabel')}
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) setError('');
        }}
        error={error}
        placeholder={t('todo.titlePlaceholder')}
        required
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="todo-description" className="text-sm font-medium text-black">
          {t('todo.descriptionLabel')}
        </label>
        <textarea
          id="todo-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t('todo.descriptionPlaceholder')}
          className="min-h-24 rounded-md border border-border-grid px-3 py-2 text-sm outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="todo-category" className="text-sm font-medium text-black">
          {t('todo.categoryLabel')}
        </label>
        <select
          id="todo-category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded-md border border-border-grid px-3 py-2 text-sm outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue"
        >
          <option value="">{t('todo.categoryPlaceholder')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <InputField
        label={t('todo.dueDate')}
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" loading={isPending} disabled={isPending}>
          {isEditMode ? t('common.save') : t('common.add')}
        </Button>
      </div>
    </form>
  );
}
