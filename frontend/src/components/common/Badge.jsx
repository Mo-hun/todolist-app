export default function Badge({ color = 'gray', children }) {
  const colorClasses = {
    gray: 'bg-gray-100 text-text-secondary',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-brand-red',
    green: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClasses[color]}`}>
      {children}
    </span>
  );
}
