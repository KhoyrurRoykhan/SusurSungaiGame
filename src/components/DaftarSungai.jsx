import React, { useState, useEffect } from 'react';
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
  Timer,
  Target,
  User,
  LogOut,
  Hash,
  DoorOpen,
  X,
  Check,
  Star,
  Route
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// sungai
import GambarSungaiBarito from "./assets/sungaibarito.jpeg";
import GambarSungaiKuin from "./assets/sungaikuin.jpg";
import GambarSungaiAlalak from "./assets/sungaialalak.jpg";
import GambarSungaiAwang from "./assets/sungaiawang.jpg";
import GambarSungaiMartapura from "./assets/sungaimartapura.jpg";
import GambarSungaiPelambuan from "./assets/sungaipelambuan.jpg";

// Data dasar sungai - PATH UNTUK NAVIGASI ADA DI SINI
const baseLevelSungai = [
  {
    id: 1,
    nama: "Sungai Barito",
    lokasi: "Perbatasan Kota Banjarmasin & Kab. Barito Kuala",
    deskripsi: "Sungai terpanjang di Kalimantan Selatan, menjadi jalur transportasi utama dan memiliki keanekaragaman hayati yang tinggi.",
    gambar: GambarSungaiBarito,
    tingkatKesulitan: "Mudah",
    navigatePath: "/game/barito", // <-- PATH UNTUK NAVIGASI
    dbKey: "barito"
  },
  {
    id: 2,
    nama: "Sungai Alalak",
    lokasi: "Perbatasan Banjarmasin Utara & Barito Kuala",
    deskripsi: "Sungai yang membelah kota Marabahan, kaya akan ekosistem mangrove dan biota air.",
    gambar: GambarSungaiAlalak,
    tingkatKesulitan: "Sedang",
    navigatePath: "/game/alalak",
    dbKey: "alalak"
  },
  {
    id: 3,
    nama: "Sungai Alalak (Part 2)",
    lokasi: "Perbatasan Banjarmasin Utara & Barito Kuala",
    deskripsi: "Eksplorasi lebih dalam ekosistem mangrove Sungai Alalak.",
    gambar: GambarSungaiAlalak,
    tingkatKesulitan: "Sedang",
    navigatePath: "/game/alalak2",
    dbKey: "alalak_part2"
  },
  {
    id: 4,
    nama: "Sungai Andai",
    lokasi: "Banjarmasin Utara",
    deskripsi: "Sungai Andai yang namanya berasal dari sejarah sungai berarus landai (surut) yang kemudian digali dalam bergotong royong agar bisa dilalui perahu.",
    gambar: GambarSungaiAwang,
    tingkatKesulitan: "Sulit",
    navigatePath: "/game/awang",
    dbKey: "awang"
  },
  {
    id: 5,
    nama: "Sungai Martapura",
    lokasi: "Banjarmasin",
    deskripsi: "Sungai yang terkenal dengan industri batu permata dan budaya sungai yang masih lestari.",
    gambar: GambarSungaiMartapura,
    tingkatKesulitan: "Sulit",
    navigatePath: "/game/martapura4",
    dbKey: "martapura"
  },
  {
    id: 6,
    nama: "Sungai Martapura (Part 2)",
    lokasi: "Banjarmasin",
    deskripsi: "Lanjutan petualangan menyusuri keindahan Sungai Martapura.",
    gambar: GambarSungaiMartapura,
    tingkatKesulitan: "Sulit",
    navigatePath: "/game/martapura3",
    dbKey: "martapura_part2"
  },
  {
    id: 7,
    nama: "Sungai Martapura (Part 3)",
    lokasi: "Banjarmasin",
    deskripsi: "Tantangan ekstrem di Sungai Martapura, hadapi arus deras.",
    gambar: GambarSungaiMartapura,
    tingkatKesulitan: "Sulit",
    navigatePath: "/game/martapura2",
    dbKey: "martapura_part3"
  },
  {
    id: 8,
    nama: "Sungai Martapura (Part 4)",
    lokasi: "Banjarmasin",
    deskripsi: "Puncak petualangan di Sungai Martapura, uji seluruh kemampuanmu.",
    gambar: GambarSungaiMartapura,
    tingkatKesulitan: "Legenda",
    navigatePath: "/game/martapura",
    dbKey: "martapura_part4"
  },
  {
    id: 9,
    nama: "Sungai Pelambuan",
    lokasi: "Banjarmasin Barat",
    deskripsi: "Sungai yang menjadi kawasan industri dan permukiman tradisional dengan nilai sejarah tinggi.",
    gambar: GambarSungaiPelambuan,
    tingkatKesulitan: "Legenda",
    navigatePath: "/game/pelambuan",
    dbKey: "pelambuan"
  },
  {
    id: 10,
    nama: "Sungai Kuin",
    lokasi: "Banjarmasin Utara",
    deskripsi: "Sungai yang terkenal dengan pasar terapungnya, menjadi ikon budaya sungai di Kalimantan Selatan.",
    gambar: GambarSungaiKuin,
    tingkatKesulitan: "Mudah",
    navigatePath: "/game/kuin",
    dbKey: "kuin"
  },
  {
    id: 11,
    nama: "Sungai Kuin (Part 2)",
    lokasi: "Banjarmasin Utara",
    deskripsi: "Lanjutan petualangan di Sungai Kuin, telusuri lebih dalam keanekaragaman hayati sungai.",
    gambar: GambarSungaiKuin,
    tingkatKesulitan: "Sedang",
    navigatePath: "/game/kuin2",
    dbKey: "kuin_part2"
  },
  {
    id: 12,
    nama: "Sungai Kuin (Part 3)",
    lokasi: "Banjarmasin Utara",
    deskripsi: "Tantangan terakhir di Sungai Kuin, uji kemampuan navigasi dan pengetahuanmu.",
    gambar: GambarSungaiKuin,
    tingkatKesulitan: "Sulit",
    navigatePath: "/game/kuin3",
    dbKey: "kuin_part3"
  },
];

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

