import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Turtle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import bg_sungai from './game/assets/bg_terbaru.png';

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
  const navigate = useNavigate();

  return (

    <div
      className="h-screen w-screen overflow-hidden relative bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_sungai})` }}
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
        onClick={() =>
          setActiveModal({
            title: "Pulau Kembang",
            content:
              "Habitat bekantan yang menjadi ikon wisata Kalimantan Selatan.",
          })
        }
      />

      {/* HOTSPOT MENARA */}
      <Hotspot
        style={{ right: "8%", top: "28%", width: "180px", height: "220px" }}
        onClick={() =>
          setActiveModal({
            title: "Menara Pandang",
            content:
              "Salah satu ikon Kota Banjarmasin dengan pemandangan sungai dari atas.",
          })
        }
      />

      {/* TITLE */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >

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

          <motion.button
            onClick={() => navigate('/sungai')}
            className="px-8 py-3 bg-amber-400 text-amber-900 rounded-full font-bold flex items-center gap-2 shadow-lg"
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
          >
            <Play className="w-5 h-5" />
            Mulai Petualangan
          </motion.button>

        </motion.div>

      </div>

      {/* FOOTER */}
      <div className="absolute bottom-4 w-full text-center text-white/60 text-xs z-10">
        © 2026 Susur Sungai • Banjarmasin
      </div>

      {/* MODAL */}
      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={activeModal?.title || ''}
      >
        <p className="text-gray-600">{activeModal?.content}</p>
      </Modal>

    </div>
  );
};

export default LandingPage;