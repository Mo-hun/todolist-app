import { Spinner } from '@/components/common';
import { useGetCategories, useUpdateCategoryMutation, useDeleteCategoryMutation } from '@/hooks/useCategories';
import useI18n from '@/hooks/useI18n';
import CategoryItem from './CategoryItem';

export default function CategoryList() {
  const { data: categories = [], isLoading } = useGetCategories();
  const { mutate: updateCategory, isPending: isUpdating, error: updateError } = useUpdateCategoryMutation();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategoryMutation();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border-grid bg-[#FAFAFA] px-6 py-10 text-center">
        <p className="text-sm text-text-secondary">
          {t('category.emptyList')}. {t('category.emptyHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          updateError={updateError}
        />
      ))}
    </div>
  );
}
