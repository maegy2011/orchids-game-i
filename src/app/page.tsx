"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  arabicNumbers, 
  arabicLetters, 
  englishNumbers,
  englishLetters,
  animals, 
  cardColors 
} from "@/lib/data";
import { useSpeech } from "@/hooks/use-speech";
import { usePexels } from "@/hooks/use-pexels";

type Section = "home" | "arabic-numbers" | "arabic-letters" | "english-numbers" | "english-letters" | "animals";

const blobShapes = [
  "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]",
  "rounded-[50%_50%_30%_70%/50%_50%_70%_30%]",
  "rounded-[70%_30%_30%_70%/70%_30%_70%_30%]",
  "rounded-[30%_70%_50%_50%/50%_30%_70%_50%]",
];

export default function Home() {
  const [currentSection, setCurrentSection] = useState<Section>("home");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: "video" | "photo"; label: string } | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const { speak } = useSpeech();
  const { searchMedia, loading: mediaLoading } = usePexels();

  const handleItemClick = async (query: string, speakText: string, index: number, label?: string, isEnglish?: boolean) => {
    setSelectedItem(index);
    speak(speakText, isEnglish ? "en-US" : "ar-SA");
    setActiveMedia(null);
    setMediaError(null);

    const videoData = await searchMedia(query, "videos");
    if (videoData?.error === "Missing API Key") {
      setMediaError("يرجى إضافة مفتاح Pexels API لتتمكن من رؤية الفيديوهات والصور.");
      return;
    }

    const itemLabel = label || speakText.split("،")[0];

    if (videoData?.videos?.[0]) {
      const video = videoData.videos[0];
      const bestFile = video.video_files.find((f: any) => f.quality === "hd") || video.video_files[0];
      setActiveMedia({ url: bestFile.link, type: "video", label: itemLabel });
    } else {
      const photoData = await searchMedia(query, "photos");
      if (photoData?.photos?.[0]) {
        setActiveMedia({ url: photoData.photos[0].src.large2x, type: "photo", label: itemLabel });
      }
    }
  };

  useEffect(() => {
    if (currentSection === "home") {
      speak("أهلاً بك! اختر ماذا تريد أن تتعلم اليوم");
    }
  }, [currentSection, speak]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  return (
    <div
      className="min-h-screen overflow-hidden select-none"
      style={{
        fontFamily: "'Fredoka', 'Tajawal', sans-serif",
        background: "linear-gradient(135deg, #00B4DB 0%, #0083B0 50%, #FFD700 100%)",
        WebkitTouchCallout: "none",
      }}
    >
      {/* Google Font Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;700&family=Tajawal:wght@400;700&display=swap');
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              background: `hsl(${Math.random() * 360}, 70%, 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <header className="relative z-10 p-4 md:p-6">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between max-w-7xl mx-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentSection("home");
              setSelectedItem(null);
              setActiveMedia(null);
            }}
            className="flex items-center gap-3 text-white drop-shadow-lg"
          >
            <span className="text-5xl">🎈</span>
            <span className="text-2xl md:text-4xl font-black">
              عالم الصغار
            </span>
          </motion.button>

          {currentSection !== "home" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setCurrentSection("home");
                setSelectedItem(null);
                setActiveMedia(null);
              }}
              className="bg-white/40 backdrop-blur-md text-white px-6 py-2 rounded-full font-black text-xl shadow-xl border-4 border-white/50"
            >
              🏠 الرئيسية
            </motion.button>
          )}
        </motion.div>
      </header>

      <main className="relative z-10 container mx-auto px-4 pb-12">
        <AnimatePresence>
          {(mediaLoading || activeMedia || mediaError) && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-12 max-w-5xl mx-auto"
            >
              <div className="bg-white/30 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white/30 p-4">
                <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black/40 flex items-center justify-center">
                  {mediaLoading ? (
                    <div className="flex flex-col items-center gap-6">
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                          scale: { duration: 1, repeat: Infinity }
                        }}
                        className="text-8xl"
                      >
                        🎨
                      </motion.div>
                      <p className="text-white font-black text-3xl animate-pulse">جاري التحضير...</p>
                    </div>
                  ) : mediaError ? (
                    <div className="text-center text-white p-8">
                      <span className="text-8xl mb-4 block">💡</span>
                      <p className="text-3xl font-black mb-4">خطوة واحدة باقية!</p>
                      <p className="text-xl opacity-90 leading-relaxed max-w-md mx-auto font-bold">{mediaError}</p>
                    </div>
                  ) : activeMedia ? (
                    <>
                      {activeMedia.type === "video" ? (
                        <video
                          src={activeMedia.url}
                          autoPlay
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={activeMedia.url}
                          alt={activeMedia.label}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute bottom-6 left-6 right-6 flex items-center justify-between"
                      >
                        <div className="bg-white/90 backdrop-blur-md px-10 py-4 rounded-3xl border-4 border-white/50 shadow-2xl">
                          <h2 className="text-rose-500 text-4xl md:text-6xl font-black drop-shadow-sm">
                            {activeMedia.label}
                          </h2>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setActiveMedia(null)}
                          className="bg-white/50 backdrop-blur-md text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl border-4 border-white/60"
                        >
                          ✕
                        </motion.button>
                      </motion.div>
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentSection === "home" && (
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
                className="text-4xl md:text-6xl font-black text-white text-center mb-12 drop-shadow-2xl"
              >
                مرحباً بك يا بطل! 🎉
              </motion.h1>

              <div className="flex overflow-x-auto gap-8 w-full max-w-7xl mx-auto pb-12 scrollbar-hide snap-x px-4">
                {[
                  { id: "arabic-letters", name: "الحروف العربية", emoji: "🔤", color: "from-emerald-400 to-teal-500" },
                  { id: "arabic-numbers", name: "الأرقام العربية", emoji: "🔢", color: "from-yellow-400 to-orange-500" },
                  { id: "english-letters", name: "English Letters", emoji: "🅰️", color: "from-blue-400 to-indigo-500" },
                  { id: "english-numbers", name: "English Numbers", emoji: "🔟", color: "from-pink-400 to-rose-500" },
                  { id: "animals", name: "الحيوانات", emoji: "🦁", color: "from-violet-400 to-purple-600" },
                ].map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 3 : -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentSection(item.id as Section);
                      speak(item.name);
                    }}
                    className={`group relative bg-gradient-to-br ${item.color} ${blobShapes[i % blobShapes.length]} p-12 shadow-2xl min-w-[300px] snap-center shrink-0 border-8 border-white/40`}
                  >
                    <span className="text-[10rem] block mb-6 filter drop-shadow-xl">{item.emoji}</span>
                    <span className="text-4xl font-black text-white drop-shadow-lg">
                      {item.name}
                    </span>
                  </motion.button>
                ))}

                <Link href="/writing" className="snap-center shrink-0">
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => speak("هيا نتعلم الكتابة")}
                    className={`group relative bg-gradient-to-br from-rose-400 to-pink-600 ${blobShapes[0]} p-12 shadow-2xl h-full cursor-pointer min-w-[300px] border-8 border-white/40`}
                  >
                    <span className="text-[10rem] block mb-6 filter drop-shadow-xl">✏️</span>
                    <span className="text-4xl font-black text-white drop-shadow-lg">
                      تعلم الكتابة
                    </span>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Sections Rendering */}
          {["arabic-numbers", "arabic-letters", "english-numbers", "english-letters", "animals"].includes(currentSection) && (
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl md:text-5xl font-black text-white text-center mb-12 drop-shadow-2xl capitalize"
              >
                {currentSection === "arabic-numbers" && "🔢 الأرقام العربية"}
                {currentSection === "arabic-letters" && "🔤 الحروف العربية"}
                {currentSection === "english-numbers" && "🔟 English Numbers"}
                {currentSection === "english-letters" && "🅰️ English Letters"}
                {currentSection === "animals" && "🦁 الحيوانات وأصواتها"}
              </motion.h2>

              <div className="flex overflow-x-auto gap-6 pb-12 px-6 scrollbar-hide snap-x">
                {currentSection === "arabic-numbers" && arabicNumbers.map((item, index) => (
                  <motion.button
                    key={item.value}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleItemClick(item.searchQuery, item.name, index, item.number)}
                    className={`relative bg-white/90 ${blobShapes[index % blobShapes.length]} p-10 shadow-xl min-w-[220px] snap-center shrink-0 border-8 border-white/30`}
                  >
                    <span className={`text-8xl font-black block drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-br ${cardColors[index % cardColors.length]}`}>{item.number}</span>
                    <span className="text-6xl mt-4 block">{item.emoji}</span>
                  </motion.button>
                ))}

                {currentSection === "arabic-letters" && arabicLetters.map((item, index) => (
                  <motion.button
                    key={item.letter}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleItemClick(item.searchQuery, `${item.letter} ${item.example}`, index, item.letter)}
                    className={`relative bg-white/90 ${blobShapes[index % blobShapes.length]} p-8 shadow-xl min-w-[200px] snap-center shrink-0 border-8 border-white/30`}
                  >
                    <span className={`text-8xl font-black block drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-br ${cardColors[index % cardColors.length]}`}>{item.letter}</span>
                    <span className="text-5xl mt-4 block">{item.emoji}</span>
                  </motion.button>
                ))}

                {currentSection === "english-numbers" && englishNumbers.map((item, index) => (
                  <motion.button
                    key={item.char}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleItemClick(item.searchQuery, item.name, index, item.char, true)}
                    className={`relative bg-white/90 ${blobShapes[index % blobShapes.length]} p-10 shadow-xl min-w-[220px] snap-center shrink-0 border-8 border-white/30`}
                  >
                    <span className={`text-8xl font-black block drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-br ${cardColors[index % cardColors.length]}`}>{item.char}</span>
                    <span className="text-6xl mt-4 block">{item.emoji}</span>
                  </motion.button>
                ))}

                {currentSection === "english-letters" && englishLetters.map((item, index) => (
                  <motion.button
                    key={item.char}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleItemClick(item.searchQuery, `${item.char} for ${item.example}`, index, item.char, true)}
                    className={`relative bg-white/90 ${blobShapes[index % blobShapes.length]} p-8 shadow-xl min-w-[200px] snap-center shrink-0 border-8 border-white/30`}
                  >
                    <span className={`text-8xl font-black block drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-br ${cardColors[index % cardColors.length]}`}>{item.char}</span>
                    <span className="text-5xl mt-4 block">{item.emoji}</span>
                  </motion.button>
                ))}

                {currentSection === "animals" && animals.map((item, index) => (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleItemClick(item.searchQuery, `${item.name}، صوته ${item.sound}`, index, item.name)}
                    className={`bg-gradient-to-br ${cardColors[index % cardColors.length]} ${blobShapes[index % blobShapes.length]} p-10 shadow-xl min-w-[250px] snap-center shrink-0 border-8 border-white/30`}
                  >
                    <span className="text-[8rem] block mb-4">{item.emoji}</span>
                    <span className="text-3xl font-black text-white block">{item.name}</span>
                    <span className="text-xl font-bold text-white/80 block mt-2">{item.sound}</span>
                  </motion.button>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white font-black text-2xl mt-8 drop-shadow-lg"
              >
                🔊 اضغط للمفاجأة والتعلم! ⭐
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 text-center py-12">
        <div className="bg-white/20 backdrop-blur-md inline-block px-8 py-3 rounded-full border-4 border-white/30 shadow-xl">
          <p className="text-white font-black text-xl">صُنع بـ ❤️ لأبطالنا الصغار</p>
        </div>
      </footer>
    </div>
  );
}
