import Spinner from './Spinner';

export default function Button({ variant = 'primary', size = 'md', disabled, loading, children, onClick, type = 'button', className = '' }) {
  const variantClasses = {
    primary: 'bg-brand-blue text-white hover:opacity-90',
    secondary: 'bg-[#F2F2F7] text-black hover:bg-gray-200',
    danger: 'bg-brand-red text-white hover:opacity-90',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-md font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
