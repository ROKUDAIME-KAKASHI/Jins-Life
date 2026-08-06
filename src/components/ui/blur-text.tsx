"use client";

import { motion } from "framer-motion";

export function BlurText({
  text,
  className = "",
  delay = 0,
  blur = "12px",
  duration = 0.8,
}: {
  text: string;
  className?: string;
  delay?: number;
  blur?: string;
  duration?: number;
}) {
  const characters = text.split("");

  return (
    <span className={className}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ filter: `blur(${blur})`, opacity: 0, y: 5 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{
            duration,
            delay: delay + index * 0.03,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
