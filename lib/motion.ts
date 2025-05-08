import { Variants } from "framer-motion";

interface StaggerContainerVariants {
  hidden: Variants;
  show: {
    transition: {
      staggerChildren: number;
    };
  };
}

interface FadeInVariants {
  hidden: Variants;
  show: Variants;
}

/**
 * Creates a staggered container animation
 * @param staggerChildren - The time between child animations
 * @returns Stagger container animation variants
 */
export const staggerContainer = (staggerChildren: number): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren,
    },
  },
});

/**
 * Creates a fade-in animation
 * @param direction - The direction to fade in from
 * @param type - The type of animation
 * @param delay - The delay before animation starts
 * @param duration - The duration of the animation
 * @returns Fade-in animation variants
 */
export const fadeIn = (
  direction: "up" | "down" | "left" | "right", 
  type: string, 
  delay: number, 
  duration: number
): Variants => {
  return {
    hidden: {
      x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
      y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        delay,
        duration,
        ease: "easeOut",
      },
    },
  };
}; 