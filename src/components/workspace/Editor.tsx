import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
  fontSize: number;
}

export function Editor({ value, onChange, placeholder, fontSize }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  // Sync external value -> editor without resetting cursor on each keystroke
  useEffect(() => {
    if (!ref.current) return;
    if (value !== lastValueRef.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value;
      lastValueRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleInput() {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastValueRef.current = html;
    onChange(html);
  }

  const empty = !value || value === "<br>" || value === "<p></p>" || value.replace(/<[^>]+>/g, "").trim() === "";

  return (
    <div className="w-full">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-empty={empty}
        data-placeholder={placeholder}
        className="prose-manuscript min-h-[60vh] outline-none"
        style={{ fontSize: `${fontSize}px` }}
      />
    </div>
  );
}
