"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  onClick,
  type = "button",
  ...rest
}: ButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-b from-gold-500 to-gold-600 text-sea-950 border-gold-400 shadow-lg hover:from-gold-400 hover:to-gold-500",
    secondary:
      "bg-sea-800/80 text-parchment border-gold-600/50 hover:bg-sea-700",
    ghost: "bg-transparent text-gold-400 border-transparent hover:bg-sea-800/50",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className="inline-block"
    >
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`rounded-lg border-2 font-display font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full ${variants[variant]} ${sizes[size]} ${className}`}
        {...rest}
      >
        {children}
      </button>
    </motion.div>
  );
}
