"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  arabicLetters, 
  arabicNumbers, 
  englishLetters, 
  englishNumbers 
} from "@/lib/data";
import { useSpeech } from "@/hooks/use-speech";
import { usePexels } from "@/hooks/use-pexels";

type Category = "arabic-letters" | "arabic-numbers" | "english-letters" | "english-numbers";
type Result = "correct" | "close" | "wrong" | null;

interface DrawPoint {
  x: number;
  y: number;
}

const categories: { id: Category; name: string; emoji: string; color: string; shape: string }[] = [
  { id: "arabic-letters", name: "الحروف العربية", emoji: "🔤", color: "from-emerald-400 to-teal-500", shape: "rounded-[3rem] rotate-2" },
  { id: "arabic-numbers", name: "الأرقام العربية", emoji: "🔢", color: "from-yellow-400 to-orange-500", shape: "rounded-[4rem] -rotate-2" },
  { id: "english-letters", name: "الحروف الإنجليزية", emoji: "🅰️", color: "from-blue-400 to-indigo-500", shape: "rounded-[2.5rem] rotate-1" },
  { id: "english-numbers", name: "الأرقام الإنجليزية", emoji: "🔟", color: "from-pink-400 to-rose-500", shape: "rounded-full -rotate-1" },
];

function getCharacterSet(category: Category) {
  switch (category) {
    case "arabic-letters":
      return arabicLetters.map(l => ({ 
        char: l.letter, 
        name: l.name, 
        example: l.example, 
        emoji: l.emoji,
        searchQuery: l.searchQuery 
      }));
    case "arabic-numbers":
      return arabicNumbers.map(n => ({ 
        char: n.number, 
        name: n.name, 
        emoji: n.emoji,
        searchQuery: n.searchQuery 
      }));
    case "english-letters":
      return englishLetters;
    case "english-numbers":
      return englishNumbers;
  }
}

