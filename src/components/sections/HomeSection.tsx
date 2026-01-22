"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Section } from "@/lib/constants";
import { speakText } from "@/lib/utils";

interface HomeSectionProps {
  onSectionSelect: (section: Section, msg: string) => void;
}

export function HomeSection({ onSectionSelect }: HomeSectionProps) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center"
    >
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-3xl md:text-5xl font-bold text-white text-center mb-8 md:mb-12 drop-shadow-lg"
      >
        مرحباً بك في عالم التعلم الممتع! 🎉
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl">
        <MenuButton
          icon="🔢"
          label="الأرقام"
          color="from-yellow-400 to-orange-500"
          delay={0.1}
          rotate={2}
          onClick={() => onSectionSelect("numbers", "هيا نتعلم الأرقام")}
        />
        <MenuButton
          icon="🔤"
          label="الحروف"
          color="from-emerald-400 to-teal-500"
          delay={0.2}
          rotate={-2}
          onClick={() => onSectionSelect("letters", "هيا نتعلم الحروف")}
        />
        <MenuButton
          icon="🦁"
          label="الحيوانات"
          color="from-pink-400 to-rose-500"
          delay={0.3}
          rotate={2}
          onClick={() => onSectionSelect("animals", "هيا نتعرف على الحيوانات")}
        />
        <Link href="/writing" className="h-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speakText("هيا نتعلم الكتابة")}
            className="group relative bg-gradient-to-br from-violet-400 to-purple-600 p-8 md:p-12 rounded-3xl shadow-2xl overflow-hidden h-full cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-8xl md:text-[10rem] block mb-4">✏️</span>
            <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg text-center block">
              تعلم الكتابة
            </span>
          </motion.div>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-white/80 text-xl">اضغط على أي قسم لبدء التعلم! 🎈</p>
      </motion.div>
    </motion.div>
  );
}

function MenuButton({
  icon,
  label,
  color,
  delay,
  rotate,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  delay: number;
  rotate: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, rotate }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`group relative bg-gradient-to-br ${color} p-8 md:p-12 rounded-3xl shadow-2xl overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="text-8xl md:text-[10rem] block mb-4">{icon}</span>
      <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
        {label}
      </span>
    </motion.button>
  );
}
