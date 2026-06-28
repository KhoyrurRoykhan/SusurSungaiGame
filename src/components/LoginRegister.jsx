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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? 'Masuk' : 'Daftar Akun'}
        </h2>

        {/* Error General */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Tab Login / Register */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              isLogin ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              !isLogin ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange(false)}
          >
            Register
          </button>
        </div>

        {/* Pilihan Peran (hanya untuk Register) */}
        {!isLogin && (
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                role === 'teacher' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleRoleChange('teacher')}
            >
              Teacher
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                role === 'student' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleRoleChange('student')}
            >
              Student
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field Nama (hanya untuk Register) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          {/* Field NIP/NIPK (hanya untuk Register Teacher) */}
          {!isLogin && role === 'teacher' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP / NIPK <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  errors.nip ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan NIP/NIPK (angka)"
              />
              {errors.nip && <p className="text-red-500 text-xs mt-1">{errors.nip}</p>}
            </div>
          )}

          {/* Field NIS/NISN/NIM (hanya untuk Register Student) */}
          {!isLogin && role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIS / NISN / NIM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nis"
                value={formData.nis}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  errors.nis ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan NIS/NISN/NIM (angka)"
              />
              {errors.nis && <p className="text-red-500 text-xs mt-1">{errors.nis}</p>}
            </div>
          )}

          {/* Email (selalu tampil) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@contoh.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Minimal 6 karakter"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password (hanya untuk Register) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ulangi password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Catatan tentang Room ID (hanya untuk Register) */}
          {!isLogin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p className="flex items-center">
                <span className="mr-2">ℹ️</span>
                Room ID akan diberikan oleh guru setelah Anda bergabung ke kelas.
              </p>
              {role === 'student' && (
                <p className="flex items-center mt-1">
                  <span className="mr-2">🎮</span>
                  Data skor game akan otomatis dibuat untuk Anda.
                </p>
              )}
            </div>
          )}

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
              isLogin ? 'Login' : 'Daftar'
            )}
          </button>
        </form>

        {/* Footer / Link tambahan */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            className="text-indigo-600 hover:underline font-medium"
            onClick={() => handleTabChange(!isLogin)}
          >
            {isLogin ? 'Daftar di sini' : 'Login di sini'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;