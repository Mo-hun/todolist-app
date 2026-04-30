import useI18n from '@/hooks/useI18n';

export default function Spinner({ size = 'md' }) {
  const { t } = useI18n();
  const sizeClasses = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-8 h-8' };
  return (
    <span
      className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin inline-block`}
      role="status"
      aria-label={t('common.loading')}
    />
  );
}
