import { cn } from '@/utils/cn';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glow?: 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'none';
  onClick?: () => void;
}

const glowColors = {
  purple: 'shadow-purple-500/20',
  blue: 'shadow-blue-500/20',
  green: 'shadow-green-500/20',
  orange: 'shadow-orange-500/20',
  pink: 'shadow-pink-500/20',
  none: ''
};

export function GlassCard({ 
  children, 
  className, 
  glow = 'none',
  onClick,
  ...props 
}: GlassCardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-white/10 to-white/5",
        "backdrop-blur-xl border border-white/10",
        "shadow-xl",
        glow !== 'none' && glowColors[glow],
        onClick && "cursor-pointer active:brightness-95",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
