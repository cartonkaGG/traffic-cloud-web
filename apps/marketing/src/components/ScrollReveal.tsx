import { motion, type Variants, type HTMLMotionProps } from 'motion/react';
import { type ReactNode } from 'react';

export type ScrollVariant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

const VARIANTS: Record<ScrollVariant, Variants> = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -32 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -36 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 36 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

const EASE = [0.22, 1, 0.36, 1] as const;

type ScrollRevealProps = {
  children: ReactNode;
  variant?: ScrollVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'initial' | 'whileInView' | 'viewport' | 'variants'>;

export function ScrollReveal({
  children,
  variant = 'up',
  delay = 0,
  duration = 0.75,
  className = '',
  once = true,
  amount = 0.18,
  ...rest
}: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={VARIANTS[variant]}
      transition={{ duration, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const STAGGER_PARENT: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  amount?: number;
};

export function ScrollRevealStagger({ children, className = '', amount = 0.12 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={STAGGER_PARENT}
    >
      {children}
    </motion.div>
  );
}
