/** Primitivas de UI compartidas, con los tokens del design system. */
import type { CSSProperties, ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Card({ children, style, accent }: { children: ReactNode; style?: CSSProperties; accent?: string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        padding: 20,
        ...(accent ? { borderTop: `4px solid ${accent}` } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'ghost',
  disabled,
  style,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'teal' | 'ink' | 'ghost';
  disabled?: boolean;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  const base: CSSProperties = {
    borderRadius: 'var(--radius-control)',
    padding: '10px 18px',
    fontWeight: 600,
    fontSize: 14,
    border: '1px solid var(--rule)',
    background: '#fff',
    color: 'var(--ink)',
    opacity: disabled ? 0.5 : 1,
    transition: 'transform .12s ease',
  };
  const variants: Record<string, CSSProperties> = {
    teal: { background: 'var(--teal)', color: '#fff', border: 'none', boxShadow: 'var(--shadow-cta)' },
    ink: { background: 'var(--ink)', color: '#fff', border: 'none' },
    ghost: {},
  };
  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(e) => e.currentTarget.blur()}
      style={{ ...base, ...variants[variant], cursor: disabled ? 'default' : 'pointer', ...style }}
      className={variant === 'teal' ? 'cta-teal' : undefined}
    >
      {children}
    </button>
  );
}

export function Pill({ children, color = 'var(--slate)', bg = 'var(--bg-secondary)' }: { children: ReactNode; color?: string; bg?: string }) {
  return (
    <span
      className="mono"
      style={{ fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color, background: bg, padding: '3px 8px', borderRadius: 999 }}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  error,
  ok,
  note,
  noteColor,
  borderColor,
  ...props
}: {
  label: string;
  error?: string;
  ok?: string;
  note?: string;
  noteColor?: string;
  borderColor?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5, color: 'var(--slate)' }}>{label}</span>
      <input
        {...props}
        style={{
          width: '100%',
          padding: '9px 11px',
          borderRadius: 'var(--radius-cell)',
          border: `1px solid ${borderColor || 'var(--rule)'}`,
          background: '#fff',
          outline: 'none',
        }}
      />
      {error && <span style={{ display: 'block', fontSize: 12, color: 'var(--rose)', marginTop: 4 }}>{error}</span>}
      {ok && !error && <span style={{ display: 'block', fontSize: 12, color: 'var(--teal)', marginTop: 4 }}>{ok}</span>}
      {note && !error && <span style={{ display: 'block', fontSize: 12, color: noteColor || '#8b9099', marginTop: 4 }}>{note}</span>}
    </label>
  );
}

export function TextArea({ style, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%',
        minHeight: 96,
        padding: '10px 12px',
        borderRadius: 'var(--radius-cell)',
        border: '1px solid var(--rule)',
        resize: 'vertical',
        outline: 'none',
        ...style,
      }}
    />
  );
}

/** Hallazgo de agente: borde izquierdo del color del agente, sin caja (README §Forma). */
export function AgentFinding({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12, margin: '8px 0', fontSize: 13, color: 'var(--ink)' }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 20, marginBottom: 4 }}>{children}</h2>;
}
