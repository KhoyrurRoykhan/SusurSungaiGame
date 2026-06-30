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
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
    navigatePath: "/game/barito",
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
    "Mudah": "bg-green-500/30 text-white border border-green-400/30",
    "Sedang": "bg-yellow-500/30 text-white border border-yellow-400/30",
    "Sulit": "bg-orange-500/30 text-white border border-orange-400/30",
    "Legenda": "bg-purple-500/30 text-white border border-purple-400/30"
  };
  
  return (
    <span className={`px-2 py-1 rounded-xl text-xs font-bold backdrop-blur-sm ${colors[level] || colors["Sedang"]}`}>
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
  const dbPath = dbData.path || null;
  
  const isCompleted = skor > 0 || waktu !== null;
  const hasDbPath = dbPath !== null && dbPath !== "";
  
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
      className={`group relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 backdrop-blur-xl ${
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
        
        {/* Overlay dengan efek glass */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Level Number dengan efek glass */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="w-10 h-10 backdrop-blur-xl bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold border border-white/30 shadow-lg">
            {level.id}
          </div>
        </div>
        
        {/* Status Badge dengan efek glass */}
        <div className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl ${
          isCompleted 
            ? 'bg-green-500/60 text-white border border-green-400/30' 
            : 'bg-amber-400/60 text-white border border-amber-300/30'
        }`}>
          {isCompleted ? (
            <><Trophy size={12} /> Selesai</>
          ) : (
            <><Unlock size={12} /> Terbuka</>
          )}
        </div>

        {/* Path Badge dengan efek glass */}
        {hasDbPath && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500/60 backdrop-blur-xl rounded-xl text-white text-[10px] font-bold flex items-center gap-1 border border-blue-400/30">
            <Route size={10} /> Path Tersedia
          </div>
        )}
      </div>

      {/* Content dengan efek glass */}
      <div className="p-4 backdrop-blur-xl bg-white/20 border border-white/30">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white drop-shadow-lg group-hover:text-cyan-200 transition-colors">
            {level.nama}
          </h3>
          <DifficultyBadge level={level.tingkatKesulitan} />
        </div>
        
        <div className="flex items-center gap-1 text-white/70 text-xs mb-2">
          <MapPin size={12} />
          <span>{level.lokasi}</span>
        </div>

        <p className="text-white/80 text-xs line-clamp-2 mb-3 h-8">
          {level.deskripsi}
        </p>

        {/* Stats Grid - Data dari Database dengan efek glass */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Skor */}
          <div className={`flex items-center gap-2 p-1.5 rounded-xl backdrop-blur-sm ${
            skor > 0 ? 'bg-purple-500/20 border border-purple-400/30' : 'bg-white/10 border border-white/20'
          }`}>
            <Star size={14} className={skor > 0 ? 'text-purple-300' : 'text-white/40'} />
            <div>
              <p className="text-[9px] text-white/60">Skor</p>
              <p className={`text-xs font-bold ${
                skor > 0 ? 'text-purple-200' : 'text-white/40'
              }`}>
                {skor > 0 ? skor : "0"}
              </p>
            </div>
          </div>

          {/* Waktu */}
          <div className={`flex items-center gap-2 p-1.5 rounded-xl backdrop-blur-sm ${
            waktu !== null && waktu > 0 ? 'bg-blue-500/20 border border-blue-400/30' : 'bg-white/10 border border-white/20'
          }`}>
            <Timer size={14} className={waktu !== null && waktu > 0 ? 'text-blue-300' : 'text-white/40'} />
            <div>
              <p className="text-[9px] text-white/60">Durasi</p>
              <p className={`text-xs font-bold ${
                waktu !== null && waktu > 0 ? 'text-blue-200' : 'text-white/40'
              }`}>
                {waktu !== null && waktu > 0 ? formatTime(waktu) : "--:--"}
              </p>
            </div>
          </div>
        </div>

        {/* Path Info dengan efek glass */}
        {hasDbPath ? (
          <div className="mb-2 px-3 py-2 bg-blue-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Route size={14} className="text-blue-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-blue-200 font-medium">Jalur Gambar</p>
                <p className="text-xs text-blue-100 font-mono truncate">
                  {dbPath}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-2 px-3 py-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Route size={14} className="text-white/40 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-white/50">Jalur Gambar</p>
                <p className="text-xs text-white/40 italic">Belum tersedia</p>
              </div>
            </div>
          </div>
        )}

        {/* Action dengan efek glass */}
        <div className="flex items-center justify-end pt-2 border-t border-white/20">
          <motion.button
            onClick={handlePlay}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors backdrop-blur-xl ${
              isCompleted
                ? 'bg-green-500/40 text-white border border-green-400/30 hover:bg-green-500/60'
                : 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white border border-white/30 hover:from-blue-600/80 hover:to-cyan-600/80 shadow-xl'
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

// Modal Join Room dengan efek glass
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <motion.div
        className="backdrop-blur-xl bg-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">Masuk ke Room</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition text-white/80">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Room ID <span className="text-red-300">*</span>
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className={`w-full px-4 py-3 backdrop-blur-sm bg-white/20 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60 ${
                  error ? 'border-red-400/50' : 'border-white/30'
                }`}
                placeholder="Contoh: A7K2M9"
                maxLength={6}
                autoFocus
              />
              {error && <p className="text-red-300 text-xs mt-1">{error}</p>}
            </div>

            <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-2xl p-3 text-sm text-white/90">
              <p>💡 Masukkan Room ID yang diberikan oleh guru Anda</p>
              <p className="mt-1 text-xs text-white/70">Format: 6 karakter alfanumerik (contoh: A7K2M9)</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white rounded-2xl transition border border-white/30"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-2xl transition disabled:opacity-50 shadow-xl"
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
        
        const updatedLevels = baseLevelSungai.map(level => {
          const dbData = scoresData[level.dbKey] || {};
          const skor = dbData.skor || 0;
          const waktu = dbData.time || null;
          const dbPath = dbData.path || null;
          
          return {
            ...level,
            skorTertinggi: skor,
            waktuTerbaik: waktu ? formatTime(waktu) : null,
            dbPath: dbPath,
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

  // Hitung progress berdasarkan database
  const calculateProgress = () => {
    const totalSungai = levelSungai.length; // 12 sungai
    
    // Hitung berapa sungai yang sudah selesai (skor > 0 atau waktu > 0)
    const sungaiSelesai = levelSungai.filter(level => {
      const dbData = gameScores[level.dbKey];
      // Sungai dianggap selesai jika ada skor > 0 atau waktu > 0
      return dbData && (dbData.skor > 0 || dbData.time !== null);
    }).length;
    
    // Hitung progress dalam persen
    const progressPersen = totalSungai > 0 ? (sungaiSelesai / totalSungai) * 100 : 0;
    
    return {
      total: totalSungai,
      selesai: sungaiSelesai,
      progress: progressPersen,
      progressText: `${sungaiSelesai} dari ${totalSungai} sungai (${Math.round(progressPersen)}%)`
    };
  };

  // Handle Join Room - DIPERBAIKI
  const handleJoinRoom = async (roomId) => {
    try {
      setJoiningRoom(true);
      
      // 1. Cari room berdasarkan field 'roomId' di collection 'rooms'
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('roomId', '==', roomId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert('❌ Room tidak ditemukan! Pastikan Room ID benar.');
        setJoiningRoom(false);
        return;
      }

      // 2. Room ditemukan, ambil data room
      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data();
      const roomDocId = roomDoc.id;
      console.log('✅ Room ditemukan:', roomData);
      console.log('📄 Document ID:', roomDocId);

      // 3. Update data user dengan room_id
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        room_id: roomId,
        room_name: roomData.roomName || roomData.roomId || roomId,
        room_doc_id: roomDocId,
        updatedAt: new Date().toISOString()
      });

      // 4. Update local state
      setUserData(prev => ({
        ...prev,
        room_id: roomId,
        room_name: roomData.roomName || roomId,
        room_doc_id: roomDocId
      }));

      alert(`✅ Berhasil masuk ke room ${roomId}!`);
      setShowJoinRoom(false);
      
      // 5. Refresh data user
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        setUserData(updatedDoc.data());
      }
      
    } catch (error) {
      console.error('❌ Error joining room:', error);
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
  const progress = calculateProgress();
  
  const stats = {
    total: levelSungai.length,
    selesai: levelSungai.filter(l => l.waktuTerbaik !== null || l.skorTertinggi > 0).length,
    terbuka: levelSungai.filter(l => l.status === "terbuka").length,
    totalSkor: levelSungai.reduce((acc, l) => acc + (l.skorTertinggi || 0), 0),
    progress: progress
  };

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);
    console.log("Memulai level:", level.nama);
    console.log("Data game:", gameScores[level.dbKey]);
  };

  if (loading || loadingScores) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-900 to-cyan-600">
        {/* Background laut dengan animasi */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-cyan-600/50"></div>
          {/* Gelembung air */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20 animate-float"
              style={{
                width: Math.random() * 20 + 5 + 'px',
                height: Math.random() * 20 + 5 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                animationDuration: Math.random() * 3 + 2 + 's'
              }}
            />
          ))}
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white/90 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-700 to-cyan-500">
      {/* Background Laut dengan Animasi */}
      <div className="absolute inset-0">
        {/* Dasar laut */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-yellow-900/30 to-transparent"></div>
        
        {/* Rumput laut bergoyang */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`seaweed-${i}`}
            className="absolute bottom-0 w-1 bg-green-800/40 rounded-full origin-bottom animate-sway"
            style={{
              height: Math.random() * 60 + 30 + 'px',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 2 + 's',
              animationDuration: Math.random() * 2 + 1 + 's'
            }}
          />
        ))}
        
        {/* Ikan-ikan berenang */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`fish-${i}`}
            className="absolute text-white/70 animate-swim"
            style={{
              fontSize: Math.random() * 20 + 10 + 'px',
              top: Math.random() * 70 + 10 + '%',
              left: '-10%',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: Math.random() * 8 + 6 + 's'
            }}
          >
            🐟
          </div>
        ))}
        
        {/* Ikan besar */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`big-fish-${i}`}
            className="absolute text-white/60 animate-swim-slow"
            style={{
              fontSize: Math.random() * 30 + 25 + 'px',
              top: Math.random() * 60 + 20 + '%',
              left: '-15%',
              animationDelay: Math.random() * 15 + 's',
              animationDuration: Math.random() * 12 + 10 + 's'
            }}
          >
            🐠
          </div>
        ))}
        
        {/* Kura-kura */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`turtle-${i}`}
            className="absolute text-green-400/50 animate-swim-turtle"
            style={{
              fontSize: Math.random() * 25 + 20 + 'px',
              top: Math.random() * 50 + 20 + '%',
              left: '-20%',
              animationDelay: Math.random() * 20 + 's',
              animationDuration: Math.random() * 15 + 12 + 's'
            }}
          >
            🐢
          </div>
        ))}
        
        {/* Penyu */}
        {[...Array(2)].map((_, i) => (
          <div
            key={`turtle2-${i}`}
            className="absolute text-green-300/40 animate-swim-turtle2"
            style={{
              fontSize: Math.random() * 30 + 25 + 'px',
              top: Math.random() * 40 + 30 + '%',
              left: '-25%',
              animationDelay: Math.random() * 25 + 's',
              animationDuration: Math.random() * 20 + 15 + 's'
            }}
          >
            🐢
          </div>
        ))}
        
        {/* Gurita */}
        {[...Array(2)].map((_, i) => (
          <div
            key={`octopus-${i}`}
            className="absolute text-purple-400/30 animate-swim-octopus"
            style={{
              fontSize: Math.random() * 25 + 20 + 'px',
              top: Math.random() * 60 + 20 + '%',
              left: '-30%',
              animationDelay: Math.random() * 30 + 's',
              animationDuration: Math.random() * 18 + 14 + 's'
            }}
          >
            🐙
          </div>
        ))}
        
        {/* Bintang laut */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`starfish-${i}`}
            className="absolute text-yellow-400/30"
            style={{
              fontSize: Math.random() * 15 + 10 + 'px',
              bottom: Math.random() * 20 + 10 + '%',
              left: Math.random() * 100 + '%',
              animation: 'pulse 2s ease-in-out infinite',
              animationDelay: Math.random() * 2 + 's'
            }}
          >
            ⭐
          </div>
        ))}
        
        {/* Gelembung air */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: Math.random() * 15 + 3 + 'px',
              height: Math.random() * 15 + 3 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 8 + 's',
              animationDuration: Math.random() * 5 + 3 + 's'
            }}
          />
        ))}
        
        {/* Sinar matahari di air */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent"></div>
      </div>

      {/* Konten Utama dengan efek Liquid Glass */}
      <div className="relative z-10">
        {/* Header dengan Liquid Glass */}
        <header className="backdrop-blur-xl bg-white/20 shadow-2xl sticky top-0 z-20 border-b border-white/30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-white/20 rounded-2xl transition-colors backdrop-blur-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ArrowLeft size={24} className="text-white" />
                </motion.button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400/80 to-cyan-500/80 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/30">
                    <Turtle className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white drop-shadow-lg">Pilih Level</h1>
                    <p className="text-xs text-white/70">Susuri sungai dan pecahkan rekor waktu!</p>
                  </div>
                </div>
              </div>

              {/* User Info & Room ID dengan efek glass */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 backdrop-blur-sm bg-white/20 px-3 py-1.5 rounded-2xl border border-white/30">
                  <User size={16} className="text-white/80" />
                  <span className="text-sm font-medium text-white">
                    {userData?.name || 'Pengguna'}
                  </span>
                </div>

                {userData?.role === 'student' && (
                  <>
                    {userData?.room_id ? (
                      <div className="flex items-center gap-2 backdrop-blur-sm bg-blue-500/20 px-3 py-1.5 rounded-2xl border border-blue-400/30">
                        <Hash size={16} className="text-blue-300" />
                        <span className="text-sm font-medium text-blue-100">
                          Room: {userData.room_id}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowJoinRoom(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white px-4 py-1.5 rounded-2xl text-sm font-medium transition duration-200 shadow-xl hover:shadow-2xl border border-white/30"
                      >
                        <DoorOpen size={16} />
                        <span>Masuk Room</span>
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 backdrop-blur-sm bg-red-500/30 hover:bg-red-500/50 text-white px-3 py-1.5 rounded-2xl text-sm font-medium transition duration-200 border border-white/30"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bar dengan Liquid Glass - DIPERBAIKI DENGAN PROGRESS DARI DATABASE */}
        <div className="backdrop-blur-xl bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-white/80">Progress Petualangan</span>
                <span className="text-sm font-bold text-cyan-200">
                  {Math.round(stats.progress.progress)}%
                </span>
              </div>
              <div className="text-sm text-white/70">
                <span className="font-medium text-cyan-200">{stats.progress.selesai}</span>
                <span className="text-white/50"> dari </span>
                <span className="font-medium text-white/80">{stats.progress.total}</span>
                <span className="text-white/50"> sungai selesai</span>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-1000"
                style={{ width: `${stats.progress.progress}%` }}
              />
            </div>
            {/* Tambahan info detail */}
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/40">
                Target: {stats.progress.total} sungai
              </span>
              <span className="text-[10px] text-white/40">
                {stats.progress.selesai === stats.progress.total ? '🎉 Semua selesai!' : `Tersisa ${stats.progress.total - stats.progress.selesai} sungai`}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 drop-shadow-lg">
              <Unlock size={20} className="text-green-300" />
              Semua Level Petualangan
              <span className="text-sm font-normal text-white/60">({stats.total} level)</span>
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

          {/* Info dengan Liquid Glass */}
          <motion.div 
            className="mt-8 backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/30 rounded-3xl p-6 flex items-start gap-4 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-12 h-12 bg-blue-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/30">
              <Trophy className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white drop-shadow-lg mb-1">Info Petualangan</h3>
              <p className="text-white/80 text-sm">
                Selesaikan setiap level dengan waktu tercepat untuk mendapatkan skor tertinggi! 
                Data skor, durasi, dan path akan tersimpan di database. Selamat bermain dan jelajahi keindahan sungai-sungai di Kalimantan Selatan!
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1 text-white/70">
                  <Star size={12} className="text-purple-300" /> Skor: Nilai pencapaian Anda
                </span>
                <span className="flex items-center gap-1 text-white/70">
                  <Timer size={12} className="text-blue-300" /> Durasi: Waktu penyelesaian
                </span>
                <span className="flex items-center gap-1 text-white/70">
                  <Route size={12} className="text-blue-300" /> Jalur Gambar: Path yang digambar
                </span>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Modal Join Room dengan Liquid Glass */}
      <JoinRoomModal
        isOpen={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
        onJoin={handleJoinRoom}
        loading={joiningRoom}
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.2; }
        }
        
        @keyframes swim {
          0% { transform: translateX(0) scaleX(1); }
          50% { transform: translateX(calc(100vw)) scaleX(1); }
          100% { transform: translateX(calc(200vw)) scaleX(1); }
        }
        
        @keyframes swim-slow {
          0% { transform: translateX(0) scaleX(1); }
          50% { transform: translateX(calc(100vw)) scaleX(1); }
          100% { transform: translateX(calc(200vw)) scaleX(1); }
        }
        
        @keyframes swim-turtle {
          0% { transform: translateX(0) scaleX(1) translateY(0); }
          25% { transform: translateX(calc(50vw)) scaleX(1) translateY(-20px); }
          50% { transform: translateX(calc(100vw)) scaleX(1) translateY(0); }
          75% { transform: translateX(calc(150vw)) scaleX(1) translateY(-30px); }
          100% { transform: translateX(calc(200vw)) scaleX(1) translateY(0); }
        }
        
        @keyframes swim-turtle2 {
          0% { transform: translateX(0) scaleX(1) translateY(0); }
          33% { transform: translateX(calc(70vw)) scaleX(1) translateY(-25px); }
          66% { transform: translateX(calc(140vw)) scaleX(1) translateY(0); }
          100% { transform: translateX(calc(200vw)) scaleX(1) translateY(-20px); }
        }
        
        @keyframes swim-octopus {
          0% { transform: translateX(0) scaleX(1) translateY(0); }
          30% { transform: translateX(calc(60vw)) scaleX(1) translateY(-15px); }
          60% { transform: translateX(calc(120vw)) scaleX(1) translateY(15px); }
          100% { transform: translateX(calc(200vw)) scaleX(1) translateY(0); }
        }
        
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        
        .animate-float {
          animation: float ease-in-out infinite;
        }
        
        .animate-swim {
          animation: swim linear infinite;
        }
        
        .animate-swim-slow {
          animation: swim-slow linear infinite;
        }
        
        .animate-swim-turtle {
          animation: swim-turtle ease-in-out infinite;
        }
        
        .animate-swim-turtle2 {
          animation: swim-turtle2 ease-in-out infinite;
        }
        
        .animate-swim-octopus {
          animation: swim-octopus ease-in-out infinite;
        }
        
        .animate-sway {
          animation: sway ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DaftarSungai;