// Format waktu dari detik ke MM:SS
const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Level Card Component
const LevelCard = ({ level, index, onPlay, gameData }) => {
  const navigate = useNavigate();
  const isLocked = level.status === "terkunci";
  
  // Ambil data dari database
  const dbData = gameData || {};
  const skor = dbData.skor || 0;
  const waktu = dbData.time || null;
  const dbPath = dbData.path || null; // Ini adalah path dari database (jalur gambar)
  
  const isCompleted = skor > 0 || waktu !== null;
  const hasDbPath = dbPath !== null && dbPath !== "";
  
  // PATH UNTUK NAVIGASI - gunakan navigatePath dari level
  const navigationPath = level.navigatePath;
  
  const handlePlay = (e) => {
    e.stopPropagation();
    
    console.log("🎮 Tombol diklik untuk:", level.nama);
    console.log("📌 Navigasi ke:", navigationPath);
    console.log("🗺️ Database path (jalur gambar):", dbPath);
    
    if (!isLocked && navigationPath) {
      if (onPlay) {
        onPlay(level);
      }
      
      // Navigasi menggunakan navigationPath
      navigate(navigationPath, { 
        state: { 
          levelId: level.id,
          levelName: level.nama,
          dbKey: level.dbKey,
          skor: skor,
          waktu: waktu,
          path: dbPath // Kirim dbPath sebagai data tambahan
        } 
      });
    } else {
      console.error("❌ Path navigasi tidak ditemukan untuk:", level.nama);
    }
  };
  
  const handleCardClick = () => {
    if (isLocked) return;
    
    console.log("🖱️ Card diklik:", level.nama);
    console.log("📌 Navigasi ke:", navigationPath);
    
    if (navigationPath) {
      if (onPlay) {
        onPlay(level);
      }
      
      navigate(navigationPath, { 
        state: { 
          levelId: level.id,
          levelName: level.nama,
          dbKey: level.dbKey,
          skor: skor,
          waktu: waktu,
          path: dbPath
        } 
      });
    }
  };
  
  return (
    <motion.div
      className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onClick={handleCardClick}
    >
      {/* Gambar Container */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={level.gambar} 
          alt={level.nama}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Level Number */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold border border-white/30">
            {level.id}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
          isCompleted 
            ? 'bg-green-500 text-white' 
            : 'bg-amber-400 text-amber-900'
        }`}>
          {isCompleted ? (
            <><Trophy size={12} /> Selesai</>
          ) : (
            <><Unlock size={12} /> Terbuka</>
          )}
        </div>

        {/* Path Badge di Gambar */}
        {hasDbPath && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded-lg text-white text-[10px] font-bold flex items-center gap-1">
            <Route size={10} /> Path Tersedia
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
            {level.nama}
          </h3>
          <DifficultyBadge level={level.tingkatKesulitan} />
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
          <MapPin size={12} />
          <span>{level.lokasi}</span>
        </div>

        <p className="text-gray-600 text-xs line-clamp-2 mb-3 h-8">
          {level.deskripsi}
        </p>

        {/* Stats Grid - Data dari Database */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Skor */}
          <div className={`flex items-center gap-2 p-1.5 rounded-lg ${
            skor > 0 ? 'bg-purple-50' : 'bg-gray-50'
          }`}>
            <Star size={14} className={skor > 0 ? 'text-purple-600' : 'text-gray-400'} />
            <div>
              <p className="text-[9px] text-gray-500">Skor</p>
              <p className={`text-xs font-bold ${
                skor > 0 ? 'text-purple-700' : 'text-gray-400'
              }`}>
                {skor > 0 ? skor : "0"}
              </p>
            </div>
          </div>

          {/* Waktu */}
          <div className={`flex items-center gap-2 p-1.5 rounded-lg ${
            waktu !== null && waktu > 0 ? 'bg-blue-50' : 'bg-gray-50'
          }`}>
            <Timer size={14} className={waktu !== null && waktu > 0 ? 'text-blue-600' : 'text-gray-400'} />
            <div>
              <p className="text-[9px] text-gray-500">Durasi</p>
              <p className={`text-xs font-bold ${
                waktu !== null && waktu > 0 ? 'text-blue-700' : 'text-gray-400'
              }`}>
                {waktu !== null && waktu > 0 ? formatTime(waktu) : "--:--"}
              </p>
            </div>
          </div>
        </div>

        {/* Path Info - Menampilkan path dari database (jalur gambar) */}
        {hasDbPath ? (
          <div className="mb-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Route size={14} className="text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-blue-700 font-medium">Jalur Gambar</p>
                <p className="text-xs text-blue-800 font-mono truncate">
                  {dbPath}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Route size={14} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500">Jalur Gambar</p>
                <p className="text-xs text-gray-400 italic">Belum tersedia</p>
              </div>
            </div>
          </div>
        )}

        {/* Action */}
        <div className="flex items-center justify-end pt-2 border-t border-gray-100">
          <motion.button
            onClick={handlePlay}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 transition-colors ${
              isCompleted
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
          >
            {isCompleted ? (
              <>Main Lagi <Play size={14} /></>
            ) : (
              <>Mulai <Play size={14} /></>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Modal Join Room
const JoinRoomModal = ({ isOpen, onClose, onJoin, loading }) => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError('Room ID wajib diisi');
      return;
    }
    setError('');
    onJoin(roomId.toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Masuk ke Room</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: A7K2M9"
                maxLength={6}
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p>💡 Masukkan Room ID yang diberikan oleh guru Anda</p>
              <p className="mt-1 text-xs">Format: 6 karakter alfanumerik (contoh: A7K2M9)</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk Room'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Main Component
const DaftarSungai = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [gameScores, setGameScores] = useState({});
  const [levelSungai, setLevelSungai] = useState(baseLevelSungai);
  const [loadingScores, setLoadingScores] = useState(true);

  // Cek status login dan ambil data user & game_skor
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/loginregister');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser(currentUser);
          setUserData(data);
          
          await fetchGameScores(currentUser.uid);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
        setLoadingScores(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch data game_skor dari database
  const fetchGameScores = async (userId) => {
    try {
      console.log('Fetching game scores for user:', userId);
      
      const scoreDocRef = doc(db, 'game_skor', userId);
      const scoreDoc = await getDoc(scoreDocRef);
      
      if (scoreDoc.exists()) {
        const data = scoreDoc.data();
        console.log('Game score data:', data);
        
        const scoresData = {};
        
        Object.keys(data).forEach(key => {
          if (key === 'id_student' || key === 'student_name' || key === 'createdAt' || key === 'updatedAt') {
            return;
          }
          
          if (typeof data[key] === 'object' && data[key] !== null) {
            scoresData[key] = {
              skor: data[key].skor || 0,
              time: data[key].time || null,
              path: data[key].path || null
            };
            console.log(`✅ Found data for ${key}:`, scoresData[key]);
          }
        });
        
        console.log('Final scoresData:', scoresData);
        setGameScores(scoresData);
        
        // Update levelSungai dengan data dari database
        // PENTING: Jangan timpa navigatePath!
        const updatedLevels = baseLevelSungai.map(level => {
          const dbData = scoresData[level.dbKey] || {};
          const skor = dbData.skor || 0;
          const waktu = dbData.time || null;
          const dbPath = dbData.path || null;
          
          return {
            ...level, // Pertahankan semua data dari baseLevelSungai termasuk navigatePath
            skorTertinggi: skor,
            waktuTerbaik: waktu ? formatTime(waktu) : null,
            dbPath: dbPath, // Simpan dbPath sebagai properti terpisah
            pernahDimainkan: skor > 0 || waktu !== null,
            status: "terbuka"
          };
        });
        
        setLevelSungai(updatedLevels);
        
      } else {
        console.log('No game score document found for user:', userId);
      }
      
    } catch (error) {
      console.error('Error fetching game scores:', error);
    }
  };

  // Handle Join Room
  const handleJoinRoom = async (roomId) => {
    try {
      setJoiningRoom(true);
      
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        alert('Room tidak ditemukan! Pastikan Room ID benar.');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        room_id: roomId,
        updatedAt: new Date().toISOString()
      });

      setUserData(prev => ({
        ...prev,
        room_id: roomId
      }));

      alert(`✅ Berhasil masuk ke room ${roomId}!`);
      setShowJoinRoom(false);
      
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        setUserData(updatedDoc.data());
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Gagal masuk room. Silakan coba lagi.');
    } finally {
      setJoiningRoom(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Hitung statistik
  const stats = {
    total: levelSungai.length,
    selesai: levelSungai.filter(l => l.waktuTerbaik !== null || l.skorTertinggi > 0).length,
    terbuka: levelSungai.filter(l => l.status === "terbuka").length,
    totalSkor: levelSungai.reduce((acc, l) => acc + (l.skorTertinggi || 0), 0)
  };

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);
    console.log("Memulai level:", level.nama);
    console.log("Data game:", gameScores[level.dbKey]);
  };

  if (loading || loadingScores) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

            {/* User Info & Room ID */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <User size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {userData?.name || 'Pengguna'}
                </span>
              </div>

              {userData?.role === 'student' && (
                <>
                  {userData?.room_id ? (
                    <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
                      <Hash size={16} className="text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-700">
                        Room: {userData.room_id}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowJoinRoom(true)}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition duration-200 shadow-md hover:shadow-lg"
                    >
                      <DoorOpen size={16} />
                      <span>Masuk Room</span>
                    </button>
                  )}
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium transition duration-200 border border-red-200"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Progress Petualangan</span>
              <span className="text-sm font-bold text-teal-600">{Math.round((stats.selesai / stats.total) * 100)}%</span>
            </div>
            <div className="text-sm text-gray-500">
              Total Skor: <span className="font-bold text-purple-600">{stats.totalSkor}</span>
            </div>
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
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Unlock size={20} className="text-green-500" />
            Semua Level Petualangan
            <span className="text-sm font-normal text-gray-500">({stats.total} level)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levelSungai.map((level, index) => (
              <LevelCard 
                key={level.id} 
                level={level} 
                index={index}
                onPlay={handleSelectLevel}
                gameData={gameScores[level.dbKey]}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <motion.div 
          className="mt-8 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-6 flex items-start gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy className="text-teal-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-teal-900 mb-1">Info Petualangan</h3>
            <p className="text-teal-800 text-sm">
              Selesaikan setiap level dengan waktu tercepat untuk mendapatkan skor tertinggi! 
              Data skor, durasi, dan path akan tersimpan di database. Selamat bermain dan jelajahi keindahan sungai-sungai di Kalimantan Selatan!
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1 text-teal-700">
                <Star size={12} className="text-purple-500" /> Skor: Nilai pencapaian Anda
              </span>
              <span className="flex items-center gap-1 text-teal-700">
                <Timer size={12} className="text-blue-500" /> Durasi: Waktu penyelesaian
              </span>
              <span className="flex items-center gap-1 text-teal-700">
                <Route size={12} className="text-blue-500" /> Jalur Gambar: Path yang digambar
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modal Join Room */}
      <JoinRoomModal
        isOpen={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
        onJoin={handleJoinRoom}
        loading={joiningRoom}
      />
    </div>
  );
};

export default DaftarSungai;