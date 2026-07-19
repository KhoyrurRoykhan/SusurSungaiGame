// src/components/LoginRegister.jsx
import React, { useState, useCallback, useMemo, memo } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Import SoundManager
import { playHoverSound, playClickSound, resumeAudio } from '../../src/utils/SoundManager';

// =========================
// FUNGSI WRAPPER UNTUK HOVER SOUND
// =========================
const handleHoverSound = () => {
  try {
    playHoverSound();
  } catch (error) {
    console.error('❌ Hover sound error:', error);
  }
};

// Memoized input component to prevent re-renders
const FormInput = memo(({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  type = 'text', 
  placeholder,
  required = false 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-white/90 mb-1.5">
        {label} {required && <span className="text-red-300">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onMouseEnter={handleHoverSound}
        className={`w-full px-4 py-3 backdrop-blur-sm bg-white/20 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60 ${
          error ? 'border-red-400/50' : 'border-white/30'
        }`}
        placeholder={placeholder}
      />
      {error && <p className="text-red-300 text-xs mt-1">{error}</p>}
    </div>
  );
});

FormInput.displayName = 'FormInput';

// Memoized background animations component
const BackgroundAnimations = memo(() => {
  // Use useMemo for static elements
  const seaweeds = useMemo(() => [...Array(15)].map((_, i) => ({
    id: `seaweed-${i}`,
    height: Math.random() * 60 + 30,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 1
  })), []);

  const fish = useMemo(() => [...Array(12)].map((_, i) => ({
    id: `fish-${i}`,
    size: Math.random() * 20 + 10,
    top: Math.random() * 70 + 10,
    delay: Math.random() * 10,
    duration: Math.random() * 8 + 6,
  })), []);

  const bigFish = useMemo(() => [...Array(4)].map((_, i) => ({
    id: `big-fish-${i}`,
    size: Math.random() * 30 + 25,
    top: Math.random() * 60 + 20,
    delay: Math.random() * 15,
    duration: Math.random() * 12 + 10,
  })), []);

  const turtles = useMemo(() => [...Array(3)].map((_, i) => ({
    id: `turtle-${i}`,
    size: Math.random() * 25 + 20,
    top: Math.random() * 50 + 20,
    delay: Math.random() * 20,
    duration: Math.random() * 15 + 12,
  })), []);

  const turtles2 = useMemo(() => [...Array(2)].map((_, i) => ({
    id: `turtle2-${i}`,
    size: Math.random() * 30 + 25,
    top: Math.random() * 40 + 30,
    delay: Math.random() * 25,
    duration: Math.random() * 20 + 15,
  })), []);

  const octopuses = useMemo(() => [...Array(2)].map((_, i) => ({
    id: `octopus-${i}`,
    size: Math.random() * 25 + 20,
    top: Math.random() * 60 + 20,
    delay: Math.random() * 30,
    duration: Math.random() * 18 + 14,
  })), []);

  const starfish = useMemo(() => [...Array(5)].map((_, i) => ({
    id: `starfish-${i}`,
    size: Math.random() * 15 + 10,
    bottom: Math.random() * 20 + 10,
    left: Math.random() * 100,
    delay: Math.random() * 2
  })), []);

  const bubbles = useMemo(() => [...Array(20)].map((_, i) => ({
    id: `bubble-${i}`,
    size: Math.random() * 15 + 3,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 5 + 3
  })), []);

  return (
    <div className="absolute inset-0">
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-yellow-900/30 to-transparent"></div>
      
      {seaweeds.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-0 w-1 bg-green-800/40 rounded-full origin-bottom animate-sway"
          style={{
            height: item.height + 'px',
            left: item.left + '%',
            animationDelay: item.delay + 's',
            animationDuration: item.duration + 's'
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
            animationDelay: item.delay + 's'
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
            animationDuration: item.duration + 's'
          }}
        />
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent"></div>
    </div>
  );
});

BackgroundAnimations.displayName = 'BackgroundAnimations';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('teacher');
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    nis: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handler untuk resume audio context
  const handleUserInteraction = () => {
    resumeAudio();
  };

  // Optimized handler with useCallback
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Debounced error clearing
    if (errors[name] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: prev.general ? '' : prev.general
      }));
    }
  }, [errors]);

  // DEFINE resetForm FIRST before using it
  const resetForm = useCallback(() => {
    setFormData({ 
      name: '',
      nip: '', 
      nis: '', 
      email: '', 
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const { name, nip, nis, email, password, confirmPassword } = formData;

    if (isLogin) {
      if (!email) newErrors.email = 'Email wajib diisi';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Format email tidak valid';
      
      if (!password) newErrors.password = 'Password wajib diisi';
      else if (password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    } else {
      if (!name) newErrors.name = 'Nama lengkap wajib diisi';
      
      if (role === 'teacher') {
        if (!nip) newErrors.nip = 'NIP/NIPK wajib diisi';
        else if (!/^\d+$/.test(nip)) newErrors.nip = 'NIP/NIPK harus berupa angka';
      } else {
        if (!nis) newErrors.nis = 'NIS/NISN/NIM wajib diisi';
        else if (!/^\d+$/.test(nis)) newErrors.nis = 'NIS/NISN/NIM harus berupa angka';
      }
      
      if (!email) newErrors.email = 'Email wajib diisi';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Format email tidak valid';
      
      if (!password) newErrors.password = 'Password wajib diisi';
      else if (password.length < 6) newErrors.password = 'Password minimal 6 karakter';
      
      if (!confirmPassword) newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Password tidak sama';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isLogin, role]);

  const initializeGameScores = useCallback((studentId, studentName) => {
    return {
      id_student: studentId,
      student_name: studentName,
      barito: { time: null, path: null, skor: 0 },
      alalak: { time: null, path: null, skor: 0 },
      alalak_part2: { time: null, path: null, skor: 0 },
      awang: { time: null, path: null, skor: 0 },
      martapura: { time: null, path: null, skor: 0 },
      martapura_part2: { time: null, path: null, skor: 0 },
      martapura_part3: { time: null, path: null, skor: 0 },
      martapura_part4: { time: null, path: null, skor: 0 },
      pelambuan: { time: null, path: null, skor: 0 },
      kuin: { time: null, path: null, skor: 0 },
      kuin_part2: { time: null, path: null, skor: 0 },
      kuin_part3: { time: null, path: null, skor: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    playClickSound(); // Click sound
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        const user = userCredential.user;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Login berhasil:', userData);
          
          if (userData.role === 'teacher') {
            alert(`Selamat datang, ${userData.name || 'Guru'}!`);
            window.location.href = '/dashboard';
          } else {
            alert(`Selamat datang, ${userData.name || 'Siswa'}!`);
            window.location.href = '/';
          }
        } else {
          throw new Error('Data user tidak ditemukan');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        const user = userCredential.user;
        
        await updateProfile(user, {
          displayName: formData.name
        });
        
        const userData = {
          uid: user.uid,
          name: formData.name,
          email: formData.email,
          role: role,
          nip: role === 'teacher' ? formData.nip : null,
          nis: role === 'student' ? formData.nis : null,
          room_id: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
        
        if (role === 'student') {
          const gameScores = initializeGameScores(user.uid, formData.name);
          await setDoc(doc(db, 'game_skor', user.uid), gameScores);
          console.log('Game scores initialized for student:', user.uid);
        }
        
        console.log('Registrasi berhasil:', userData);
        alert('Pendaftaran berhasil! Silakan login untuk melanjutkan.');
        
        resetForm();
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Error:', error);
      
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Email tidak ditemukan. Silakan daftar terlebih dahulu.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Password salah. Silakan coba lagi.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Terlalu banyak percobaan. Silakan coba lagi nanti.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid.';
          break;
        default:
          errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
      }
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [formData, isLogin, role, validateForm, initializeGameScores, resetForm]);

  const handleTabChange = useCallback((mode) => {
    playClickSound(); // Click sound
    setIsLogin(mode);
    resetForm();
  }, [resetForm]);

  const handleRoleChange = useCallback((newRole) => {
    playClickSound(); // Click sound
    setRole(newRole);
    setFormData(prev => ({
      ...prev,
      nip: '',
      nis: ''
    }));
    setErrors({});
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-blue-900 via-blue-700 to-cyan-500"
      onClick={handleUserInteraction}
    >
      <BackgroundAnimations />

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-8 border border-white/30 animate-scale-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/80 to-cyan-400/80 rounded-2xl mb-3 backdrop-blur-sm border border-white/30 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              {isLogin ? 'Selamat Datang' : 'Daftar Akun'}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {isLogin ? 'Masuk untuk melanjutkan petualangan' : 'Mulai petualanganmu di sungai'}
            </p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 backdrop-blur-sm bg-red-500/20 border border-red-400/30 rounded-2xl text-white/90 text-sm">
              {errors.general}
            </div>
          )}

          <div className="flex rounded-2xl backdrop-blur-sm bg-white/10 p-1 mb-6 border border-white/20">
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                isLogin 
                  ? 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white shadow-lg border border-white/30' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => handleTabChange(true)}
              onMouseEnter={handleHoverSound}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                !isLogin 
                  ? 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white shadow-lg border border-white/30' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => handleTabChange(false)}
              onMouseEnter={handleHoverSound}
            >
              Register
            </button>
          </div>

          {!isLogin && (
            <div className="flex rounded-2xl backdrop-blur-sm bg-white/10 p-1 mb-6 border border-white/20">
              <button
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                  role === 'teacher' 
                    ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-lg border border-white/30' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => handleRoleChange('teacher')}
                onMouseEnter={handleHoverSound}
              >
                Guru
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                  role === 'student' 
                    ? 'bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white shadow-lg border border-white/30' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => handleRoleChange('student')}
                onMouseEnter={handleHoverSound}
              >
                Siswa
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <FormInput
                label="Nama Lengkap"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Masukkan nama lengkap"
                required
              />
            )}

            {!isLogin && role === 'teacher' && (
              <FormInput
                label="NIP / NIPK"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                error={errors.nip}
                placeholder="Masukkan NIP/NIPK (angka)"
                required
              />
            )}

            {!isLogin && role === 'student' && (
              <FormInput
                label="NIS / NISN"
                name="nis"
                value={formData.nis}
                onChange={handleChange}
                error={errors.nis}
                placeholder="Masukkan NIS/NISN (angka)"
                required
              />
            )}

            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="email@contoh.com"
              required
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Minimal 6 karakter"
              required
            />

            {!isLogin && (
              <FormInput
                label="Konfirmasi Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Ulangi password"
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={handleHoverSound}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3.5 rounded-2xl transition duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed border border-white/30"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                isLogin ? 'Masuk' : 'Daftar'
              )}
            </button>
          </form>

          <div className="text-center text-sm text-white/70 mt-6">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              className="text-white font-medium hover:text-cyan-200 transition-colors underline-offset-2 hover:underline"
              onClick={() => handleTabChange(!isLogin)}
              onMouseEnter={handleHoverSound}
            >
              {isLogin ? 'Daftar di sini' : 'Login di sini'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.2; }
        }
        
        @keyframes swim-right-to-left {
          0% { 
            transform: translateX(0);
            opacity: 0.7;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
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
          10% { opacity: 1; }
          90% { opacity: 1; }
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

export default LoginRegister;