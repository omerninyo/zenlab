import React from 'react';

/**
 * Zen Design System - HollowButton
 * Canonical hollow glass buttons adhering to the 6px rectangular radius.
 * Strictly no glowing neon or capsule/pill shapes.
 * 
 * Props:
 * - variant: 'base' | 'primary'
 * - icon: LucideIcon component (optional)
 * - iconPosition: 'start' | 'end'
 * - children: React.ReactNode
 * - onClick: (e) => void
 * - className?: string
 * - disabled?: boolean
 */
export default function HollowButton({
  variant = 'base',
  icon: Icon,
  iconPosition = 'start',
  children,
  onClick,
  className = '',
  disabled = false,
  ...props
}) {
  const baseClass = variant === 'primary' ? 'btn-hollow-primary' : 'btn-hollow';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} disabled:opacity-40 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'start' && <Icon className="w-4 h-4 shrink-0" />}
      {children && <span>{children}</span>}
      {Icon && iconPosition === 'end' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
