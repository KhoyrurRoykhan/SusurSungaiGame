import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Turtle, Play, LogIn, LogOut, User, LayoutDashboard, Volume2, VolumeX, Info, BookOpen, Map, Trophy, Users, Code, Mail, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

import bg_sungai from './game/assets/bg_terbaru.png';
import panting from './assets/music/landing-panting.mp3';
import { playHoverSound, playClickSound, resumeAudio } from '../utils/SoundManager';

/* =========================
   BACKGROUND ANIMATIONS (dari LoginRegister)
========================= */
const BackgroundAnimations = () => {
  const seaweeds = [...Array(15)].map((_, i) => ({
    id: `seaweed-${i}`,
    height: Math.random() * 60 + 30,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 1,
  }));

  const fish = [...Array(12)].map((_, i) => ({
    id: `fish-${i}`,
    size: Math.random() * 20 + 10,
    top: Math.random() * 70 + 10,
    delay: Math.random() * 10,
    duration: Math.random() * 8 + 6,
  }));

  const bigFish = [...Array(4)].map((_, i) => ({
    id: `big-fish-${i}`,
    size: Math.random() * 30 + 25,
    top: Math.random() * 60 + 20,
    delay: Math.random() * 15,
    duration: Math.random() * 12 + 10,
  }));

  const turtles = [...Array(3)].map((_, i) => ({
    id: `turtle-${i}`,
    size: Math.random() * 25 + 20,
    top: Math.random() * 50 + 20,
    delay: Math.random() * 20,
    duration: Math.random() * 15 + 12,
  }));

  const turtles2 = [...Array(2)].map((_, i) => ({
    id: `turtle2-${i}`,
    size: Math.random() * 30 + 25,
    top: Math.random() * 40 + 30,
    delay: Math.random() * 25,
    duration: Math.random() * 20 + 15,
  }));

  const octopuses = [...Array(2)].map((_, i) => ({
    id: `octopus-${i}`,
    size: Math.random() * 25 + 20,
    top: Math.random() * 60 + 20,
    delay: Math.random() * 30,
    duration: Math.random() * 18 + 14,
  }));

  const starfish = [...Array(5)].map((_, i) => ({
    id: `starfish-${i}`,
    size: Math.random() * 15 + 10,
    bottom: Math.random() * 20 + 10,
    left: Math.random() * 100,
    delay: Math.random() * 2,
  }));

  const bubbles = [...Array(20)].map((_, i) => ({
    id: `bubble-${i}`,
    size: Math.random() * 15 + 3,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 5 + 3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-yellow-900/30 to-transparent"></div>

      {seaweeds.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-0 w-1 bg-green-800/40 rounded-full origin-bottom animate-sway"
          style={{
            height: item.height + 'px',
            left: item.left + '%',
            animationDelay: item.delay + 's',
            animationDuration: item.duration + 's',
          }}
        />
      ))}

      {fish.map((item) => (
        <div
          key={item.id}
          className="absolute text-white/70"
          style={{
            fontSize: item.size + 'px',
            top: item.top + '%',
            right: '-10%',
            animation: `swim-right-to-left ${item.duration}s linear ${item.delay}s infinite`,
          }}
        >
          🐟
        </div>
      ))}

      {bigFish.map((item) => (
        <div
          key={item.id}
          className="absolute text-white/60"
          style={{
            fontSize: item.size + 'px',
            top: item.top + '%',
            right: '-15%',
            animation: `swim-right-to-left-slow ${item.duration}s linear ${item.delay}s infinite`,
          }}
        >
          🐠
        </div>
      ))}

      {turtles.map((item) => (
        <div
          key={item.id}
          className="absolute text-green-400/50"
          style={{
            fontSize: item.size + 'px',
            top: item.top + '%',
            right: '-20%',
            animation: `swim-turtle-right-to-left ${item.duration}s ease-in-out ${item.delay}s infinite`,
          }}
        >
          🐢
        </div>
      ))}

      {turtles2.map((item) => (
        <div
          key={item.id}
          className="absolute text-green-300/40"
          style={{
            fontSize: item.size + 'px',
            top: item.top + '%',
            right: '-25%',
            animation: `swim-turtle2-right-to-left ${item.duration}s ease-in-out ${item.delay}s infinite`,
          }}
        >
          🐢
        </div>
      ))}

      {octopuses.map((item) => (
        <div
          key={item.id}
          className="absolute text-purple-400/30"
          style={{
            fontSize: item.size + 'px',
            top: item.top + '%',
            right: '-30%',
            animation: `swim-octopus-right-to-left ${item.duration}s ease-in-out ${item.delay}s infinite`,
          }}
        >
          🐙
        </div>
      ))}

      {starfish.map((item) => (
        <div
          key={item.id}
          className="absolute text-yellow-400/30"
          style={{
            fontSize: item.size + 'px',
            bottom: item.bottom + '%',
            left: item.left + '%',
            animation: 'pulse 2s ease-in-out infinite',
            animationDelay: item.delay + 's',
          }}
        >
          ⭐
        </div>
      ))}

      {bubbles.map((item) => (
        <div
          key={item.id}
          className="absolute rounded-full bg-white/10 animate-float"
          style={{
            width: item.size + 'px',
            height: item.size + 'px',
            left: item.left + '%',
            top: item.top + '%',
            animationDelay: item.delay + 's',
            animationDuration: item.duration + 's',
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent"></div>
    </div>
  );
};

/* =========================
   MODAL KECIL (untuk hotspot)
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
   MODAL TENTANG (FULLSCREEN) – RESPONSIF & SCROLLABLE DI MOBILE
========================= */
const TentangModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-gradient-to-b from-blue-900 via-blue-700 to-cyan-500 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animasi background */}
          <BackgroundAnimations />

          {/* Konten modal */}
          <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6">
            <div className="max-w-4xl w-full text-white">
              {/* Tombol tutup – di pojok kanan atas */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-md border border-white/30 transition z-20"
              >
                <X size={28} />
              </button>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3 drop-shadow-lg">
                  <BookOpen className="text-amber-300" /> Tentang Susur Sungai
                </h1>

                <p className="text-base md:text-lg text-white/90 mb-4 drop-shadow">
                  <strong>Susur Sungai</strong> adalah platform pembelajaran interaktif yang mengajak
                  Anda menjelajahi keindahan dan keunikan sungai-sungai di Kalimantan Selatan.
                  Dikemas dalam bentuk permainan edukasi, pengguna dapat belajar sambil berpetualang.
                </p>

                {/* Grid fitur */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
                    <Map className="w-8 h-8 mx-auto text-amber-300 mb-1" />
                    <h3 className="font-semibold text-base">Jelajahi Sungai</h3>
                    <p className="text-xs text-white/80">Kenali sungai-sungai ikonik Banjarmasin.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
                    <Trophy className="w-8 h-8 mx-auto text-amber-300 mb-1" />
                    <h3 className="font-semibold text-base">Kuis & Skor</h3>
                    <p className="text-xs text-white/80">Uji pengetahuan dan kumpulkan poin.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
                    <Users className="w-8 h-8 mx-auto text-amber-300 mb-1" />
                    <h3 className="font-semibold text-base">Untuk Guru & Siswa</h3>
                    <p className="text-xs text-white/80">Pantau progres dan belajar menyenangkan.</p>
                  </div>
                </div>

                {/* Fitur Utama */}
                <div className="mb-4 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
                    <Info size={18} className="text-amber-300" /> Fitur Utama
                  </h2>
                  <ul className="grid grid-cols-2 gap-1 text-xs text-white/90 list-disc list-inside pl-4">
                    <li>Peta interaktif</li>
                    <li>Musik latar</li>
                    <li>Login & progres</li>
                    <li>Dashboard guru</li>
                    <li>Kuis berbagai tingkat</li>
                    <li>Responsif</li>
                  </ul>
                </div>

                {/* Tim Pengembang */}
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
                    <Code size={18} className="text-amber-300" /> Tim Pengembang
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 text-sm font-bold">HS</div>
                      <div className="text-xs">Harja Santana Purba</div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 text-sm font-bold">IM</div>
                      <div className="text-xs">Ihdalhubbi Maulida</div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 text-sm font-bold">KR</div>
                      <div className="text-xs">Khoyrur Roykhan</div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 text-sm font-bold">AN</div>
                      <div className="text-xs">Alfika Nurfadia</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 justify-center text-xs text-white/70">
                    <span className="flex items-center gap-1"><Mail size={14} /> pilkom@ulm.ac.id</span>
                    <span className="flex items-center gap-1"><Globe size={14} /> pilkom.ulm.ac.id</span>
                  </div>
                </div>

                <div className="mt-4 text-center text-xs text-white/50 border-t border-white/20 pt-3">
                  © Tim Game Edukasi Susur Sungai • 2026
                </div>
              </motion.div>
            </div>
          </div>
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
        top: `${randomY}%`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.4, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2.5,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        style={{
          width: '10px',
          height: '10px',
          background: 'white',
          clipPath:
            'polygon(50% 0%, 60% 35%, 100% 50%, 60% 65%, 50% 100%, 40% 65%, 0% 50%, 40% 35%)',
          boxShadow: `
            0 0 8px white,
            0 0 16px white,
            0 0 25px rgba(255,255,255,0.9)
          `,
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
            'radial-gradient(circle, rgba(255,255,200,0.4) 0%, rgba(255,255,200,0.2) 40%, transparent 70%)',
          scale: 1.2,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

/* =========================
   MAIN LANDINGPAGE
========================= */
const LandingPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Setup background music
  useEffect(() => {
    audioRef.current = new Audio(panting);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;

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

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Toggle music
  const toggleMusic = () => {
    playClickSound();
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play();
        setIsMusicPlaying(true);
      }
    }
  };

  // Cek status login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
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

  // Tombol Mulai Petualangan -> selalu ke /sungai
  const handleStartAdventure = () => {
    playClickSound();
    setTimeout(() => {
      navigate('/sungai');
    }, 100);
  };

  // Dashboard Guru
  const handleDashboard = () => {
    playClickSound();
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  // Login Navigation
  const handleLoginNavigation = () => {
    playClickSound();
    setTimeout(() => {
      navigate('/loginregister');
    }, 100);
  };

  // Buka/tutup modal tentang
  const handleOpenAbout = () => {
    playClickSound();
    setAboutModalOpen(true);
  };

  const handleCloseAbout = () => {
    playClickSound();
    setAboutModalOpen(false);
  };

  // Modal hotspot
  const handleModalClose = () => {
    playClickSound();
    setActiveModal(null);
  };

  const handleHotspotClick = (title, content) => {
    playClickSound();
    setActiveModal({ title, content });
  };

  // Handler untuk resume audio context
  const handleUserInteraction = () => {
    resumeAudio();
  };

  const handleHover = () => {
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
            'radial-gradient(circle at center, rgba(255,255,255,0.15), transparent 60%)',
        }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      {/* HOTSPOT MONYET */}
      <Hotspot
        style={{ left: '5%', top: '48%', width: '180px', height: '180px' }}
        onClick={() =>
          handleHotspotClick(
            'Pulau Kembang',
            'Habitat bekantan yang menjadi ikon wisata Kalimantan Selatan.'
          )
        }
      />

      {/* HOTSPOT MENARA */}
      <Hotspot
        style={{ right: '8%', top: '28%', width: '180px', height: '220px' }}
        onClick={() =>
          handleHotspotClick(
            'Menara Pandang',
            'Salah satu ikon Kota Banjarmasin dengan pemandangan sungai dari atas.'
          )
        }
      />

      {/* HEADER - Tombol Sound, Tentang, Login/Logout */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-3 flex-wrap justify-end">
        {/* Music Control */}
        <button
          onClick={toggleMusic}
          onMouseEnter={handleHover}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md border border-white/30 transition duration-200"
          title={isMusicPlaying ? 'Mute background music' : 'Play background music'}
        >
          {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        {/* Tombol Tentang */}
        <button
          onClick={handleOpenAbout}
          onMouseEnter={handleHover}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/30 transition duration-200 flex items-center gap-2"
        >
          <Info size={18} /> Tentang
        </button>

        {/* Login / Logout */}
        {!loading &&
          (user ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                <User size={16} className="text-white" />
                <span className="text-white text-sm font-medium truncate max-w-[120px]">
                  {userName}
                </span>
              </div>

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
          ))}
      </div>

      {/* TITLE */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          {/* Sapaan Selamat Datang */}
          {!loading && user && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                Selamat Datang, {userName}!
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
                Selamat Datang di Susur Sungai!
              </h2>
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
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
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

          {/* Tombol Mulai Petualangan */}
          {!loading && user && userRole === 'teacher' ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                onClick={handleDashboard}
                onMouseEnter={handleHover}
                className="px-8 py-3 bg-purple-500 text-white rounded-full font-bold flex items-center gap-2 shadow-lg mx-auto pointer-events-auto z-20"
                animate={{
                  y: [0, -6, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard Guru
              </motion.button>

              <motion.button
                onClick={handleStartAdventure}
                onMouseEnter={handleHover}
                className="px-8 py-3 bg-amber-400 text-amber-900 rounded-full font-bold flex items-center gap-2 shadow-lg mx-auto pointer-events-auto z-20"
                animate={{
                  y: [0, -6, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: 0.3,
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                Mulai Petualangan
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={handleStartAdventure}
              onMouseEnter={handleHover}
              className="px-8 py-3 bg-amber-400 text-amber-900 rounded-full font-bold flex items-center gap-2 shadow-lg mx-auto pointer-events-auto z-20"
              animate={{
                y: [0, -6, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              Mulai Petualangan
            </motion.button>
          )}

          {!loading && !user && (
            <motion.p
              className="text-white/80 text-xs mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Login untuk menyimpan progres dan skor permainanmu
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-4 w-full text-center text-white/60 text-xs z-10">
        © 2026 Susur Sungai • Banjarmasin
      </div>

      {/* MODAL HOTSPOT */}
      <Modal
        isOpen={activeModal !== null}
        onClose={handleModalClose}
        title={activeModal?.title || ''}
      >
        <p className="text-gray-600">{activeModal?.content}</p>
      </Modal>

      {/* MODAL TENTANG FULLSCREEN */}
      <TentangModal isOpen={aboutModalOpen} onClose={handleCloseAbout} />

      {/* CSS Global untuk animasi */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-30px) scale(1.2);
            opacity: 0.2;
          }
        }

        @keyframes swim-right-to-left {
          0% {
            transform: translateX(0);
            opacity: 0.7;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(-110vw));
            opacity: 0.7;
          }
        }

        @keyframes swim-right-to-left-slow {
          0% {
            transform: translateX(0);
            opacity: 0.6;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(-115vw));
            opacity: 0.6;
          }
        }

        @keyframes swim-turtle-right-to-left {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0.5;
          }
          25% {
            transform: translateX(calc(-50vw)) translateY(-20px);
            opacity: 1;
          }
          50% {
            transform: translateX(calc(-100vw)) translateY(0);
            opacity: 1;
          }
          75% {
            transform: translateX(calc(-150vw)) translateY(-30px);
            opacity: 1;
          }
          100% {
            transform: translateX(calc(-200vw)) translateY(0);
            opacity: 0.5;
          }
        }

        @keyframes swim-turtle2-right-to-left {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0.4;
          }
          33% {
            transform: translateX(calc(-70vw)) translateY(-25px);
            opacity: 1;
          }
          66% {
            transform: translateX(calc(-140vw)) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateX(calc(-200vw)) translateY(-20px);
            opacity: 0.4;
          }
        }

        @keyframes swim-octopus-right-to-left {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0.3;
          }
          30% {
            transform: translateX(calc(-60vw)) translateY(-15px);
            opacity: 0.8;
          }
          60% {
            transform: translateX(calc(-120vw)) translateY(15px);
            opacity: 0.8;
          }
          100% {
            transform: translateX(calc(-200vw)) translateY(0);
            opacity: 0.3;
          }
        }

        @keyframes sway {
          0%,
          100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }

        .animate-float {
          animation: float ease-in-out infinite;
        }

        .animate-sway {
          animation: sway ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;