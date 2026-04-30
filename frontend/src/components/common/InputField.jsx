import { forwardRef } from 'react';

const InputField = forwardRef(function InputField({ label, error, id, ...inputProps }, ref) {
  const inputId = id || label;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-black">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-blue transition-colors ${
          error ? 'border-brand-red focus:ring-brand-red' : 'border-border-grid focus:border-brand-blue'
        }`}
        {...inputProps}
      />
      {error && <p className="text-xs text-brand-red">{error}</p>}
    </div>
  );
});

export default InputField;
