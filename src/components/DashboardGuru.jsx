// src/components/DashboardGuru.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  BarChart3, 
  LogOut, 
  Search,
  ChevronDown,
  Eye,
  RefreshCw,
  Star,
  Plus,
  Copy,
  Check,
  X,
  BookOpen,
  Hash,
  Home
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';

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

const DashboardGuru = () => {
  // State untuk data
  const [guru, setGuru] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [allGameScores, setAllGameScores] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk UI
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nama');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Handler untuk resume audio context
  const handleUserInteraction = () => {
    resumeAudio();
  };

  // Daftar game yang tersedia sesuai struktur
  const gameList = [
    { key: 'barito', label: 'Barito', group: 'Sungai Barito' },
    { key: 'alalak', label: 'Alalak 1', group: 'Sungai Alalak' },
    { key: 'alalak_part2', label: 'Alalak 2', group: 'Sungai Alalak' },
    { key: 'awang', label: 'Awang', group: 'Sungai Awang' },
    { key: 'martapura', label: 'Martapura 1', group: 'Sungai Martapura' },
    { key: 'martapura_part2', label: 'Martapura 2', group: 'Sungai Martapura' },
    { key: 'martapura_part3', label: 'Martapura 3', group: 'Sungai Martapura' },
    { key: 'martapura_part4', label: 'Martapura 4', group: 'Sungai Martapura' },
    { key: 'pelambuan', label: 'Pelambuan', group: 'Sungai Pelambuan' },
    { key: 'kuin', label: 'Kuin 1', group: 'Sungai Kuin' },
    { key: 'kuin_part2', label: 'Kuin 2', group: 'Sungai Kuin' },
    { key: 'kuin_part3', label: 'Kuin 3', group: 'Sungai Kuin' }
  ];

  // Group game untuk tampilan
  const gameGroups = [
    { name: 'Sungai Barito', keys: ['barito'] },
    { name: 'Sungai Alalak', keys: ['alalak', 'alalak_part2'] },
    { name: 'Sungai Awang', keys: ['awang'] },
    { name: 'Sungai Martapura', keys: ['martapura', 'martapura_part2', 'martapura_part3', 'martapura_part4'] },
    { name: 'Sungai Pelambuan', keys: ['pelambuan'] },
    { name: 'Sungai Kuin', keys: ['kuin', 'kuin_part2', 'kuin_part3'] }
  ];

  // Fungsi untuk kembali ke landing page
  const handleGoHome = () => {
    playClickSound();
    window.location.href = '/';
  };

  // Cek auth dan load data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = '/loginregister';
        return;
      }

      try {
        setLoading(true);
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          alert('Data user tidak ditemukan!');
          window.location.href = '/loginregister';
          return;
        }

        const userData = userDoc.data();
        
        if (userData.role !== 'teacher') {
          alert('Akses ditolak! Halaman ini hanya untuk guru.');
          window.location.href = '/';
          return;
        }

        setGuru({
          uid: user.uid,
          ...userData
        });

        await loadRooms(user.uid);
        await loadAllStudents();
        await loadAllGameScores();

      } catch (error) {
        console.error('Error loading data:', error);
        alert('Gagal memuat data. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load rooms
  const loadRooms = async (teacherId) => {
    try {
      const q = query(
        collection(db, 'rooms'),
        where('teacherId', '==', teacherId)
      );
      const querySnapshot = await getDocs(q);
      const roomsData = [];
      querySnapshot.forEach((doc) => {
        roomsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setRooms(roomsData);
      
      if (roomsData.length > 0 && !selectedRoomId) {
        setSelectedRoomId(roomsData[0].roomId);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  // Load all students
  const loadAllStudents = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      );
      const querySnapshot = await getDocs(q);
      const studentsData = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setAllStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Load all game scores
  const loadAllGameScores = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'game_skor'));
      const scoresData = {};
      querySnapshot.forEach((doc) => {
        scoresData[doc.id] = {
          id: doc.id,
          ...doc.data()
        };
      });
      setAllGameScores(scoresData);
    } catch (error) {
      console.error('Error loading game scores:', error);
    }
  };

  // Generate Room ID
  const generateRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    playClickSound();
    
    if (!roomName.trim()) {
      alert('Nama ruangan harus diisi!');
      return;
    }

    try {
      setCreatingRoom(true);
      const roomId = generateRoomId();
      
      const roomData = {
        roomId: roomId,
        roomName: roomName,
        description: roomDescription || '',
        teacherId: guru.uid,
        teacherName: guru.name || 'Guru',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'rooms'), roomData);
      
      const guruRef = doc(db, 'users', guru.uid);
      await updateDoc(guruRef, {
        room_ids: arrayUnion(roomId),
        updatedAt: serverTimestamp()
      });
      
      setGuru(prev => ({
        ...prev,
        room_ids: [...(prev.room_ids || []), roomId]
      }));
      
      await loadRooms(guru.uid);
      setSelectedRoomId(roomId);
      setRoomName('');
      setRoomDescription('');
      setShowCreateRoom(false);
      
      alert(`✅ Room berhasil dibuat!\nRoom ID: ${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('❌ Gagal membuat room. Silakan coba lagi.');
    } finally {
      setCreatingRoom(false);
    }
  };

  // Copy Room ID
  const copyRoomId = (roomId) => {
    playClickSound();
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(roomId);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  // Logout
  const handleLogout = async () => {
    playClickSound();
    try {
      await signOut(auth);
      window.location.href = '/loginregister';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Get students for selected room
  const getStudentsByRoom = (roomId) => {
    return allStudents.filter(student => student.room_id === roomId);
  };

  // Get student scores from game_skor
  const getStudentScores = (studentId) => {
    const scoreData = allGameScores[studentId];
    if (!scoreData) return null;
    
    const scores = {};
    gameList.forEach(game => {
      if (scoreData[game.key]) {
        scores[game.key] = {
          skor: scoreData[game.key].skor || 0,
          waktu: scoreData[game.key].time || '-',
          path: scoreData[game.key].path || '-'
        };
      } else {
        scores[game.key] = { skor: 0, waktu: '-', path: '-' };
      }
    });
    return scores;
  };

  // Get students with scores
  const getStudentsWithScores = (students) => {
    return students.map(s => {
      const scores = getStudentScores(s.id);
      return {
        ...s,
        skor: scores
      };
    });
  };

  // Filter dan sorting siswa
  const currentRoomStudents = selectedRoomId ? getStudentsByRoom(selectedRoomId) : [];
  const studentsWithScores = getStudentsWithScores(currentRoomStudents);
  
  const filteredSiswa = studentsWithScores.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis?.includes(searchTerm)
  );

  const sortedSiswa = [...filteredSiswa].sort((a, b) => {
    if (sortBy === 'nama') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'nis') return (a.nis || '').localeCompare(b.nis || '');
    if (sortBy === 'rata') {
      if (!a.skor || !b.skor) return 0;
      const gamesA = gameList.filter(g => a.skor[g.key]);
      const gamesB = gameList.filter(g => b.skor[g.key]);
      const rataA = gamesA.length > 0 ? gamesA.reduce((sum, g) => sum + a.skor[g.key].skor, 0) / gamesA.length : 0;
      const rataB = gamesB.length > 0 ? gamesB.reduce((sum, g) => sum + b.skor[g.key].skor, 0) / gamesB.length : 0;
      return rataB - rataA;
    }
    return 0;
  });

  // Hitung statistik
  const totalSiswa = currentRoomStudents.length;
  const totalGame = gameList.length;
  
  const rataSkorAll = studentsWithScores.length > 0 
    ? studentsWithScores.reduce((acc, s) => {
        if (!s.skor) return acc;
        const games = gameList.filter(g => s.skor[g.key]);
        const total = games.reduce((sum, g) => sum + s.skor[g.key].skor, 0);
        const avg = games.length > 0 ? total / games.length : 0;
        return acc + avg;
      }, 0) / studentsWithScores.length
    : 0;

  const siswaTerbaik = studentsWithScores.length > 0
    ? studentsWithScores.reduce((best, current) => {
        if (!best?.skor) return current;
        if (!current?.skor) return best;
        const gamesBest = gameList.filter(g => best.skor[g.key]);
        const gamesCurrent = gameList.filter(g => current.skor[g.key]);
        const bestAvg = gamesBest.length > 0 ? gamesBest.reduce((sum, g) => sum + best.skor[g.key].skor, 0) / gamesBest.length : 0;
        const curAvg = gamesCurrent.length > 0 ? gamesCurrent.reduce((sum, g) => sum + current.skor[g.key].skor, 0) / gamesCurrent.length : 0;
        return curAvg > bestAvg ? current : best;
      })
    : null;

  // Loading state
  if (loading) {
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

  if (!guru) {
    return null;
  }

  const selectedRoom = rooms.find(r => r.roomId === selectedRoomId);

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-700 to-cyan-500"
      onClick={handleUserInteraction}
    >
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
        
        {/* Ikan-ikan berenang dari KANAN ke KIRI */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`fish-${i}`}
            className="absolute text-white/70"
            style={{
              fontSize: Math.random() * 20 + 10 + 'px',
              top: Math.random() * 70 + 10 + '%',
              right: '-10%',
              animation: `swim-right-to-left ${Math.random() * 8 + 6}s linear ${Math.random() * 10}s infinite`,
            }}
          >
            🐟
          </div>
        ))}
        
        {/* Ikan besar dari KANAN ke KIRI */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`big-fish-${i}`}
            className="absolute text-white/60"
            style={{
              fontSize: Math.random() * 30 + 25 + 'px',
              top: Math.random() * 60 + 20 + '%',
              right: '-15%',
              animation: `swim-right-to-left-slow ${Math.random() * 12 + 10}s linear ${Math.random() * 15}s infinite`,
            }}
          >
            🐠
          </div>
        ))}
        
        {/* Kura-kura dari KANAN ke KIRI */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`turtle-${i}`}
            className="absolute text-green-400/50"
            style={{
              fontSize: Math.random() * 25 + 20 + 'px',
              top: Math.random() * 50 + 20 + '%',
              right: '-20%',
              animation: `swim-turtle-right-to-left ${Math.random() * 15 + 12}s ease-in-out ${Math.random() * 20}s infinite`,
            }}
          >
            🐢
          </div>
        ))}
        
        {/* Penyu dari KANAN ke KIRI */}
        {[...Array(2)].map((_, i) => (
          <div
            key={`turtle2-${i}`}
            className="absolute text-green-300/40"
            style={{
              fontSize: Math.random() * 30 + 25 + 'px',
              top: Math.random() * 40 + 30 + '%',
              right: '-25%',
              animation: `swim-turtle2-right-to-left ${Math.random() * 20 + 15}s ease-in-out ${Math.random() * 25}s infinite`,
            }}
          >
            🐢
          </div>
        ))}
        
        {/* Gurita dari KANAN ke KIRI */}
        {[...Array(2)].map((_, i) => (
          <div
            key={`octopus-${i}`}
            className="absolute text-purple-400/30"
            style={{
              fontSize: Math.random() * 25 + 20 + 'px',
              top: Math.random() * 60 + 20 + '%',
              right: '-30%',
              animation: `swim-octopus-right-to-left ${Math.random() * 18 + 14}s ease-in-out ${Math.random() * 30}s infinite`,
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
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header dengan Liquid Glass */}
          <header className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-6 mb-8 flex flex-wrap items-center justify-between border border-white/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400/80 to-purple-500/80 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg backdrop-blur-sm border border-white/30">
                {guru.name?.split(' ').map(n => n[0]).join('') || 'G'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">{guru.name || 'Guru'}</h1>
                <p className="text-sm text-white/80">
                  {guru.nip ? `NIP: ${guru.nip}` : ''}
                  {guru.room_ids && guru.room_ids.length > 0 && (
                    <span className="ml-3 text-cyan-200">
                      🏫 {guru.room_ids.length} Ruangan
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <button
                onClick={handleGoHome}
                onMouseEnter={handleHoverSound}
                className="flex items-center gap-2 backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-2xl transition duration-200 border border-white/30 shadow-lg"
              >
                <Home size={18} />
                <span className="font-medium">Beranda</span>
              </button>
              
              <button
                onClick={() => {
                  playClickSound();
                  setShowCreateRoom(true);
                }}
                onMouseEnter={handleHoverSound}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-2xl transition duration-200 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-white/30"
              >
                <Plus size={18} />
                <span className="font-medium">Buat Room</span>
              </button>
              <button
                onClick={handleLogout}
                onMouseEnter={handleHoverSound}
                className="flex items-center gap-2 backdrop-blur-xl bg-red-500/30 hover:bg-red-500/50 text-white px-4 py-2 rounded-2xl transition duration-200 border border-white/30 shadow-lg"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </header>

          {/* Room Selector dengan Liquid Glass */}
          {rooms.length > 0 ? (
            <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-6 mb-8 border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-white/90" />
                  <h2 className="text-lg font-semibold text-white">Pilih Ruangan</h2>
                </div>
                {selectedRoom && (
                  <div className="flex items-center gap-2 backdrop-blur-sm bg-white/20 px-3 py-1.5 rounded-xl border border-white/20">
                    <Hash size={16} className="text-white/80" />
                    <span className="text-sm font-medium text-white">Room ID: {selectedRoom.roomId}</span>
                    <button
                      onClick={() => copyRoomId(selectedRoom.roomId)}
                      onMouseEnter={handleHoverSound}
                      className="ml-1 p-1 hover:bg-white/20 rounded-lg transition"
                    >
                      {copiedRoomId === selectedRoom.roomId ? (
                        <Check size={14} className="text-green-300" />
                      ) : (
                        <Copy size={14} className="text-white/80" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      playClickSound();
                      setSelectedRoomId(room.roomId);
                    }}
                    onMouseEnter={handleHoverSound}
                    className={`px-4 py-2 rounded-2xl transition flex items-center gap-2 backdrop-blur-sm ${
                      selectedRoomId === room.roomId
                        ? 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white shadow-xl border border-white/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/20'
                    }`}
                  >
                    <span>{room.roomName}</span>
                    <span className={`text-xs ${selectedRoomId === room.roomId ? 'text-white/80' : 'text-white/60'}`}>
                      ({getStudentsByRoom(room.roomId).length} siswa)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-8 mb-8 border border-white/30 text-center">
              <BookOpen size={48} className="text-white/50 mx-auto mb-3" />
              <p className="text-white/80">Belum ada ruangan. Buat ruangan pertama Anda!</p>
            </div>
          )}

          {/* Statistik Cards dengan Liquid Glass */}
          {selectedRoomId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-6 border border-white/30 hover:shadow-3xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 font-medium">Total Siswa</p>
                    <p className="text-3xl font-bold text-white">{totalSiswa}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/30 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
                    <Users size={24} />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-6 border border-white/30 hover:shadow-3xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 font-medium">Total Game</p>
                    <p className="text-3xl font-bold text-white">{totalGame}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/30 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
                    <Trophy size={24} />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-6 border border-white/30 hover:shadow-3xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 font-medium">Rata-rata Skor</p>
                    <p className="text-3xl font-bold text-white">{rataSkorAll.toFixed(1)}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/30 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
                    <BarChart3 size={24} />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-6 border border-white/30 hover:shadow-3xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80 font-medium">Siswa Terbaik</p>
                    <p className="text-lg font-bold text-white truncate max-w-[140px]">
                      {siswaTerbaik?.name || '-'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/30 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
                    <Star size={24} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabel Data Siswa dengan Liquid Glass */}
          {selectedRoomId && (
            <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-6 border border-white/30 overflow-x-auto">
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users size={22} className="text-white/90" />
                  Daftar Siswa
                  <span className="text-sm font-normal text-white/70">
                    (Room: {rooms.find(r => r.roomId === selectedRoomId)?.roomName})
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                    <input
                      type="text"
                      placeholder="Cari nama atau NIS..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onMouseEnter={handleHoverSound}
                      className="pl-10 pr-4 py-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition w-48 sm:w-64 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        playClickSound();
                        setSortBy(e.target.value);
                      }}
                      onMouseEnter={handleHoverSound}
                      className="pl-4 pr-10 py-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none appearance-none text-white"
                    >
                      <option value="nama" className="text-gray-800">Sortir: Nama</option>
                      <option value="nis" className="text-gray-800">Sortir: NIS</option>
                      <option value="rata" className="text-gray-800">Sortir: Rata-rata</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none" />
                  </div>
                  <button 
                    onClick={() => {
                      playClickSound();
                      loadAllStudents();
                      loadAllGameScores();
                    }}
                    onMouseEnter={handleHoverSound}
                    className="p-2 backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white rounded-2xl transition border border-white/30"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-3 font-semibold text-white/90 sticky left-0 backdrop-blur-sm bg-white/10">#</th>
                      <th className="text-left py-3 px-3 font-semibold text-white/90 sticky left-10 backdrop-blur-sm bg-white/10">Nama</th>
                      <th className="text-left py-3 px-3 font-semibold text-white/90 sticky left-44 backdrop-blur-sm bg-white/10">NIS</th>
                      
                      {/* Sungai Barito */}
                      <th className="text-center py-3 px-2 font-semibold text-white/90 bg-blue-500/20" colSpan="1">
                        Barito
                      </th>
                      
                      {/* Sungai Alalak */}
                      <th className="text-center py-3 px-2 font-semibold text-white/90 bg-green-500/20" colSpan="2">
                        Alalak
                      </th>
                      
                      {/* Sungai Awang */}
                      <th className="text-center py-3 px-2 font-semibold text-white/90 bg-yellow-500/20" colSpan="1">
                        Awang
                      </th>
                      
                      {/* Sungai Martapura */}
                      <th className="text-center py-3 px-2 font-semibold text-white/90 bg-purple-500/20" colSpan="4">
                        Martapura
                      </th>
                      
                      {/* Sungai Pelambuan */}
                      <th className="text-center py-3 px-2 font-semibold text-white/90 bg-pink-500/20" colSpan="1">
                        Pelambuan
                      </th>
                      
                      {/* Sungai Kuin */}
                      <th className="text-center py-3 px-2 font-semibold text-white/90 bg-orange-500/20" colSpan="3">
                        Kuin
                      </th>
                      
                      <th className="text-center py-3 px-2 font-semibold text-white/90">Rata</th>
                      <th className="text-center py-3 px-3 font-semibold text-white/90">Aksi</th>
                    </tr>
                    <tr className="border-b border-white/20">
                      <th className="py-1 px-3"></th>
                      <th className="py-1 px-3"></th>
                      <th className="py-1 px-3"></th>
                      
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-blue-500/10">1</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-green-500/10">1</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-green-500/10">2</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-yellow-500/10">1</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-purple-500/10">1</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-purple-500/10">2</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-purple-500/10">3</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-purple-500/10">4</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-pink-500/10">1</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-orange-500/10">1</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-orange-500/10">2</th>
                      <th className="text-center py-1 px-2 text-xs text-white/60 bg-orange-500/10">3</th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSiswa.length > 0 ? (
                      sortedSiswa.map((s, index) => {
                        if (!s.skor) return null;
                        
                        const gamesWithScore = gameList.filter(g => s.skor[g.key]);
                        const rata = gamesWithScore.length > 0 
                          ? gamesWithScore.reduce((sum, g) => sum + s.skor[g.key].skor, 0) / gamesWithScore.length 
                          : 0;
                        
                        const isBest = siswaTerbaik && s.id === siswaTerbaik.id;
                        
                        const renderScore = (gameKey) => {
                          const score = s.skor[gameKey];
                          if (!score) return <span className="text-white/40">-</span>;
                          return (
                            <div>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                                score.skor >= 80 ? 'bg-green-500/40 text-white' :
                                score.skor >= 60 ? 'bg-yellow-500/40 text-white' :
                                score.skor > 0 ? 'bg-red-500/40 text-white' :
                                'bg-white/10 text-white/60'
                              }`}>
                                {score.skor || 0}
                              </span>
                              <div className="text-[9px] text-white/40 mt-0.5">
                                {score.waktu !== '-' ? score.waktu : ''}
                              </div>
                            </div>
                          );
                        };
                        
                        return (
                          <tr key={s.id} className="border-b border-white/10 hover:bg-white/10 transition">
                            <td className="py-3 px-3 text-white/60 sticky left-0 backdrop-blur-sm bg-blue-900/30">{index + 1}</td>
                            <td className="py-3 px-3 font-medium text-white sticky left-10 backdrop-blur-sm bg-blue-900/30 flex items-center gap-2">
                              {s.name || 'Tidak ada nama'}
                              {isBest && <Star size={14} className="text-yellow-300 fill-yellow-300" />}
                            </td>
                            <td className="py-3 px-3 text-white/80 sticky left-44 backdrop-blur-sm bg-blue-900/30">{s.nis || '-'}</td>
                            
                            <td className="text-center py-3 px-2 bg-blue-500/10">{renderScore('barito')}</td>
                            <td className="text-center py-3 px-2 bg-green-500/10">{renderScore('alalak')}</td>
                            <td className="text-center py-3 px-2 bg-green-500/10">{renderScore('alalak_part2')}</td>
                            <td className="text-center py-3 px-2 bg-yellow-500/10">{renderScore('awang')}</td>
                            <td className="text-center py-3 px-2 bg-purple-500/10">{renderScore('martapura')}</td>
                            <td className="text-center py-3 px-2 bg-purple-500/10">{renderScore('martapura_part2')}</td>
                            <td className="text-center py-3 px-2 bg-purple-500/10">{renderScore('martapura_part3')}</td>
                            <td className="text-center py-3 px-2 bg-purple-500/10">{renderScore('martapura_part4')}</td>
                            <td className="text-center py-3 px-2 bg-pink-500/10">{renderScore('pelambuan')}</td>
                            <td className="text-center py-3 px-2 bg-orange-500/10">{renderScore('kuin')}</td>
                            <td className="text-center py-3 px-2 bg-orange-500/10">{renderScore('kuin_part2')}</td>
                            <td className="text-center py-3 px-2 bg-orange-500/10">{renderScore('kuin_part3')}</td>
                            
                            <td className="text-center py-3 px-2 font-bold text-cyan-200">
                              {rata.toFixed(1)}
                            </td>
                            
                            <td className="text-center py-3 px-3">
                              <button 
                                className="p-1.5 backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white rounded-xl transition border border-white/20"
                                onMouseEnter={handleHoverSound}
                                onClick={() => playClickSound()}
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={19} className="text-center py-8 text-white/60">
                          {searchTerm ? 'Tidak ada siswa ditemukan' : 'Belum ada siswa yang bergabung di ruangan ini'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-4 text-sm text-white/60">
                <p>Menampilkan {sortedSiswa.length} dari {totalSiswa} siswa</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create Room dengan Liquid Glass */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/30 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Buat Room Baru</h2>
              <button
                onClick={() => {
                  playClickSound();
                  setShowCreateRoom(false);
                }}
                onMouseEnter={handleHoverSound}
                className="p-2 hover:bg-white/20 rounded-xl transition text-white/80"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateRoom}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Nama Ruangan <span className="text-red-300">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    onMouseEnter={handleHoverSound}
                    className="w-full px-4 py-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60"
                    placeholder="Contoh: Kelas XII IPA 1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    onMouseEnter={handleHoverSound}
                    className="w-full px-4 py-2 backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition text-white placeholder:text-white/60"
                    placeholder="Deskripsi ruangan"
                    rows="3"
                  />
                </div>

                <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-2xl p-3 text-sm text-white/90">
                  <p>💡 Room ID akan digenerate otomatis (6 karakter alfanumerik)</p>
                  <p className="mt-1">📌 Siswa akan bergabung menggunakan Room ID ini</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setShowCreateRoom(false);
                  }}
                  onMouseEnter={handleHoverSound}
                  className="flex-1 px-4 py-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white rounded-2xl transition border border-white/30"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  onMouseEnter={handleHoverSound}
                  disabled={creatingRoom}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-2xl transition disabled:opacity-50 shadow-xl"
                >
                  {creatingRoom ? 'Membuat...' : 'Buat Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS Animations */}
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

export default DashboardGuru;