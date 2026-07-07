import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DaftarSungai from './components/DaftarSungai';
import SungaiBarito from './components/game/SungaiBarito';
import SungaiAlalak from './components/game/SungaiAlalak';
import SungaiMartapura from './components/game/SungaiMartapura';
import SungaiAlalakPart2 from './components/game/SungaiAlalakPart2';
import SungaiAwang from './components/game/SungaiAwang';
import SungaiMartapuraPart2 from './components/game/SungaiMartapuraPart2';
import SungaiMartapuraPart4 from './components/game/SungaiMartapuraPart4';
import SungaiMartapuraPart3 from './components/game/SungaiMartapuraPart3';
import SungaiKuin from './components/game/SungaiKuin';
import SungaiKuinPart2 from './components/game/SungaiKuinPart2';
import SungaiKuinPart3 from './components/game/SungaiKuinPart3';
import SungaiPelambuan from './components/game/SungaiPelambuan';
import LoginRegister from './components/LoginRegister';
import DashboardGuru from './components/DashboardGuru';
import Maintenance from './components/Maintenance';
import Tutorial from './components/game/Tutorial';
import { preloadSounds, resumeAudio, getAudioStatus } from './utils/SoundManager';

function App() {
  useEffect(() => {
    // Preload sounds saat aplikasi dimulai
    console.log('🔊 Preloading sounds...');
    preloadSounds()
      .then(() => {
        console.log('✅ All sounds preloaded successfully!');
        // Log status audio setelah preload
        console.log('📊 Audio Status:', getAudioStatus());
      })
      .catch(err => {
        console.error('❌ Error preloading sounds:', err);
      });
  }, []);

  // Global handler untuk resume audio context
  useEffect(() => {
    // Fungsi untuk resume audio saat user berinteraksi
    const handleUserInteraction = () => {
      resumeAudio();
    };

    // Daftar event yang akan memicu resume audio
    const events = [
      'click',
      'touchstart', 
      'keydown',
      'mousedown',
      'scroll',
      'touchmove'
    ];

    // Tambahkan event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    // Log status awal
    console.log('🎵 Audio Auto-Resume enabled');

    // Cleanup event listeners
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      console.log('🎵 Audio Auto-Resume disabled');
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/loginregister" element={<LoginRegister />} />
        <Route path="/dashboard" element={<DashboardGuru />} />
        <Route path="/sungai" element={<DaftarSungai />} />
        <Route path="/game/tutorial" element={<Tutorial />} />
        <Route path="/game/barito" element={<SungaiBarito />} />
        <Route path="/game/alalak" element={<SungaiAlalak />} />
        <Route path="/game/alalak2" element={<SungaiAlalakPart2 />} />
        <Route path="/game/awang" element={<SungaiAwang />} />
        <Route path="/game/martapura" element={<SungaiMartapura />} />
        <Route path="/game/martapura2" element={<SungaiMartapuraPart2 />} />
        <Route path="/game/martapura4" element={<SungaiMartapuraPart4 />} />
        <Route path="/game/martapura3" element={<SungaiMartapuraPart3 />} />
        <Route path="/game/kuin" element={<SungaiKuin />} />
        <Route path="/game/kuin2" element={<SungaiKuinPart2 />} />
        <Route path="/game/kuin3" element={<SungaiKuinPart3 />} />
        <Route path="/game/pelambuan" element={<SungaiPelambuan />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Routes>
    </Router>
  );
}

export default App;