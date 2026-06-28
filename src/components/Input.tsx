import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label?: string;
  type?: string;
  options?: { value: string; label: string }[];
  isTextArea?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  options,
  isTextArea = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="form-group">
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      
      {options ? (
        <select
          id={inputId}
          className={`form-input ${className}`}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0d1224' }}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : isTextArea ? (
        <textarea
          id={inputId}
          className={`form-input ${className}`}
          rows={4}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          className={`form-input ${className}`}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
};
