import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'datetime-local';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  multiline?: boolean;
  rows?: number;
  min?: number;
  step?: number;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  multiline = false,
  rows = 3,
  min,
  step,
  className = ''
}) => {
  const baseInputClasses = `
    w-full
    px-4
    py-3
    bg-black/20
    border
    border-zinc-800/30
    rounded-xl
    text-white
    placeholder-zinc-400
    focus:outline-none
    focus:ring-2
    focus:ring-white/20
    focus:border-white/30
    transition-all
    duration-200
    ${type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}
    ${error ? 'border-red-500/50 focus:ring-red-500/20' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const labelClasses = `
    block
    text-sm
    font-medium
    text-white
    mb-2
    ${required ? "after:content-['*'] after:text-red-400 after:ml-1" : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="mb-4">
      <label htmlFor={name} className={labelClasses}>
        {label}
      </label>
      
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={baseInputClasses}
        />
      ) : type === 'number' ? (
        <div className="relative">
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            step={step}
            className={`${baseInputClasses} pr-10`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            <button 
              type="button"
              className="text-white/60 hover:text-white focus:outline-none p-1 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const inputEl = document.getElementById(name) as HTMLInputElement;
                const currentValue = parseFloat(inputEl.value) || 0;
                const step = parseFloat(inputEl.step) || 1;
                const newValue = currentValue + step;
                const event = {
                  target: { name, value: newValue.toString() }
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5L5 12H19L12 5Z" fill="currentColor" />
              </svg>
            </button>
            <button 
              type="button"
              className="text-white/60 hover:text-white focus:outline-none p-1 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const inputEl = document.getElementById(name) as HTMLInputElement;
                const currentValue = parseFloat(inputEl.value) || 0;
                const step = parseFloat(inputEl.step) || 1;
                const minValue = parseFloat(inputEl.min) || 0;
                const newValue = Math.max(minValue, currentValue - step);
                const event = {
                  target: { name, value: newValue.toString() }
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 19L19 12H5L12 19Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          step={step}
          className={baseInputClasses}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;