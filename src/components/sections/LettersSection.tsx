"use client";

import { motion } from "framer-motion";
import { arabicLetters, cardColors } from "@/lib/constants";
import { speakText } from "@/lib/utils";

interface LettersSectionProps {
  selectedItem: number | null;
  onItemSelect: (index: number) => void;
}

export function LettersSection({
  selectedItem,
  onItemSelect,
}: LettersSectionProps) {
  return (
    <motion.div
      key="letters"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.h2
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-3xl md:text-4xl font-bold text-white text-center mb-8 drop-shadow-lg"
      >
        🔤 هيا نتعلم الحروف العربية!
      </motion.h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4 max-w-6xl mx-auto">
        {arabicLetters.map((item, index) => (
          <motion.button
            key={item.letter}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              onItemSelect(index);
              speakText(`${item.letter} ${item.example}`);
            }}
            className={`relative bg-gradient-to-br ${
              cardColors[index % cardColors.length]
            } p-4 md:p-6 rounded-2xl shadow-xl ${
              selectedItem === index ? "ring-4 ring-white ring-offset-4" : ""
            }`}
          >
            <span className="text-4xl md:text-6xl font-bold text-white block drop-shadow-lg">
              {item.letter}
            </span>
            <span className="text-3xl md:text-4xl mt-2 block">
              {item.emoji}
            </span>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-white/80 text-xl mt-8"
      >
        🔊 اضغط على الحرف لسماع نطقه مع الصورة!
      </motion.p>
    </motion.div>
  );
}
