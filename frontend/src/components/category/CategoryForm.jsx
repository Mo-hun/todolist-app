import { useEffect, useRef, useState } from 'react';
import { Button, InputField } from '@/components/common';
import useI18n from '@/hooks/useI18n';

export default function CategoryForm({ initialName = '', onSubmit, onCancel, isPending }) {
  const [name, setName] = useState(initialName);
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);
  const { t } = useI18n();
  const isEditMode = initialName !== '';

  useEffect(() => {
    if (!isEditMode || !inputRef.current) return;
    inputRef.current.focus();
    inputRef.current.select();
  }, [isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError(t('category.nameError'));
      return;
    }
    setLocalError('');
    onSubmit(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InputField
        label={t('category.name')}
        ref={inputRef}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (localError) setLocalError('');
        }}
        placeholder={t('category.namePlaceholder')}
        error={localError}
        required
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" loading={isPending} disabled={isPending || !name.trim()}>
          {isEditMode ? t('common.save') : t('common.add')}
        </Button>
      </div>
    </form>
  );
}
