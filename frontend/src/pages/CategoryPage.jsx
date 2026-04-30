import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal } from '@/components/common';
import { CategoryList, CategoryForm } from '@/components/category';
import { LanguageSwitcher, DarkModeToggle } from '@/components/settings';
import { useCreateCategoryMutation } from '@/hooks/useCategories';
import useI18n from '@/hooks/useI18n';

export default function CategoryPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { mutate: createCategory, isPending } = useCreateCategoryMutation();
  const { t } = useI18n();

  const handleCreate = (name) => {
    createCategory({ name }, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 sm:px-6 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-text-secondary transition-colors hover:text-brand-blue dark:text-gray-400"
        >
          ← {t('nav.home')}
        </Link>

        <section className="mt-4 rounded-2xl border border-border-grid bg-white p-5 shadow-sm sm:p-7 dark:border-gray-600 dark:bg-gray-800">
          <div className="flex flex-col gap-4 border-b border-border-grid pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-600">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-gray-100">{t('category.title')}</h1>
              <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">
                {t('category.description')}
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="justify-center">
              + {t('category.addCategory')}
            </Button>
          </div>

          <div className="py-6">
            <CategoryList />
          </div>

          <div className="rounded-xl border border-border-grid bg-[#FAFAFA] px-4 py-4 dark:border-gray-600 dark:bg-gray-700">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary dark:text-gray-400">{t('common.notice')}</p>
            <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">
              {t('category.deleteLinkedTodosNotice')}
            </p>
          </div>
        </section>

        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('category.addCategory')} size="sm">
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isPending={isPending}
          />
        </Modal>

        <div className="fixed right-4 top-4 flex gap-2">
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </div>
    </div>
  );
}