export default function WritingGame() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<Result>(null);
  const [score, setScore] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<DrawPoint[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[]>([]);
  const [showHint, setShowHint] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image" | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateCanvasRef = useRef<HTMLCanvasElement>(null);
  const { speak } = useSpeech();
  const { searchMedia, loading: mediaLoading } = usePexels();

  const getCurrentChar = useCallback(() => {
    if (!selectedCategory) return null;
    const chars = getCharacterSet(selectedCategory);
    return chars[currentIndex];
  }, [selectedCategory, currentIndex]);

  const fetchMedia = useCallback(async () => {
    const char = getCurrentChar();
    if (!char) return;

    setMediaUrl(null);
    setMediaType(null);

    const query = (char as any).searchQuery || char.example || char.name || char.char;
    
    const videoData = await searchMedia(query, "videos");
    if (videoData && videoData.videos && videoData.videos.length > 0) {
      const video = videoData.videos[0];
      const bestFile = video.video_files.find((f: any) => f.quality === "sd") || video.video_files[0];
      setMediaUrl(bestFile.link);
      setMediaType("video");
    } else {
      const photoData = await searchMedia(query, "photos");
      if (photoData && photoData.photos && photoData.photos.length > 0) {
        setMediaUrl(photoData.photos[0].src.large || photoData.photos[0].src.medium);
        setMediaType("image");
      }
    }
  }, [getCurrentChar, searchMedia]);

  const drawTemplate = useCallback(() => {
    const canvas = templateCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const char = getCurrentChar();
    if (!char) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (showHint) {
      ctx.fillStyle = "rgba(100, 100, 100, 0.15)";
      ctx.font = `bold ${canvas.width * 0.7}px Tajawal, Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char.char, canvas.width / 2, canvas.height / 2);
    }
  }, [getCurrentChar, showHint]);

  useEffect(() => {
    drawTemplate();
    if (selectedCategory) {
      fetchMedia();
    }
  }, [drawTemplate, fetchMedia, currentIndex, selectedCategory, showHint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#FF6B6B";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    drawnPoints.forEach((stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });

    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }
  }, [drawnPoints, currentStroke]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): DrawPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    if (point) {
      setCurrentStroke([point]);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const point = getCanvasPoint(e);
    if (point) {
      setCurrentStroke((prev) => [...prev, point]);
    }
  };

  const handleEnd = () => {
    if (currentStroke.length > 0) {
      setDrawnPoints((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke([]);
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setDrawnPoints([]);
    setCurrentStroke([]);
    setResult(null);
  };

  const analyzeDrawing = (): Result => {
    const canvas = canvasRef.current;
    const templateCanvas = templateCanvasRef.current;
    if (!canvas || !templateCanvas) return "wrong";

    const ctx = canvas.getContext("2d");
    const templateCtx = templateCanvas.getContext("2d");
    if (!ctx || !templateCtx) return "wrong";

    const char = getCurrentChar();
    if (!char) return "wrong";

    templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    templateCtx.fillStyle = "black";
    templateCtx.font = `bold ${templateCanvas.width * 0.7}px Tajawal, Arial`;
    templateCtx.textAlign = "center";
    templateCtx.textBaseline = "middle";
    templateCtx.fillText(char.char, templateCanvas.width / 2, templateCanvas.height / 2);

    const templateData = templateCtx.getImageData(0, 0, templateCanvas.width, templateCanvas.height).data;
    const drawnData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let templatePixels = 0;
    let matchedPixels = 0;
    let drawnPixels = 0;
    let outsidePixels = 0;

    const tolerance = 40;

    for (let i = 0; i < templateData.length; i += 4) {
      const templateAlpha = templateData[i + 3];
      const drawnAlpha = drawnData[i + 3];

      if (templateAlpha > 50) {
        templatePixels++;
        if (drawnAlpha > 50) {
          matchedPixels++;
        }
      }

      if (drawnAlpha > 50) {
        drawnPixels++;
        if (templateAlpha < 50) {
          let foundNearby = false;
          const x = (i / 4) % canvas.width;
          const y = Math.floor(i / 4 / canvas.width);

          for (let dx = -tolerance; dx <= tolerance && !foundNearby; dx++) {
            for (let dy = -tolerance; dy <= tolerance && !foundNearby; dy++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                const ni = (ny * canvas.width + nx) * 4;
                if (templateData[ni + 3] > 50) {
                  foundNearby = true;
                }
              }
            }
          }
          if (!foundNearby) {
            outsidePixels++;
          }
        }
      }
    }

    if (drawnPixels < templatePixels * 0.05) return "wrong";

    const coverageRatio = matchedPixels / templatePixels;
    const outsideRatio = outsidePixels / drawnPixels;

    if (coverageRatio > 0.3 && outsideRatio < 0.6) return "correct";
    if (coverageRatio > 0.15 && outsideRatio < 0.8) return "close";
    return "wrong";
  };

  const checkDrawing = () => {
    const drawingResult = analyzeDrawing();
    setResult(drawingResult);

    if (drawingResult === "correct") {
      setScore((prev) => prev + 10);
      speak("ممتاز! رسم رائع");
    } else if (drawingResult === "close") {
      setScore((prev) => prev + 5);
      speak("قريب جداً! بطل");
    } else {
      speak("حاول مرة أخرى يا بطل");
    }
  };

  const nextChar = () => {
    if (!selectedCategory) return;
    const chars = getCharacterSet(selectedCategory);
    setCurrentIndex((prev) => (prev + 1) % chars.length);
    clearCanvas();
  };

  const prevChar = () => {
    if (!selectedCategory) return;
    const chars = getCharacterSet(selectedCategory);
    setCurrentIndex((prev) => (prev - 1 + chars.length) % chars.length);
    clearCanvas();
  };

  const speakCurrentChar = useCallback(() => {
    const char = getCurrentChar();
    if (!char) return;
    
    const isEnglish = selectedCategory?.startsWith("english");
    const textToSpeak = (char as any).example ? `${char.char} ${(char as any).example}` : `${char.char} ${char.name}`;
    speak(textToSpeak, isEnglish ? "en-US" : "ar-SA");
  }, [getCurrentChar, selectedCategory, speak]);

  useEffect(() => {
    if (selectedCategory) {
      speakCurrentChar();
    }
  }, [currentIndex, selectedCategory, speakCurrentChar]);

  const currentChar = getCurrentChar();

  useEffect(() => {
    if (!selectedCategory) {
      speak("هيا بنا نتعلم الكتابة! اختر قسماً لنبدأ المغامرة");
    }
  }, [selectedCategory, speak]);

  return (
    <div
      className="min-h-screen overflow-hidden select-none"
      style={{
        fontFamily: "'Fredoka', 'Tajawal', sans-serif",
        background: "linear-gradient(135deg, #00B4DB 0%, #0083B0 50%, #FFD700 100%)",
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
            className="absolute opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 40 + 20}px`,
            }}
            animate={{
              y: [0, -40, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            >
              {["⭐", "🎈", "🎨", "✏️", "🎈", "☀️"][i % 6]}
            </motion.div>
        ))}
      </div>

      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <motion.span 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl md:text-6xl"
            >
              🚀
            </motion.span>
            <span className="text-2xl md:text-4xl font-black text-white drop-shadow-lg tracking-tight">
              نادي الكتابة
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {selectedCategory && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-white/90 backdrop-blur-sm text-rose-500 px-6 py-2 rounded-full font-black text-xl shadow-xl border-4 border-rose-200"
              >
                🏆 {score}
              </motion.div>
            )}
            <Link
              href="/"
              className="bg-white text-rose-500 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-transform active:scale-95 border-4 border-rose-200"
            >
              🏠
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div
              key="category-select"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-4xl md:text-6xl font-black text-white text-center mb-12 drop-shadow-2xl">
                ماذا سنكتب اليوم؟ 🎨
              </h1>

                <div className="flex overflow-x-auto gap-8 w-full max-w-6xl mx-auto pb-8 scrollbar-hide snap-x px-4">
                  {categories.map((cat, index) => (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentIndex(0);
                      }}
                      className={`group relative bg-gradient-to-br ${cat.color} ${cat.shape} p-10 shadow-2xl border-8 border-white/40 flex flex-col items-center justify-center text-center min-w-[280px] md:min-w-[320px] snap-center shrink-0`}
                    >
                      <span className="text-8xl md:text-9xl mb-6 filter drop-shadow-xl">{cat.emoji}</span>
                      <span className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                        {cat.name}
                      </span>
                    </motion.button>
                  ))}
                </div>

            </motion.div>
          ) : (
            <motion.div
              key="writing-area"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -100 }}
              className="max-w-6xl mx-auto"
            >
              <motion.button
                whileHover={{ x: -10 }}
                onClick={() => setSelectedCategory(null)}
                className="mb-8 bg-white/40 backdrop-blur-md text-white px-8 py-3 rounded-full font-black text-xl flex items-center gap-3 border-4 border-white/50"
              >
                <span>🔙</span>
                <span>تغيير القسم</span>
              </motion.button>

              <div className="bg-white/30 backdrop-blur-xl rounded-[4rem] p-8 md:p-12 shadow-2xl border-8 border-white/30 flex flex-col lg:flex-row gap-12">
                {/* Left side: The Goal */}
                <div className="flex-1 flex flex-col items-center gap-8">
                  <div className="flex items-center gap-6 w-full justify-between px-4">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={prevChar}
                      className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-3xl text-rose-500 border-4 border-rose-100"
                    >
                      ➡️
                    </motion.button>
                    
                      <div className="text-center">
                          <motion.div
                            key={currentChar?.char}
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-white w-40 h-40 md:w-56 md:h-56 rounded-[3rem] shadow-2xl flex items-center justify-center border-8 border-rose-200 relative overflow-hidden"
                          >
                            <span className="text-8xl md:text-[9rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-rose-400 via-purple-500 to-blue-500 drop-shadow-sm">
                              {currentChar?.char}
                            </span>
                          </motion.div>
                      </div>

                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={nextChar}
                      className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-3xl text-rose-500 border-4 border-rose-100"
                    >
                      ⬅️
                    </motion.button>
                  </div>

                  <div className="w-full aspect-video rounded-[3rem] overflow-hidden bg-black/10 relative shadow-2xl border-8 border-white/50 group">
                    <AnimatePresence mode="wait">
                      {mediaLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-6xl mb-4">🍭</motion.div>
                          <span className="text-xl font-bold text-white">لحظة واحدة...</span>
                        </div>
                      ) : mediaUrl ? (
                        <motion.div key={mediaUrl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                          {mediaType === "video" ? (
                            <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                          ) : (
                            <img src={mediaUrl} alt={currentChar?.name} className="w-full h-full object-cover" />
                          )}
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10rem]">{ (currentChar as any)?.emoji }</div>
                      )}
                    </AnimatePresence>
                    
                      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                        <div className="bg-white/90 backdrop-blur-sm px-8 py-3 rounded-2xl shadow-xl border-4 border-rose-200">
                          <span className="text-5xl font-black text-rose-600">
                            {(currentChar as any)?.emoji}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={speakCurrentChar}
                          className="bg-rose-500 text-white w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center text-3xl border-4 border-rose-200"
                        >
                          🔊
                        </motion.button>
                      </div>
                  </div>
                </div>

                {/* Right side: Drawing Area */}
                <div className="flex-1 flex flex-col items-center gap-8">
                  <div className="relative w-full aspect-square bg-white rounded-[4rem] shadow-2xl border-8 border-rose-200 overflow-hidden cursor-crosshair">
                    <canvas
                      ref={templateCanvasRef}
                      width={600}
                      height={600}
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                    />
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={600}
                      className="w-full h-full touch-none relative z-10"
                      onMouseDown={handleStart}
                      onMouseMove={handleMove}
                      onMouseUp={handleEnd}
                      onMouseLeave={handleEnd}
                      onTouchStart={handleStart}
                      onTouchMove={handleMove}
                      onTouchEnd={handleEnd}
                    />

                    <AnimatePresence>
                      {result && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 2 }}
                          className={`absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-sm ${
                            result === "correct" ? "bg-green-500/80" : result === "close" ? "bg-amber-400/80" : "bg-rose-500/80"
                          }`}
                        >
                          <motion.span 
                            animate={{ scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }}
                            className="text-9xl mb-6"
                          >
                            {result === "correct" ? "🍭" : result === "close" ? "⭐" : "🐣"}
                          </motion.span>
                          <span className="text-4xl md:text-6xl font-black text-white drop-shadow-lg">
                            {result === "correct" ? "عبقري!" : result === "close" ? "رائع!" : "حاول ثانية!"}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={clearCanvas}
                            className="mt-8 bg-white text-rose-500 px-10 py-4 rounded-full font-black text-2xl shadow-2xl"
                          >
                            موافق
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid grid-cols-3 gap-6 w-full">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearCanvas}
                      className="bg-white text-rose-400 p-6 rounded-[2rem] shadow-xl border-b-8 border-rose-100 flex flex-col items-center gap-2"
                    >
                      <span className="text-4xl">🧹</span>
                      <span className="font-black">مسح</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={checkDrawing}
                      className="bg-rose-500 text-white p-6 rounded-[2rem] shadow-xl border-b-8 border-rose-700 flex flex-col items-center gap-2"
                    >
                      <span className="text-4xl">🎯</span>
                      <span className="font-black">صح؟</span>
                    </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={nextChar}
                        className="bg-sky-400 text-white p-6 rounded-[2rem] shadow-xl border-b-8 border-sky-600 flex flex-col items-center gap-2"
                      >
                        <span className="text-4xl">🚀</span>
                        <span className="font-black">التالي</span>
                      </motion.button>
                  </div>

                  <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md px-10 py-4 rounded-full border-4 border-white/50">
                    <input
                      type="checkbox"
                      id="showHint"
                      checked={showHint}
                      onChange={(e) => setShowHint(e.target.checked)}
                      className="w-8 h-8 rounded-full accent-rose-500 cursor-pointer"
                    />
                    <label htmlFor="showHint" className="text-white text-2xl font-black cursor-pointer select-none">
                      مساعدة خفيفة 💡
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 text-center py-8">
        <p className="text-white font-black text-xl drop-shadow-lg">صُنع بكل حب ❤️ لأبطالنا الصغار</p>
      </footer>
    </div>
  );
}
