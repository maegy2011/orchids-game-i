"use client";

import { motion } from "framer-motion";
import { arabicNumbers, cardColors } from "@/lib/constants";
import { speakText } from "@/lib/utils";

interface NumbersSectionProps {
  selectedItem: number | null;
  onItemSelect: (index: number) => void;
}

export function NumbersSection({
  selectedItem,
  onItemSelect,
}: NumbersSectionProps) {
  return (
    <motion.div
      key="numbers"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.h2
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-3xl md:text-4xl font-bold text-white text-center mb-8 drop-shadow-lg"
      >
        🔢 هيا نتعلم الأرقام العربية!
      </motion.h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto">
        {arabicNumbers.map((item, index) => (
          <motion.button
            key={item.value}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              onItemSelect(index);
              speakText(item.name);
            }}
            className={`relative bg-gradient-to-br ${
              cardColors[index % cardColors.length]
            } p-6 md:p-8 rounded-2xl shadow-xl ${
              selectedItem === index ? "ring-4 ring-white ring-offset-4" : ""
            }`}
          >
            <span className="text-5xl md:text-7xl font-bold text-white block drop-shadow-lg">
              {item.number}
            </span>
            <span className="text-lg md:text-xl font-bold text-white/90 mt-2 block">
              {item.name}
            </span>
            <div className="absolute -top-2 -right-2 bg-white text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
              {item.value}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-white/80 text-xl mt-8"
      >
        🔊 اضغط على الرقم لسماع نطقه!
      </motion.p>
    </motion.div>
  );
}
