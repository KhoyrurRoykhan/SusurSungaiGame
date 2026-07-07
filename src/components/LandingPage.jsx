import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Turtle, Play, LogIn, LogOut, User, LayoutDashboard, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

import bg_sungai from './game/assets/bg_terbaru.png';
import panting from './assets/music/landing-panting.mp3';
import { playHoverSound, playClickSound, resumeAudio } from '../utils/SoundManager';

/* =========================
   MODAL
========================= */
const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-900">{title}</h3>
              <button onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* =========================
   SPARKLE BINTANG
========================= */
const Sparkle = ({ delay = 0 }) => {

  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;

  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`
      }}

      initial={{ opacity: 0, scale: 0 }}

      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.4, 0],
        rotate: [0, 180, 360]
      }}

      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >

      {/* bentuk bintang */}
      <div
        style={{
          width: "10px",
          height: "10px",
          background: "white",
          clipPath: "polygon(50% 0%, 60% 35%, 100% 50%, 60% 65%, 50% 100%, 40% 65%, 0% 50%, 40% 35%)",
          boxShadow: `
            0 0 8px white,
            0 0 16px white,
            0 0 25px rgba(255,255,255,0.9)
          `
        }}
      />

    </motion.div>
  );
};

/* =========================
   HOTSPOT
========================= */
const Hotspot = ({ style, onClick }) => {
  return (
    <motion.div
      className="absolute cursor-pointer z-20"
      style={style}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full h-full rounded-full pointer-events-none"
        whileHover={{
          background:
            "radial-gradient(circle, rgba(255,255,200,0.4) 0%, rgba(255,255,200,0.2) 40%, transparent 70%)",
          scale: 1.2,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

/* =========================
   MAIN
========================= */
const LandingPage = () => {

  const [activeModal, setActiveModal] = useState(null);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Setup background music
  useEffect(() => {
    // Buat audio element
    audioRef.current = new Audio(panting);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;

    // Coba play audio
    const playAudio = async () => {
      try {
        await audioRef.current.play();
        setIsMusicPlaying(true);
      } catch (error) {
        console.log('Audio autoplay blocked, waiting for user interaction');
        setIsMusicPlaying(false);
      }
    };

    playAudio();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Toggle music - HANYA MATIKAN BACKGROUND MUSIC
  const toggleMusic = () => {
    // Play click sound effect (tetap nyala)
    playClickSound();
    
    if (audioRef.current) {
      if (isMusicPlaying) {
        // Matikan background music
        audioRef.current.pause();
        setIsMusicPlaying(false);
        console.log('🔇 Background music muted (sound effects tetap aktif)');
      } else {
        // Nyalakan background music
        audioRef.current.play();
        setIsMusicPlaying(true);
        console.log('🔊 Background music playing (sound effects tetap aktif)');
      }
    }
  };

  // Cek status login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Ambil nama dan role dari Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || currentUser.displayName || 'Pengguna');
            setUserRole(userData.role || 'student');
          } else {
            setUserName(currentUser.displayName || 'Pengguna');
            setUserRole('student');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName(currentUser.displayName || 'Pengguna');
          setUserRole('student');
        }
      } else {
        setUser(null);
        setUserName('');
        setUserRole('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    playClickSound();
    setTimeout(async () => {
      try {
        await signOut(auth);
        setUser(null);
        setUserName('');
        setUserRole('');
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }, 100);
  };

  // Handle Mulai Petualangan
  const handleStartAdventure = () => {
    playClickSound();
    setTimeout(() => {
      if (user) {
        navigate('/sungai');
      } else {
        navigate('/loginregister');
      }
    }, 100);
  };

  // Handle Dashboard Guru
  const handleDashboard = () => {
    playClickSound();
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  // Handle Login Navigation
  const handleLoginNavigation = () => {
    playClickSound();
    setTimeout(() => {
      navigate('/loginregister');
    }, 100);
  };

  // Handle Modal Close
  const handleModalClose = () => {
    playClickSound();
    setActiveModal(null);
  };

  // Handle Hotspot Click
  const handleHotspotClick = (title, content) => {
    playClickSound();
    setActiveModal({ title, content });
  };

  // Handler untuk resume audio context
  const handleUserInteraction = () => {
    resumeAudio();
  };

  // Fungsi untuk hover sound dengan logging
  const handleHover = () => {
    console.log('🖱️ Hover detected - playing hover sound');
    playHoverSound();
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden relative bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_sungai})` }}
      onClick={handleUserInteraction}
    >

      {/* overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* SPARKLE BINTANG */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Sparkle key={i} delay={i * 0.3} />
      ))}

      {/* CAHAYA HALUS */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.15), transparent 60%)",
        }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      {/* HOTSPOT MONYET */}
      <Hotspot
        style={{ left: "5%", top: "48%", width: "180px", height: "180px" }}
        onClick={() => handleHotspotClick(
          "Pulau Kembang",
          "Habitat bekantan yang menjadi ikon wisata Kalimantan Selatan."
        )}
      />

      {/* HOTSPOT MENARA */}
      <Hotspot
        style={{ right: "8%", top: "28%", width: "180px", height: "220px" }}
        onClick={() => handleHotspotClick(
          "Menara Pandang",
          "Salah satu ikon Kota Banjarmasin dengan pemandangan sungai dari atas."
        )}
      />

      {/* HEADER - Login/Logout Button & Music Control */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
        {/* Music Control Button */}
        <button
          onClick={toggleMusic}
          onMouseEnter={handleHover}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md border border-white/30 transition duration-200"
          title={isMusicPlaying ? "Mute background music" : "Play background music"}
        >
          {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        {!loading && (
          user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                <User size={16} className="text-white" />
                <span className="text-white text-sm font-medium truncate max-w-[120px]">
                  {userName}
                </span>
              </div>
              
              {/* Tombol Dashboard Guru - Hanya untuk role teacher */}
              {userRole === 'teacher' && (
                <button
                  onClick={handleDashboard}
                  onMouseEnter={handleHover}
                  className="flex items-center gap-2 bg-purple-500/80 hover:bg-purple-600/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/30 transition duration-200"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                onMouseEnter={handleHover}
                className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/30 transition duration-200"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginNavigation}
              onMouseEnter={handleHover}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/30 transition duration-200"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
          )
        )}
      </div>

      {/* TITLE */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {/* Sapaan Selamat Datang */}
          {!loading && user && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                Selamat Datang, {userName}! 👋
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {userRole === 'teacher' 
                  ? 'Kelola kelas dan pantau progres siswa' 
                  : 'Ayo jelajahi sungai-sungai di Kalimantan Selatan'}
              </p>
            </motion.div>
          )}

          {!loading && !user && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                Selamat Datang di Susur Sungai! 🏞️
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Login untuk memulai petualanganmu
              </p>
            </motion.div>
          )}

          <motion.div
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Turtle className="w-4 h-4" />
            <span className="text-sm">Game Edukasi</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-2"
            animate={{
              y: [0, -8, 0],
              rotate: [0, 1, -1, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity
            }}
          >
            SUSUR <br /> SUNGAI
          </motion.h1>

          <motion.p
            className="text-white mb-6"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Petualangan di Kota Seribu Sungai
          </motion.p>

          {/* Tombol Mulai Petualangan / Dashboard */}
          {!loading && user && userRole === 'teacher' ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                onClick={handleDashboard}
                onMouseEnter={handleHover}
                className="px-8 py-3 bg-purple-500 text-white rounded-full font-bold flex items-center gap-2 shadow-lg mx-auto"
                animate={{
                  y: [0, -6, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity
                }}
                whileHover={{
                  scale: 1.15
                }}
                whileTap={{
                  scale: 0.95
                }}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard Guru
              </motion.button>
              
              <motion.button
                onClick={handleStartAdventure}
                onMouseEnter={handleHover}
                className="px-8 py-3 bg-amber-400 text-amber-900 rounded-full font-bold flex items-center gap-2 shadow-lg mx-auto"
                animate={{
                  y: [0, -6, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: 0.3
                }}
                whileHover={{
                  scale: 1.15
                }}
                whileTap={{
                  scale: 0.95
                }}
              >
                <Play className="w-5 h-5" />
                Mulai Petualangan
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={handleStartAdventure}
              onMouseEnter={handleHover}
              className="px-8 py-3 bg-amber-400 text-amber-900 rounded-full font-bold flex items-center gap-2 shadow-lg mx-auto"
              animate={{
                y: [0, -6, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity
              }}
              whileHover={{
                scale: 1.15
              }}
              whileTap={{
                scale: 0.95
              }}
            >
              <Play className="w-5 h-5" />
              {user ? 'Mulai Petualangan' : 'Mulai Petualangan'}
            </motion.button>
          )}

          {/* Info tambahan jika belum login */}
          {!loading && !user && (
            <motion.p
              className="text-white/60 text-xs mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              💡 Login untuk menyimpan progres dan skor permainanmu
            </motion.p>
          )}

        </motion.div>

      </div>

      {/* FOOTER */}
      <div className="absolute bottom-4 w-full text-center text-white/60 text-xs z-10">
        © 2026 Susur Sungai • Banjarmasin
      </div>

      {/* MODAL */}
      <Modal
        isOpen={activeModal !== null}
        onClose={handleModalClose}
        title={activeModal?.title || ''}
      >
        <p className="text-gray-600">{activeModal?.content}</p>
      </Modal>

    </div>
  );
};

export default LandingPage;