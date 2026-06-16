import React, { useState, useId } from 'react';
import Icon from './Icons';

export default function FloatingLabelInput({
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  required,
  maxLength,
  children,
  className = '',
  style = {},
  onKeyDown,
  inputStyle = {},
  rightElement,
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value !== '';
  const isFloating = focused || hasValue;

  return (
    <div className={`floating-label-group ${className}`} style={{ marginBottom: 18, ...style }}>
      <div
        className={`floating-label-input ${error ? 'has-error' : ''} ${focused ? 'is-focused' : ''} ${hasValue ? 'has-value' : ''}`}
        style={{ position: 'relative' }}
      >
        {icon && (
          <span className="floating-label-icon">
            <Icon name={icon} size="sm" />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          maxLength={maxLength}
          placeholder={placeholder || label}
          className={`fl-input ${icon ? 'has-icon' : ''}`}
          style={inputStyle}
          autoComplete="off"
        />
        <label htmlFor={id} className={`fl-label ${icon ? 'flabel-has-icon' : ''} ${isFloating ? 'floating' : ''}`}>
          {label}
          {required && <span className="fl-required">*</span>}
        </label>
        {rightElement && (
          <div className="fl-right">{rightElement}</div>
        )}
      </div>
      {error && (
        <div className="fl-error">
          <Icon name="alertTriangle" size="xs" />
          <span>{error}</span>
        </div>
      )}
      {hint && !error && (
        <div className="fl-hint">{hint}</div>
      )}
      {children}
    </div>
  );
}

export function FloatingLabelPhone({
  label,
  value,
  onChange,
  error,
  required,
  onKeyDown,
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value !== '';
  const isFloating = focused || hasValue;

  return (
    <div className="floating-label-group" style={{ marginBottom: 18 }}>
      <div
        className={`floating-label-input ${error ? 'has-error' : ''} ${focused ? 'is-focused' : ''} ${hasValue ? 'has-value' : ''}`}
        style={{ position: 'relative', display: 'flex' }}
      >
        <div className="fl-phone-prefix">
          <Icon name="globe" size="xs" /> +998
        </div>
        <input
          id={id}
          type="tel"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          maxLength={12}
          placeholder={'90 123 45 67'}
          className="fl-input fl-input-phone"
          autoComplete="off"
        />
        <label htmlFor={id} className={`fl-label ${isFloating ? 'floating' : ''}`} style={{ left: isFloating ? 16 : 80 }}>
          {label}
          {required && <span className="fl-required">*</span>}
        </label>
      </div>
      {error && (
        <div className="fl-error">
          <Icon name="alertTriangle" size="xs" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
