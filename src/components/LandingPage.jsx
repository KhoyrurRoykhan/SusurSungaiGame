import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Waves, 
  Map, 
  BookOpen, 
  Play, 
  Droplets,
  Anchor,
  Fish,
  Turtle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// Animated Wave Component
const Wave = ({ color, speed, opacity, offset }) => {
  return (
    <motion.div
      className="absolute w-[200%] h-full"
      style={{
        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='${encodeURIComponent(color)}' fill-opacity='1' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundSize: '50% 100%',
        backgroundRepeat: 'repeat-x',
        opacity,
        bottom: offset,
      }}
      animate={{
        x: [0, -1440],
      }}
      transition={{
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: speed,
          ease: "linear",
        },
      }}
    />
  );
};

// Floating Boat Component
const FloatingBoat = ({ delay }) => {
  return (
    <motion.div
      className="absolute text-amber-100/60"
      initial={{ x: -100, y: 0 }}
      animate={{
        x: ['-10%', '110%'],
        y: [0, -10, 0, -5, 0],
      }}
      transition={{
        x: {
          duration: 30,
          repeat: Infinity,
          delay,
          ease: "linear",
        },
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >      
    </motion.div>
  );
};

// Feature Item Component
const FeatureItem = ({ icon: Icon, title, delay }) => {
  return (
    <motion.div
      className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full hover:bg-white/20 transition-all cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-amber-900">
        <Icon size={16} />
      </div>
      <span className="text-white font-medium text-sm">{title}</span>
    </motion.div>
  );
};

// Modal Component
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
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-teal-900">{title}</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate();


  const features = [
    { id: 'ekosistem', icon: Droplets, title: 'Ekosistem Sungai', content: 'Pelajari flora dan fauna sungai Martapura dan Barito, termasuk ikan endemik dan tanaman mangrove.' },
    { id: 'edukasi', icon: BookOpen, title: 'Edukasi Interaktif', content: 'Selesaikan misi tentang kebersihan sungai, daur hidup air, dan pentingnya menjaga kualitas air.' },
    { id: 'budaya', icon: Anchor, title: 'Budaya Sungai', content: 'Kenali tradisi Pasar Terapung, rumah lanting, dan filosofi Kayuh Baimbai (mendayung bersama).' },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-teal-400 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sun */}
        <motion.div 
          className="absolute top-10 right-10 w-24 h-24 bg-yellow-300 rounded-full blur-xl opacity-70"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* Decorative Clouds */}
        <motion.div 
          className="absolute top-20 left-10 text-white/30"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <Waves size={80} />
        </motion.div>
        
        <motion.div 
          className="absolute top-32 right-32 text-white/20"
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        >
          <Waves size={60} />
        </motion.div>
      </div>

      {/* Floating Boats */}
      <div className="absolute top-1/3 left-0 w-full pointer-events-none">
        <FloatingBoat delay={0} />
        <FloatingBoat delay={15} />
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl"
        >
          {/* Badge */}
          <motion.div 
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Turtle className="w-4 h-4" />
            <span className="text-sm font-medium">Game Edukasi</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 drop-shadow-lg">
            <span className="block">SUSUR</span>
            <span className="block text-teal-100">SUNGAI</span>
          </h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-lg md:text-xl text-white/90 mb-6 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Petualangan Kura-Kura di Kota Seribu Sungai
          </motion.p>

          {/* Features Row */}
          {/* <div className="flex flex-wrap justify-center gap-3 mb-8">
            {features.map((feature, idx) => (
              <FeatureItem 
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                delay={0.4 + (idx * 0.1)}
                onClick={() => setActiveModal(feature)}
              />
            ))}
          </div> */}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={() => navigate('/sungai')}
            className="group relative px-8 py-3 bg-amber-400 hover:bg-amber-300 text-amber-900 rounded-full font-bold text-lg shadow-xl transition-all overflow-hidden flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Play className="w-5 h-5 fill-current" />
            Mulai Petualangan
          </motion.button>
            
            {/* <motion.button
              className="px-8 py-3 bg-white/20 backdrop-blur-md text-white border-2 border-white/50 rounded-full font-bold text-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => setActiveModal({ id: 'map', title: 'Peta Sungai', content: 'Jelajahi 103 sungai di Banjarmasin termasuk Martapura, Barito, dan Kuin.' })}
            >
              <Map className="w-5 h-5" />
              Lihat Peta
            </motion.button> */}
          </div>
        </motion.div>
      </div>

      {/* Wave Layers - Bottom */}
        <div class="river">

        <svg viewBox="0 0 2880 120">
{/* 
        <!-- gelombang belakang --> */}
        <path class="wave1" d="M0,45 C150,75 300,15 450,45 C600,75 750,15 900,45 C1050,75 1200,15 1440,45 C1590,75 1740,15 1890,45 C2040,75 2190,15 2340,45 C2490,75 2640,15 2880,45 L2880,1000 L0,1000 Z"/>

        {/* <!-- gelombang depan --> */}
        <path class="wave2" d="M0,55 C150,25 300,65 450,55 C600,25 750,65 900,55 C1050,25 1200,65 1440,55 C1590,25 1740,65 1890,55 C2040,25 2190,65 2340,55 C2490,25 2640,65 2880,55 L2880,1000 L0,1000 Z"/>

        {/* <!-- busa --> */}
        <path class="foam" d="M0,55 C150,75 300,45 450,55 C600,75 750,45 900,55 C1050,75 1200,45 1440,55 C1590,75 1740,45 1890,55 C2040,75 2190,45 2340,55 C2490,75 2640,45 2880,55"/>

        </svg>

        <div class="splash">
        <div class="drop"></div>
        <div class="drop"></div>
        <div class="drop"></div>
        <div class="drop"></div>
        </div>

        </div>

      {/* Footer Info */}
      <motion.div 
        className="absolute bottom-4 left-0 w-full text-center text-white/60 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>© 2024 Susur Sungai • Kota Banjarmasin</p>
      </motion.div>

      {/* Modals */}
      <Modal 
        isOpen={activeModal !== null} 
        onClose={() => setActiveModal(null)}
        title={activeModal?.title || ''}
      >
        <p className="text-gray-600 leading-relaxed">{activeModal?.content}</p>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;