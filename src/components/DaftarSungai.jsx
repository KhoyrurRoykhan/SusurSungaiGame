import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Trophy, 
  Lock, 
  Unlock,
  ArrowLeft, 
  Waves,
  Turtle,
  Play,
  Star,
  Timer,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// sungai
import GambarSungaiBarito from "./assets/sungaibarito.jpeg";
import GambarSungaiKuin from "./assets/sungaikuin.jpg";


// Data dummy sungai sebagai level game
const levelSungai = [
  {
    id: 1,
    nama: "Sungai Barito",
    lokasi: "Loprem ipsum",
    deskripsi: "Lorem ipsum dolor sit amet. 33 reprehenderit facilis et enim quisquam hic tempora molestiae ex earum quisquam qui voluptatum delectus non quibusdam dolore.",
    gambar: GambarSungaiBarito,
    status: "terbuka", // terbuka, terkunci, selesai
    waktuTerbaik: "05:32", // format mm:ss
    pernahDimainkan: true,
    skorTertinggi: 850,
    bintang: 3, // 1-3 bintang
    tingkatKesulitan: "Mudah",
    reward: "Badge Pemula",
    path: "/game/barito" // path untuk navigasi
  },
  {
    id: 2,
    nama: "Lorem ipsum",
    lokasi: "Loprem ipsum dolor sit amet",
    deskripsi: "Lorem ipsum dolor sit amet. 33 reprehenderit facilis et enim quisquam hic tempora molestiae ex earum quisquam qui voluptatum delectus non quibusdam dolore.",
    gambar: GambarSungaiKuin,
    status: "terbuka",
    waktuTerbaik: null,
    pernahDimainkan: false,
    skorTertinggi: 720,
    bintang: 2,
    tingkatKesulitan: "Sedang",
    reward: "Badge Petualang",
    path: "#"
  },
  {
    id: 3,
    nama: "Lorem ipsum",
    lokasi: "Lorem ipsum dolor sit amet",
    deskripsi: "Lorem ipsum dolor sit amet. 33 reprehenderit facilis et enim quisquam hic tempora molestiae ex earum quisquam qui voluptatum delectus non quibusdam dolore. ",
    gambar: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
    status: "terkunci",
    waktuTerbaik: null,
    pernahDimainkan: false,
    skorTertinggi: 0,
    bintang: 0,
    tingkatKesulitan: "Sedang",
    reward: "Badge Budayawan",
    path: "#"
  },
  {
    id: 4,
    nama: "Lorem ipsum",
    lokasi: "Lorem ipsum dolor sit amet",
    deskripsi: "Lorem ipsum dolor sit amet. 33 reprehenderit facilis et enim quisquam hic tempora molestiae ex earum quisquam qui voluptatum delectus non quibusdam dolore. ",
    gambar: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop",
    status: "terkunci",
    waktuTerbaik: null,
    pernahDimainkan: false,
    skorTertinggi: 0,
    bintang: 0,
    tingkatKesulitan: "Sulit",
    reward: "Badge Konservasionis",
    path: "#"
  },
  {
    id: 5,
    nama: "Lorem ipsum",
    lokasi: "Lorem ipsum dolor sit amet",
    deskripsi: "Lorem ipsum dolor sit amet. 33 reprehenderit facilis et enim quisquam hic tempora molestiae ex earum quisquam qui voluptatum delectus non quibusdam dolore. ",
    gambar: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop",
    status: "terkunci",
    waktuTerbaik: null,
    pernahDimainkan: false,
    skorTertinggi: 0,
    bintang: 0,
    tingkatKesulitan: "Sulit",
    reward: "Badge Penjelajah",
    path: "#"
  },
  {
    id: 6,
    nama: "Lorem ipsum",
    lokasi: "Lorem ipsum dolor sit amet",
    deskripsi: "Lorem ipsum dolor sit amet. 33 reprehenderit facilis et enim quisquam hic tempora molestiae ex earum quisquam qui voluptatum delectus non quibusdam dolore.",
    gambar: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop",
    status: "terkunci",
    waktuTerbaik: null,
    pernahDimainkan: false,
    skorTertinggi: 0,
    bintang: 0,
    tingkatKesulitan: "Legenda",
    reward: "Badge Legenda Sungai",
    path: "#"
  }
];

// Star Rating Component
const StarRating = ({ count }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
};

