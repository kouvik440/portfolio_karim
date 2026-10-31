import type { PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: reduceMotion ? 0 : 0.48, ease: 'easeOut', delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}
