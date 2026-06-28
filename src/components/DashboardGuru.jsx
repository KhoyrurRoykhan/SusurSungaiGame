// src/components/DashboradGuru.jsx
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
  Hash
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
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(roomId);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  // Logout
  const handleLogout = async () => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!guru) {
    return null;
  }

  const selectedRoom = rooms.find(r => r.roomId === selectedRoomId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-wrap items-center justify-between border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {guru.name?.split(' ').map(n => n[0]).join('') || 'G'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{guru.name || 'Guru'}</h1>
              <p className="text-sm text-gray-500">
                {guru.nip ? `NIP: ${guru.nip}` : ''}
                {guru.room_ids && guru.room_ids.length > 0 && (
                  <span className="ml-3 text-indigo-600">
                    🏫 {guru.room_ids.length} Ruangan
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateRoom(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              <span className="font-medium">Buat Room</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl transition duration-200 border border-red-200"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </header>

        {/* Room Selector */}
        {rooms.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-800">Pilih Ruangan</h2>
              </div>
              {selectedRoom && (
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg">
                  <Hash size={16} className="text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Room ID: {selectedRoom.roomId}</span>
                  <button
                    onClick={() => copyRoomId(selectedRoom.roomId)}
                    className="ml-1 p-1 hover:bg-indigo-100 rounded transition"
                  >
                    {copiedRoomId === selectedRoom.roomId ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} className="text-indigo-600" />
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.roomId)}
                  className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                    selectedRoomId === room.roomId
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{room.roomName}</span>
                  <span className={`text-xs ${selectedRoomId === room.roomId ? 'text-indigo-200' : 'text-gray-400'}`}>
                    ({getStudentsByRoom(room.roomId).length} siswa)
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 text-center">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada ruangan. Buat ruangan pertama Anda!</p>
          </div>
        )}

        {/* Statistik Cards */}
        {selectedRoomId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Siswa</p>
                  <p className="text-3xl font-bold text-gray-800">{totalSiswa}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Game</p>
                  <p className="text-3xl font-bold text-gray-800">{totalGame}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Trophy size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Rata-rata Skor</p>
                  <p className="text-3xl font-bold text-gray-800">{rataSkorAll.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <BarChart3 size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Siswa Terbaik</p>
                  <p className="text-lg font-bold text-gray-800 truncate max-w-[140px]">
                    {siswaTerbaik?.name || '-'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Star size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabel Data Siswa */}
        {selectedRoomId && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users size={22} className="text-indigo-600" />
                Daftar Siswa
                <span className="text-sm font-normal text-gray-500">
                  (Room: {rooms.find(r => r.roomId === selectedRoomId)?.roomName})
                </span>
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau NIS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition w-48 sm:w-64"
                  />
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white"
                  >
                    <option value="nama">Sortir: Nama</option>
                    <option value="nis">Sortir: NIS</option>
                    <option value="rata">Sortir: Rata-rata</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <button 
                  onClick={() => {
                    loadAllStudents();
                    loadAllGameScores();
                  }}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <table className="w-full text-sm min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 sticky left-0 bg-gray-50">#</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 sticky left-10 bg-gray-50">Nama</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 sticky left-44 bg-gray-50">NIS</th>
                  
                  {/* Sungai Barito */}
                  <th className="text-center py-3 px-2 font-semibold text-gray-600 bg-blue-50" colSpan="1">
                    Barito
                  </th>
                  
                  {/* Sungai Alalak */}
                  <th className="text-center py-3 px-2 font-semibold text-gray-600 bg-green-50" colSpan="2">
                    Alalak
                  </th>
                  
                  {/* Sungai Awang */}
                  <th className="text-center py-3 px-2 font-semibold text-gray-600 bg-yellow-50" colSpan="1">
                    Awang
                  </th>
                  
                  {/* Sungai Martapura */}
                  <th className="text-center py-3 px-2 font-semibold text-gray-600 bg-purple-50" colSpan="4">
                    Martapura
                  </th>
                  
                  {/* Sungai Pelambuan */}
                  <th className="text-center py-3 px-2 font-semibold text-gray-600 bg-pink-50" colSpan="1">
                    Pelambuan
                  </th>
                  
                  {/* Sungai Kuin */}
                  <th className="text-center py-3 px-2 font-semibold text-gray-600 bg-orange-50" colSpan="3">
                    Kuin
                  </th>
                  
                  <th className="text-center py-3 px-2 font-semibold text-gray-600">Rata</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600">Aksi</th>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-1 px-3"></th>
                  <th className="py-1 px-3"></th>
                  <th className="py-1 px-3"></th>
                  
                  {/* Sub header Barito */}
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-blue-50">1</th>
                  
                  {/* Sub header Alalak */}
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-green-50">1</th>
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-green-50">2</th>
                  
                  {/* Sub header Awang */}
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-yellow-50">1</th>
                  
                  {/* Sub header Martapura */}
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-purple-50">1</th>
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-purple-50">2</th>
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-purple-50">3</th>
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-purple-50">4</th>
                  
                  {/* Sub header Pelambuan */}
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-pink-50">1</th>
                  
                  {/* Sub header Kuin */}
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-orange-50">1</th>
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-orange-50">2</th>
                  <th className="text-center py-1 px-2 text-xs text-gray-500 bg-orange-50">3</th>
                  
                  <th className="py-1 px-2"></th>
                  <th className="py-1 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {sortedSiswa.length > 0 ? (
                  sortedSiswa.map((s, index) => {
                    if (!s.skor) return null;
                    
                    // Hitung rata-rata semua game
                    const gamesWithScore = gameList.filter(g => s.skor[g.key]);
                    const rata = gamesWithScore.length > 0 
                      ? gamesWithScore.reduce((sum, g) => sum + s.skor[g.key].skor, 0) / gamesWithScore.length 
                      : 0;
                    
                    const isBest = siswaTerbaik && s.id === siswaTerbaik.id;
                    
                    // Helper untuk render skor
                    const renderScore = (gameKey) => {
                      const score = s.skor[gameKey];
                      if (!score) return <span className="text-gray-400">-</span>;
                      return (
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            score.skor >= 80 ? 'bg-green-100 text-green-700' :
                            score.skor >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            score.skor > 0 ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {score.skor || 0}
                          </span>
                          <div className="text-[9px] text-gray-400 mt-0.5">
                            {score.waktu !== '-' ? score.waktu : ''}
                          </div>
                        </div>
                      );
                    };
                    
                    return (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-3 px-3 text-gray-500 sticky left-0 bg-white">{index + 1}</td>
                        <td className="py-3 px-3 font-medium text-gray-800 sticky left-10 bg-white flex items-center gap-2">
                          {s.name || 'Tidak ada nama'}
                          {isBest && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                        </td>
                        <td className="py-3 px-3 text-gray-600 sticky left-44 bg-white">{s.nis || '-'}</td>
                        
                        {/* Barito */}
                        <td className="text-center py-3 px-2 bg-blue-50/30">
                          {renderScore('barito')}
                        </td>
                        
                        {/* Alalak */}
                        <td className="text-center py-3 px-2 bg-green-50/30">
                          {renderScore('alalak')}
                        </td>
                        <td className="text-center py-3 px-2 bg-green-50/30">
                          {renderScore('alalak_part2')}
                        </td>
                        
                        {/* Awang */}
                        <td className="text-center py-3 px-2 bg-yellow-50/30">
                          {renderScore('awang')}
                        </td>
                        
                        {/* Martapura */}
                        <td className="text-center py-3 px-2 bg-purple-50/30">
                          {renderScore('martapura')}
                        </td>
                        <td className="text-center py-3 px-2 bg-purple-50/30">
                          {renderScore('martapura_part2')}
                        </td>
                        <td className="text-center py-3 px-2 bg-purple-50/30">
                          {renderScore('martapura_part3')}
                        </td>
                        <td className="text-center py-3 px-2 bg-purple-50/30">
                          {renderScore('martapura_part4')}
                        </td>
                        
                        {/* Pelambuan */}
                        <td className="text-center py-3 px-2 bg-pink-50/30">
                          {renderScore('pelambuan')}
                        </td>
                        
                        {/* Kuin */}
                        <td className="text-center py-3 px-2 bg-orange-50/30">
                          {renderScore('kuin')}
                        </td>
                        <td className="text-center py-3 px-2 bg-orange-50/30">
                          {renderScore('kuin_part2')}
                        </td>
                        <td className="text-center py-3 px-2 bg-orange-50/30">
                          {renderScore('kuin_part3')}
                        </td>
                        
                        {/* Rata-rata */}
                        <td className="text-center py-3 px-2 font-bold text-indigo-600">
                          {rata.toFixed(1)}
                        </td>
                        
                        {/* Aksi */}
                        <td className="text-center py-3 px-3">
                          <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={19} className="text-center py-8 text-gray-400">
                      {searchTerm ? 'Tidak ada siswa ditemukan' : 'Belum ada siswa yang bergabung di ruangan ini'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <p>Menampilkan {sortedSiswa.length} dari {totalSiswa} siswa</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create Room */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Buat Room Baru</h2>
              <button
                onClick={() => setShowCreateRoom(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateRoom}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Contoh: Kelas XII IPA 1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Deskripsi ruangan"
                    rows="3"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p>💡 Room ID akan digenerate otomatis (6 karakter alfanumerik)</p>
                  <p className="mt-1">📌 Siswa akan bergabung menggunakan Room ID ini</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingRoom}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {creatingRoom ? 'Membuat...' : 'Buat Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardGuru;