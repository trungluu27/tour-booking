"use client";

import { ButtonHTMLAttributes, forwardRef, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "accent" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  accent: "btn-accent",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading, icon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(variantClass[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.25"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
});

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  /** Class names for the actual <input> element (advanced). */
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, className, inputClassName, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400 [&_svg]:h-4 [&_svg]:w-4"
            aria-hidden
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "input",
            leftIcon && "pl-10",
            error && "border-red-300 focus:border-red-500 focus:ring-red-200",
            inputClassName,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="helper-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  /** Class names for the actual <textarea> element (advanced). */
  inputClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, className, inputClassName, id, ...props }, ref) {
    const inputId = id ?? props.name;
    return (
      <div className={cn("flex flex-col", className)}>
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "input min-h-[96px] resize-y",
            error && "border-red-300 focus:border-red-500 focus:ring-red-200",
            inputClassName,
          )}
          {...props}
        />
        {error && <p className="helper-error">{error}</p>}
      </div>
    );
  },
);

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  /** Class names for the actual <select> element (advanced). */
  inputClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, leftIcon, className, inputClassName, id, children, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400 [&_svg]:h-4 [&_svg]:w-4"
            aria-hidden
          >
            {leftIcon}
          </span>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "input appearance-none bg-white pr-9",
            leftIcon && "pl-10",
            error && "border-red-300 focus:border-red-500 focus:ring-red-200",
            inputClassName,
          )}
          {...props}
        >
          {children}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-slate-400"
          aria-hidden
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
      {error ? (
        <p className="helper-error">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "orange" | "slate" | "red";
}) {
  const toneClass: Record<string, string> = {
    blue: "bg-primary-50 text-primary-800 border-primary-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    orange: "bg-accent-50 text-accent-700 border-accent-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    red: "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {description && (
        <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
