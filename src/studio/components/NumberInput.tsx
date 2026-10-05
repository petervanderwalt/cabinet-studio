import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number;
  onValue: (value: number) => void;
  /** 'input' emits on every keystroke; 'change' waits for blur/Enter. */
  commitOn?: 'input' | 'change';
}

/**
 * Number field that keeps its own text while focused, so clearing or half-typing a value
 * doesn't get rewritten under the user's cursor. External changes sync in when it isn't focused.
 */
export function NumberInput({ value, onValue, commitOn = 'input', ...rest }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(String(value));

  useEffect(() => {
    if (ref.current !== document.activeElement) setText(String(value));
  }, [value]);

  const emit = (raw: string) => {
    const parsed = Number.parseFloat(raw);
    onValue(Number.isNaN(parsed) ? 0 : parsed);
  };

  return (
    <input
      {...rest}
      ref={ref}
      type="number"
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        if (commitOn === 'input') emit(event.target.value);
      }}
      onBlur={(event) => {
        if (commitOn === 'change') emit(event.target.value);
        setText(String(value));
        rest.onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (commitOn === 'change' && event.key === 'Enter') emit(event.currentTarget.value);
        rest.onKeyDown?.(event);
      }}
    />
  );
}
