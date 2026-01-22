"use client";

import { motion } from "framer-motion";
import { Section } from "@/lib/constants";

interface HeaderProps {
  currentSection: Section;
  onHomeClick: () => void;
}

export function Header({ currentSection, onHomeClick }: HeaderProps) {
  return (
    <header className="relative z-10 p-4 md:p-6">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onHomeClick}
          className="flex items-center gap-2 text-white"
        >
          <span className="text-4xl md:text-5xl">🌟</span>
          <span className="text-xl md:text-3xl font-bold drop-shadow-lg">
            تعلم مع أصدقائي
          </span>
        </motion.button>

        {currentSection !== "home" && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onHomeClick}
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-lg shadow-lg"
          >
            🏠 الرئيسية
          </motion.button>
        )}
      </motion.div>
    </header>
  );
}
