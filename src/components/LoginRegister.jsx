// src/components/LoginRegister.jsx
import React, { useState } from 'react';
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

const LoginRegister = () => {
  // State untuk toggle tab Login / Register
  const [isLogin, setIsLogin] = useState(true);
  // State untuk peran (teacher / student)
  const [role, setRole] = useState('teacher');
  // State untuk form data
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    nis: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  // State untuk pesan error
  const [errors, setErrors] = useState({});
  // State untuk loading
  const [loading, setLoading] = useState(false);

  // Handler perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Hapus error untuk field yang sedang diubah
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Hapus error general
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: '' }));
    }
  };

  // Validasi form
  const validateForm = () => {
    const newErrors = {};
    const { name, nip, nis, email, password, confirmPassword } = formData;

    if (isLogin) {
      // Validasi Login
      if (!email) newErrors.email = 'Email wajib diisi';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Format email tidak valid';
      
      if (!password) newErrors.password = 'Password wajib diisi';
      else if (password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    } else {
      // Validasi Register
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
  };

  // Initialize game scores for student
  const initializeGameScores = (studentId, studentName) => {
    const gameData = {
      id_student: studentId,
      student_name: studentName,
      // Sungai Barito
      barito: {
        time: null,
        path: null,
        skor: 0
      },
      // Sungai Alalak
      alalak: {
        time: null,
        path: null,
        skor: 0
      },
      alalak_part2: {
        time: null,
        path: null,
        skor: 0
      },
      // Sungai Awang
      awang: {
        time: null,
        path: null,
        skor: 0
      },
      // Sungai Martapura
      martapura: {
        time: null,
        path: null,
        skor: 0
      },
      martapura_part2: {
        time: null,
        path: null,
        skor: 0
      },
      martapura_part3: {
        time: null,
        path: null,
        skor: 0
      },
      martapura_part4: {
        time: null,
        path: null,
        skor: 0
      },
      // Sungai Pelambuan
      pelambuan: {
        time: null,
        path: null,
        skor: 0
      },
      // Sungai Kuin
      kuin: {
        time: null,
        path: null,
        skor: 0
      },
      kuin_part2: {
        time: null,
        path: null,
        skor: 0
      },
      kuin_part3: {
        time: null,
        path: null,
        skor: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    return gameData;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        // ============ LOGIN ============
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        const user = userCredential.user;
        
        // Ambil data user dari Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Login berhasil:', userData);
          
          // Redirect berdasarkan role
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
        // ============ REGISTER ============
        // 1. Buat akun di Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        const user = userCredential.user;
        
        // 2. Update profil dengan nama
        await updateProfile(user, {
          displayName: formData.name
        });
        
        // 3. Simpan data ke Firestore
        const userData = {
          uid: user.uid,
          name: formData.name,
          email: formData.email,
          role: role,
          // Teacher fields
          nip: role === 'teacher' ? formData.nip : null,
          // Student fields
          nis: role === 'student' ? formData.nis : null,
          // Room ID akan diisi oleh guru di dashboard (kosong saat register)
          room_id: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Simpan ke koleksi 'users'
        await setDoc(doc(db, 'users', user.uid), userData);
        
        // 4. Jika role adalah student, buatkan game_skor
        if (role === 'student') {
          const gameScores = initializeGameScores(user.uid, formData.name);
          // Simpan ke koleksi 'game_skor' dengan ID = UID student
          await setDoc(doc(db, 'game_skor', user.uid), gameScores);
          console.log('Game scores initialized for student:', user.uid);
        }
        
        console.log('Registrasi berhasil:', userData);
        alert('Pendaftaran berhasil! Silakan login untuk melanjutkan.');
        
        // Reset form dan pindah ke tab Login
        resetForm();
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Handle error Firebase
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
  };

  // Reset form
  const resetForm = () => {
    setFormData({ 
      name: '',
      nip: '', 
      nis: '', 
      email: '', 
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleTabChange = (mode) => {
    setIsLogin(mode);
    resetForm();
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    // Reset field yang tidak diperlukan
    setFormData(prev => ({
      ...prev,
      nip: '',
      nis: ''
    }));
    setErrors({});
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-blue-900 via-blue-700 to-cyan-500">
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

      {/* Konten Utama dengan Liquid Glass */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-8 border border-white/30 animate-scale-in">
          {/* Header */}
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

          {/* Error General */}
          {errors.general && (
            <div className="mb-4 p-3 backdrop-blur-sm bg-red-500/20 border border-red-400/30 rounded-2xl text-white/90 text-sm">
              {errors.general}
            </div>
          )}

          {/* Tab Login / Register dengan Liquid Glass */}
          <div className="flex rounded-2xl backdrop-blur-sm bg-white/10 p-1 mb-6 border border-white/20">
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                isLogin 
                  ? 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white shadow-lg border border-white/30' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => handleTabChange(true)}
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
            >
              Register
            </button>
          </div>

          {/* Pilihan Peran (hanya untuk Register) dengan Liquid Glass */}
          {!isLogin && (
            <div className="flex rounded-2xl backdrop-blur-sm bg-white/10 p-1 mb-6 border border-white/20">
              <button
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                  role === 'teacher' 
                    ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-lg border border-white/30' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => handleRoleChange('teacher')}
              >
                👨‍🏫 Teacher
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition ${
                  role === 'student' 
                    ? 'bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white shadow-lg border border-white/30' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => handleRoleChange('student')}
              >
                🎓 Student
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field Nama (hanya untuk Register) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">
                  Nama Lengkap <span className="text-red-300">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 backdrop-blur-sm bg-white/20 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60 ${
                    errors.name ? 'border-red-400/50' : 'border-white/30'
                  }`}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            {/* Field NIP/NIPK (hanya untuk Register Teacher) */}
            {!isLogin && role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">
                  NIP / NIPK <span className="text-red-300">*</span>
                </label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 backdrop-blur-sm bg-white/20 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60 ${
                    errors.nip ? 'border-red-400/50' : 'border-white/30'
                  }`}
                  placeholder="Masukkan NIP/NIPK (angka)"
                />
                {errors.nip && <p className="text-red-300 text-xs mt-1">{errors.nip}</p>}
              </div>
            )}

            {/* Field NIS/NISN/NIM (hanya untuk Register Student) */}
            {!isLogin && role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">
                  NIS / NISN / NIM <span className="text-red-300">*</span>
                </label>
                <input
                  type="text"
                  name="nis"
                  value={formData.nis}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 backdrop-blur-sm bg-white/20 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60 ${
                    errors.nis ? 'border-red-400/50' : 'border-white/30'
                  }`}
                  placeholder="Masukkan NIS/NISN/NIM (angka)"
                />
                {errors.nis && <p className="text-red-300 text-xs mt-1">{errors.nis}</p>}
              </div>
            )}

            {/* Email (selalu tampil) */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">
                Email <span className="text-red-300">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 backdrop-blur-sm bg-white/20 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60 ${
                  errors.email ? 'border-red-400/50' : 'border-white/30'
                }`}
                placeholder="email@contoh.com"
              />
              {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">
                Password <span className="text-red-300">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 backdrop-blur-sm bg-white/20 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60 ${
                  errors.password ? 'border-red-400/50' : 'border-white/30'
                }`}
                placeholder="Minimal 6 karakter"
              />
              {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password (hanya untuk Register) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">
                  Konfirmasi Password <span className="text-red-300">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 backdrop-blur-sm bg-white/20 border rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60 ${
                    errors.confirmPassword ? 'border-red-400/50' : 'border-white/30'
                  }`}
                  placeholder="Ulangi password"
                />
                {errors.confirmPassword && <p className="text-red-300 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Catatan dengan Liquid Glass */}
            {/* {!isLogin && (
              <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4 text-sm text-white/90">
                <p className="flex items-center">
                  <span className="mr-2">💡</span>
                  Room ID akan diberikan oleh guru setelah Anda bergabung ke kelas.
                </p>
                {role === 'student' && (
                  <p className="flex items-center mt-2">
                    <span className="mr-2">🎮</span>
                    Data skor game akan otomatis dibuat untuk Anda.
                  </p>
                )}
              </div>
            )} */}

            {/* Tombol Submit dengan Liquid Glass */}
            <button
              type="submit"
              disabled={loading}
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

          {/* Footer / Link tambahan dengan Liquid Glass */}
          <div className="text-center text-sm text-white/70 mt-6">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              className="text-white font-medium hover:text-cyan-200 transition-colors underline-offset-2 hover:underline"
              onClick={() => handleTabChange(!isLogin)}
            >
              {isLogin ? 'Daftar di sini' : 'Login di sini'}
            </button>
          </div>
        </div>
      </div>

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

export default LoginRegister;