// Difficulty Badge
const DifficultyBadge = ({ level }) => {
  const colors = {
    "Mudah": "bg-green-100 text-green-700",
    "Sedang": "bg-yellow-100 text-yellow-700",
    "Sulit": "bg-orange-100 text-orange-700",
    "Legenda": "bg-purple-100 text-purple-700"
  };
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold ${colors[level] || colors["Sedang"]}`}>
      {level}
    </span>
  );
};

// Level Card Component
const LevelCard = ({ level, index, onPlay }) => {
  const navigate = useNavigate();
  const isLocked = level.status === "terkunci";
  const isCompleted = level.status === "selesai" || level.waktuTerbaik !== null;
  
  const handlePlay = () => {
    if (!isLocked) {
      if (onPlay) {
        onPlay(level);
      }
      // Navigasi ke path game yang sesuai
      navigate(level.path, { 
        state: { 
          levelId: level.id,
          levelName: level.nama,
          waktuTerbaik: level.waktuTerbaik,
          bintang: level.bintang
        } 
      });
    }
  };
  
  return (
    <motion.div
      className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
        isLocked ? "opacity-75 grayscale" : "hover:shadow-2xl hover:-translate-y-2"
      } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={handlePlay}
    >
      {/* Gambar Container */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={level.gambar} 
          alt={level.nama}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center text-white">
              <Lock size={40} className="mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium">Selesaikan level sebelumnya</p>
            </div>
          </div>
        )}
        
        {/* Level Number */}
        <div className="absolute top-3 left-3 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold border border-white/30">
          {level.id}
        </div>
        
        {/* Status Badge */}
        <div className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
          isCompleted 
            ? 'bg-green-500 text-white' 
            : isLocked 
              ? 'bg-gray-500 text-white'
              : 'bg-amber-400 text-amber-900'
        }`}>
          {isCompleted ? (
            <><Trophy size={12} /> Selesai</>
          ) : isLocked ? (
            <><Lock size={12} /> Terkunci</>
          ) : (
            <><Unlock size={12} /> Terbuka</>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-teal-600 transition-colors">
          {level.nama}
        </h3>
        
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
          <MapPin size={12} />
          <span>{level.lokasi}</span>
        </div>

        <p className="text-gray-600 text-xs line-clamp-2 mb-3 h-8">
          {level.deskripsi}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Waktu Terbaik */}
          <div className={`flex items-center gap-2 p-2 rounded-lg ${
            isCompleted ? 'bg-green-50' : 'bg-gray-50'
          }`}>
            <Timer size={16} className={isCompleted ? 'text-green-600' : 'text-gray-400'} />
            <div>
              <p className="text-[10px] text-gray-500">Waktu Terbaik</p>
              <p className={`text-sm font-bold ${
                isCompleted ? 'text-green-700' : 'text-gray-400'
              }`}>
                {isCompleted ? level.waktuTerbaik : "--:--"}
              </p>
            </div>
          </div>
        </div>

        {/* Rating & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* <StarRating count={level.bintang} /> */}
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation(); // Mencegah event bubbling ke card
              handlePlay();
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 transition-colors ${
              isCompleted
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : isLocked
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg'
            }`}
            whileHover={!isLocked ? { scale: 1.05 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
            disabled={isLocked}
          >
            {isCompleted ? (
              <>Main Lagi <Play size={14} /></>
            ) : isLocked ? (
              <><Lock size={14} /> Terkunci</>
            ) : (
              <>Mulai <Play size={14} /></>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
const DaftarSungai = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Hitung statistik
  const stats = {
    total: levelSungai.length,
    selesai: levelSungai.filter(l => l.waktuTerbaik !== null).length,
    terbuka: levelSungai.filter(l => l.status === "terbuka").length,
    totalBintang: levelSungai.reduce((acc, l) => acc + l.bintang, 0)
  };

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);
    // Navigasi sudah ditangani di LevelCard
    console.log("Memulai level:", level.nama);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={24} className="text-gray-700" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Turtle className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Pilih Level</h1>
                  <p className="text-xs text-gray-500">Susuri sungai dan pecahkan rekor waktu!</p>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-600">{stats.selesai}/{stats.total}</p>
                <p className="text-xs text-gray-500">Level Selesai</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-500">{stats.totalBintang}/18</p>
                <p className="text-xs text-gray-500">Bintang Kumpul</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-xl">
                <Trophy className="text-teal-600" size={20} />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Total Waktu</p>
                  <p className="text-sm font-bold text-teal-700">13:47</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Progress Petualangan</span>
            <span className="text-sm font-bold text-teal-600">{Math.round((stats.selesai / stats.total) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-1000"
              style={{ width: `${(stats.selesai / stats.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Grid Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levelSungai.map((level, index) => (
            <LevelCard 
              key={level.id} 
              level={level} 
              index={index}
              onPlay={handleSelectLevel}
            />
          ))}
        </div>

        {/* Tips */}
        {/* <motion.div 
          className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Waves className="text-amber-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 mb-1">Tips Petualangan</h3>
            <p className="text-amber-800 text-sm">
              Selesaikan level dengan waktu lebih cepat untuk mendapatkan bintang tambahan! 
              Klik pada card level atau tombol Mulai/Main Lagi untuk memulai petualangan.
            </p>
          </div>
        </motion.div> */}
      </main>
    </div>
  );
};

export default DaftarSungai;