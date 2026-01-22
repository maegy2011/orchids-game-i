"use client";

import { motion } from "framer-motion";
import { animals, cardColors } from "@/lib/constants";
import { speakText } from "@/lib/utils";

export function AnimalsSection() {
  const mammals = animals.filter((a) => a.category === "حيوان");
  const birds = animals.filter((a) => a.category === "طائر");

  return (
    <motion.div
      key="animals"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.h2
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-3xl md:text-4xl font-bold text-white text-center mb-8 drop-shadow-lg"
      >
        🦁 الحيوانات والطيور وأصواتها!
      </motion.h2>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4 text-center">🐾 الحيوانات</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto">
          {mammals.map((item, index) => (
            <AnimalCard key={item.name} item={item} index={index} colorIndex={index % cardColors.length} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-4 text-center">🐦 الطيور</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto">
          {birds.map((item, index) => (
            <AnimalCard key={item.name} item={item} index={index} colorIndex={(index + 3) % cardColors.length} delayOffset={0.3} />
          ))}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-white/80 text-xl mt-8"
      >
        🔊 اضغط على الحيوان أو الطائر لسماع اسمه وصوته!
      </motion.p>
    </motion.div>
  );
}

function AnimalCard({ 
  item, 
  index, 
  colorIndex, 
  delayOffset = 0 
}: { 
  item: any, 
  index: number, 
  colorIndex: number, 
  delayOffset?: number 
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 + delayOffset }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => speakText(`${item.name}، صوته ${item.sound}`)}
      className={`bg-gradient-to-br ${cardColors[colorIndex]} p-4 md:p-6 rounded-2xl shadow-xl`}
    >
      <span className="text-5xl md:text-7xl block">{item.emoji}</span>
      <span className="text-lg md:text-xl font-bold text-white mt-2 block">{item.name}</span>
      <span className="text-sm md:text-base text-white/80 block">{item.sound}</span>
    </motion.button>
  );
}
