import React from 'react';

/**
 * Zen Design System - SegmentedControl
 * Apple-style specular segmented switch with 6px outer container and 4px active pill.
 * 
 * Props:
 * - options: Array<{ id: string, label: string, icon?: LucideIcon }>
 * - value: string
 * - onChange: (id: string) => void
 * - className?: string
 */
export default function SegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
}) {
  return (
    <div className={`segmented-glass-container ${className}`} role="tablist">
      {options.map((opt) => {
        const isActive = opt.id === value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`segmented-glass-item ${
              isActive ? 'segmented-glass-item-active' : ''
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
