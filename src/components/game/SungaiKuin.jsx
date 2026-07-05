import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, GeoJSON, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Terminal,
  MapPin,
  Clock,
  ArrowLeft,
  AlertCircle,
  Flag,
  Grid3x3,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Trophy,
  Save,
  RefreshCw,
  X,
  ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LayersControl } from 'react-leaflet';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
// Import CodeMirror
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

// Import gambar kura-kura
import turtleImage from './assets/kura-kura-obj.png';
// Import file GeoJSON (sungai Kuin)
import sungaiKuinGeoJSON from './geojson/sungaikuin.json';
// Import data lokasi sungai
import dataSungai from './geojson/Data_Sungai.json';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Kura-kura Icon dengan efek collision
const createTurtleIcon = (angle, isCollision = false) => {
  return L.divIcon({
    className: `custom-turtle-obj-icon ${isCollision ? 'collision-effect' : ''}`,
    html: `<div style="
      width: 50px; 
      height: 50px;
      transform: rotate(${angle}deg);
      transform-origin: center;
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <img 
        src="${turtleImage}" 
        alt="Kura-kura"
        style="
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
          ${isCollision ? 'animation: collisionFlash 0.5s ease 3;' : ''}
        "
      />
    </div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  });
};

const startIcon = new L.DivIcon({
  className: 'start-icon',
  html: `<div style="
    width: 36px; 
    height: 36px; 
    background: #22c55e; 
    border-radius: 50%; 
    border: 3px solid white;
    display: flex; 
    align-items: center; 
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  ">🏁</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const finishIcon = new L.DivIcon({
  className: 'finish-icon',
  html: `<div style="
    width: 40px; 
    height: 40px; 
    background: #ef4444; 
    border-radius: 50%; 
    border: 3px solid white;
    display: flex; 
    align-items: center; 
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    animation: pulse 2s infinite;
  ">🚩</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Komponen untuk mengikuti posisi kura-kura
const FollowTurtle = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.panTo(position, { animate: true, duration: 0.5 });
    }
  }, [position, map]);
  
  return null;
};

// Komponen grid dengan riverBounds
const MapGrid = ({ riverBounds, stepMeters = 275, enabled = true, marginDeg = 0.05 }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!enabled || !riverBounds || riverBounds.length === 0) return;
    
    const stepDeg = stepMeters / 111320;
    const lats = riverBounds.map(coord => coord[0]);
    const lngs = riverBounds.map(coord => coord[1]);
    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs);
    let maxLng = Math.max(...lngs);
    
    minLat -= marginDeg;
    maxLat += marginDeg;
    minLng -= marginDeg;
    maxLng += marginDeg;
    
    minLat = Math.floor(minLat / stepDeg) * stepDeg;
    maxLat = Math.ceil(maxLat / stepDeg) * stepDeg;
    minLng = Math.floor(minLng / stepDeg) * stepDeg;
    maxLng = Math.ceil(maxLng / stepDeg) * stepDeg;
    
    const gridLines = [];
    for (let lat = minLat; lat <= maxLat + stepDeg/2; lat += stepDeg) {
      gridLines.push(
        L.polyline(
          [
            [lat, minLng],
            [lat, maxLng]
          ],
          {
            color: '#9ca3af',
            weight: 1,
            opacity: 0.4,
            interactive: false,
            className: 'map-grid-line'
          }
        )
      );
    }
    for (let lng = minLng; lng <= maxLng + stepDeg/2; lng += stepDeg) {
      gridLines.push(
        L.polyline(
          [
            [minLat, lng],
            [maxLat, lng]
          ],
          {
            color: '#9ca3af',
            weight: 1,
            opacity: 0.4,
            interactive: false,
            className: 'map-grid-line'
          }
        )
      );
    }
    gridLines.forEach(line => line.addTo(map));
    return () => {
      gridLines.forEach(line => map.removeLayer(line));
    };
  }, [map, riverBounds, stepMeters, enabled, marginDeg]);
  
  return null;
};

// Fungsi ekstrak koordinat dari GeoJSON
const extractCoordinates = (geojson) => {
  if (geojson.features && geojson.features.length > 0) {
    const feature = geojson.features[0];
    if (feature.geometry.type === 'Polygon') {
      return feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      return feature.geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
    }
  }
  return [];
};

// Ekstrak koordinat sungai Kuin
const batasSungai = extractCoordinates(sungaiKuinGeoJSON);

// Titik Start dan Finish
const startPoint = [-3.2934, 114.5687];
const finishPoint = [-3.2988, 114.5801];

// Style polygon sungai
const polygonStyle = {
  color: '#0ea5e9',
  weight: 3,
  opacity: 0.8,
  fillOpacity: 0,
  dashArray: '5, 10'
};

// Fungsi pengecekan titik dalam polygon
const isPointInPolygon = (point, polygon) => {
  const x = point[1], y = point[0];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const isValidPosition = (point) => {
  return isPointInPolygon(point, batasSungai);
};

// ======== FUNGSI DETEKSI COLLISION DI SEPANJANG LINTASAN ========
const checkLineCollision = (startPos, endPos, stepSize = 1) => {
  // Jika titik awal tidak valid
  if (!isValidPosition(startPos)) return true;
  
  const lat1 = startPos[0], lng1 = startPos[1];
  const lat2 = endPos[0], lng2 = endPos[1];
  
  // Hitung jarak total
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const totalDistance = R * c;
  
  // Jika jarak sangat kecil, hanya cek titik akhir
  if (totalDistance < 1) {
    return !isValidPosition(endPos);
  }
  
  // Cek di sepanjang lintasan dengan step 1 meter
  const steps = Math.max(Math.ceil(totalDistance / stepSize), 2);
  
  for (let i = 1; i <= steps; i++) {
    const fraction = i / steps;
    const currentLat = lat1 + (lat2 - lat1) * fraction;
    const currentLng = lng1 + (lng2 - lng1) * fraction;
    const currentPoint = [currentLat, currentLng];
    
    // Jika ada titik di sepanjang lintasan yang tidak valid
    if (!isValidPosition(currentPoint)) {
      return true; // Ada tabrakan
    }
  }
  
  return false; // Tidak ada tabrakan
};

const findFirstCollisionPoint = (startPos, endPos, stepSize = 1) => {
  const lat1 = startPos[0], lng1 = startPos[1];
  const lat2 = endPos[0], lng2 = endPos[1];
  
  // Hitung jarak total
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const totalDistance = R * c;
  
  if (totalDistance < 1) {
    return isValidPosition(endPos) ? null : startPos;
  }
  
  const steps = Math.max(Math.ceil(totalDistance / stepSize), 2);
  
  let lastValid = startPos;
  
  for (let i = 1; i <= steps; i++) {
    const fraction = i / steps;
    const currentLat = lat1 + (lat2 - lat1) * fraction;
    const currentLng = lng1 + (lng2 - lng1) * fraction;
    const currentPoint = [currentLat, currentLng];
    
    if (!isValidPosition(currentPoint)) {
      // Kembalikan titik sebelum tabrakan (titik valid terakhir)
      return lastValid;
    }
    lastValid = currentPoint;
  }
  
  return null; // Tidak ada tabrakan
};
// ======== END FUNGSI DETEKSI COLLISION ========

// Fungsi mencari titik batas (untuk backward compatibility)
const findBoundaryPoint = (start, target) => {
  const lat1 = start[0], lng1 = start[1];
  const lat2 = target[0], lng2 = target[1];
  
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const totalDistance = R * c;
  
  if (totalDistance === 0) return start;
  
  const step = 1;
  const steps = Math.ceil(totalDistance / step);
  let lastValid = start;
  
  for (let i = 1; i <= steps; i++) {
    const fraction = i / steps;
    const currentLat = lat1 + (lat2 - lat1) * fraction;
    const currentLng = lng1 + (lng2 - lng1) * fraction;
    const currentPoint = [currentLat, currentLng];
    
    if (isValidPosition(currentPoint)) {
      lastValid = currentPoint;
    } else {
      break;
    }
  }
  return lastValid;
};

// Filter lokasi Sungai Kuin
const lokasiSungaiKuin = dataSungai
  .filter(item => item.Nama_Sungai === "Sungai Kuin")
  .map(item => {
    const lat = parseFloat(item.Latitude.replace(/,/g, '.'));
    const lng = parseFloat(item.Longitude.replace(/,/g, '.'));
    return {
      ...item,
      lat,
      lng
    };
  })
  .filter(item => !isNaN(item.lat) && !isNaN(item.lng));

// Fungsi untuk membuat ikon marker
const getMarkerIcon = (kategori) => {
  const colors = {
    'Tempat Ibadah': '#3b82f6',
    'Perdagangan': '#f59e0b',
    'Pemerintahan dan Umum': '#8b5cf6',
    'Infrastruktur Transportasi': '#10b981',
    'Perusahaan dan Industri': '#ef4444',
    'Pendidikan': '#ec4899',
    'Kuliner': '#f97316',
    'Tempat Wisata': '#06b6d4',
    'Pemukiman': '#6b7280',
    'Jembatan': '#f472b6',
  };
  const color = colors[kategori] || '#6b7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
      font-weight: bold;
    ">${kategori ? kategori.charAt(0) : '?'}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// ======== KOMPONEN UTAMA ========
const SungaiKuin = () => {
  const [alertMsg, setAlertMsg] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geojsonRef = useRef(null);
  const editorRef = useRef(null);
  
  // Ambil data dari state
  const gameState = location.state || {};
  const dbKey = gameState.dbKey || 'kuin';
  
  // Turtle State
  const [turtlePos, setTurtlePos] = useState(startPoint);
  const [turtleAngle, setTurtleAngle] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commands, setCommands] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [collisionCount, setCollisionCount] = useState(0);
  const [collisionEffect, setCollisionEffect] = useState(false);
  
  const [trail, setTrail] = useState([startPoint]);
  const [showTrail, setShowTrail] = useState(true);

  // State untuk grid
  const [gridEnabled, setGridEnabled] = useState(true);
  const [gridSizeMeters, setGridSizeMeters] = useState(275);

  // State untuk modal konfirmasi update
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newScore, setNewScore] = useState(0);
  const [newTime, setNewTime] = useState(0);
  const [newPath, setNewPath] = useState(0);
  const [existingScore, setExistingScore] = useState(0);
  const [existingTime, setExistingTime] = useState(0);
  const [existingPath, setExistingPath] = useState(0);

  // Refs untuk menyimpan state terbaru di dalam fungsi async
  const turtlePosRef = useRef(turtlePos);
  const turtleAngleRef = useRef(turtleAngle);
  const trailRef = useRef(trail);
  const collisionCountRef = useRef(collisionCount);
  const isFinishedRef = useRef(isFinished);

  // Update refs ketika state berubah
  useEffect(() => {
    turtlePosRef.current = turtlePos;
  }, [turtlePos]);

  useEffect(() => {
    turtleAngleRef.current = turtleAngle;
  }, [turtleAngle]);

  useEffect(() => {
    trailRef.current = trail;
  }, [trail]);

  useEffect(() => {
    collisionCountRef.current = collisionCount;
  }, [collisionCount]);

  useEffect(() => {
    isFinishedRef.current = isFinished;
  }, [isFinished]);

  // Timer
  useEffect(() => {
    let interval;
    if (startTime && !isFinished) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  // Update marker icon
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createTurtleIcon(turtleAngle, collisionEffect));
    }
  }, [turtleAngle, collisionEffect]);

  // Zoom ke batas sungai
  useEffect(() => {
    if (mapRef.current && batasSungai.length > 0) {
      const bounds = L.latLngBounds(batasSungai);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, []);

  // Fokus ke editor setelah eksekusi selesai
  useEffect(() => {
    if (!isExecuting && !isFinished && editorRef.current) {
      setTimeout(() => {
        if (editorRef.current && editorRef.current.view) {
          editorRef.current.view.focus();
        }
      }, 50);
    }
  }, [isExecuting, isFinished]);

  // Fungsi untuk menghitung skor
  const calculateScore = (collisions) => {
    return Math.max(0, 100 - (collisions * 5));
  };

  // Fungsi untuk menyimpan data ke database
  const saveToDatabase = async () => {
    try {
      setIsSaving(true);
      
      const user = auth.currentUser;
      if (!user) {
        alert('Anda harus login terlebih dahulu!');
        return false;
      }

      const skor = calculateScore(collisionCount);
      const pathSegments = trail.length - 1;

      const gameData = {
        skor: skor,
        time: elapsedTime,
        path: pathSegments,
        updatedAt: new Date().toISOString()
      };

      const docRef = doc(db, 'game_skor', user.uid);
      const docSnap = await getDoc(docRef);
      
      let existingData = {};
      if (docSnap.exists()) {
        existingData = docSnap.data();
      }

      const updatedData = {
        ...existingData,
        [dbKey]: gameData,
        id_student: user.uid,
        student_name: user.displayName || user.email || 'Unknown',
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, updatedData, { merge: true });
      return true;
    } catch (error) {
      console.error('❌ Error saving to database:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi untuk mengecek data existing
  const checkExistingData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const docRef = doc(db, 'game_skor', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data[dbKey]) {
          return data[dbKey];
        }
      }
      return null;
    } catch (error) {
      console.error('Error checking existing data:', error);
      return null;
    }
  };

  // Hitung posisi baru
  const calculateNewPos = (lat, lng, angle, distance) => {
    const rad = (angle * Math.PI) / 180;
    const deltaLat = (distance * Math.cos(rad)) / 111000;
    const deltaLng = (distance * Math.sin(rad)) / (111000 * Math.cos(lat * Math.PI / 180));
    return [lat + deltaLat, lng + deltaLng];
  };

  // Cek finish
  const checkFinish = (pos) => {
    const distToFinish = Math.sqrt(
      Math.pow(pos[0] - finishPoint[0], 2) + 
      Math.pow(pos[1] - finishPoint[1], 2)
    );
    return distToFinish < 0.001;
  };

  // Animasi gerak
  const animateMove = (startPos, targetPos, setPos) => {
    return new Promise((resolve) => {
      const steps = 20;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentLat = startPos[0] + (targetPos[0] - startPos[0]) * progress;
        const currentLng = startPos[1] + (targetPos[1] - startPos[1]) * progress;
        
        setPos([currentLat, currentLng]);
        
        if (currentStep >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Fungsi untuk menangani tabrakan
  const handleCollision = async (currentPos, boundaryPos, currentCollisions, setPos) => {
    await animateMove(currentPos, boundaryPos, (pos) => {
      setPos(pos);
    });
    
    const newCollisions = currentCollisions + 1;
    setCollisionCount(newCollisions);
    setCollisionEffect(true);
    setTimeout(() => setCollisionEffect(false), 1500);
    
    const currentScore = calculateScore(currentCollisions);
    const newScore = calculateScore(newCollisions);
    
    if (currentScore === 0) {
      setAlertMsg(`⚠️ Skor sudah 0! Tabrakan tidak mengurangi skor lagi. (Total tabrakan: ${newCollisions}x)`);
    } else {
      setAlertMsg(`⚠️ Kura-kura keluar sungai! Skor berkurang 5 (${currentScore} → ${newScore}) (Tabrakan #${newCollisions})`);
    }
    setTimeout(() => setAlertMsg(null), 3000);
    
    return newCollisions;
  };

  // Eksekusi perintah tunggal - menggunakan refs untuk state terbaru
  const executeCommand = async (cmd, currentPos, currentAngle, currentTrail, currentCollisions) => {
    const parts = cmd.trim().toLowerCase().split(' ');
    const action = parts[0];
    const value = parseFloat(parts[1]);
    
    let newPos = currentPos;
    let newAngle = currentAngle;
    let newTrail = [...currentTrail];
    let newCollisions = currentCollisions;
    let commandError = null;

    switch(action) {
      case 'forward':
      case 'fd': {
        if (isNaN(value)) {
          commandError = new Error('forward membutuhkan angka (meter)');
          break;
        }
        const targetPos = calculateNewPos(currentPos[0], currentPos[1], currentAngle, value);
        
        // Cek tabrakan di sepanjang lintasan
        const hasCollision = checkLineCollision(currentPos, targetPos);
        
        if (hasCollision) {
          // Cari titik tabrakan pertama
          const collisionPoint = findFirstCollisionPoint(currentPos, targetPos);
          
          if (collisionPoint && (collisionPoint[0] !== currentPos[0] || collisionPoint[1] !== currentPos[1])) {
            // Bergerak ke titik sebelum tabrakan
            newCollisions = await handleCollision(
              currentPos, 
              collisionPoint, 
              currentCollisions,
              (pos) => {
                newPos = pos;
                setTurtlePos(pos);
              }
            );
            newPos = collisionPoint;
            newTrail = [...newTrail, collisionPoint];
            setTrail(newTrail);
            commandError = new Error('Perintah melebihi batas wilayah');
            break;
          } else {
            commandError = new Error('Tidak bisa bergerak, sudah di batas');
            break;
          }
        }
        
        // Tidak ada tabrakan, lanjutkan gerakan normal
        await animateMove(currentPos, targetPos, (pos) => {
          newPos = pos;
          setTurtlePos(pos);
        });
        newPos = targetPos;
        newTrail = [...newTrail, targetPos];
        setTrail(newTrail);
        
        if (checkFinish(targetPos)) {
          setIsFinished(true);
        }
        break;
      }
        
      case 'backward':
      case 'bk': {
        if (isNaN(value)) {
          commandError = new Error('backward membutuhkan angka (meter)');
          break;
        }
        const backTarget = calculateNewPos(currentPos[0], currentPos[1], currentAngle + 180, value);
        
        // Cek tabrakan di sepanjang lintasan
        const hasCollision = checkLineCollision(currentPos, backTarget);
        
        if (hasCollision) {
          // Cari titik tabrakan pertama
          const collisionPoint = findFirstCollisionPoint(currentPos, backTarget);
          
          if (collisionPoint && (collisionPoint[0] !== currentPos[0] || collisionPoint[1] !== currentPos[1])) {
            // Bergerak ke titik sebelum tabrakan
            newCollisions = await handleCollision(
              currentPos, 
              collisionPoint, 
              currentCollisions,
              (pos) => {
                newPos = pos;
                setTurtlePos(pos);
              }
            );
            newPos = collisionPoint;
            newTrail = [...newTrail, collisionPoint];
            setTrail(newTrail);
            commandError = new Error('Perintah melebihi batas wilayah');
            break;
          } else {
            commandError = new Error('Tidak bisa bergerak, sudah di batas');
            break;
          }
        }
        
        // Tidak ada tabrakan, lanjutkan gerakan normal
        await animateMove(currentPos, backTarget, (pos) => {
          newPos = pos;
          setTurtlePos(pos);
        });
        newPos = backTarget;
        newTrail = [...newTrail, backTarget];
        setTrail(newTrail);
        
        if (checkFinish(backTarget)) {
          setIsFinished(true);
        }
        break;
      }
        
      case 'left':
      case 'lt': {
        if (isNaN(value)) {
          commandError = new Error('left membutuhkan angka (derajat)');
          break;
        }
        const newAngleValue = ((currentAngle - value) % 360 + 360) % 360;
        newAngle = newAngleValue;
        setTurtleAngle(newAngleValue);
        await delay(300);
        break;
      }
        
      case 'right':
      case 'rt': {
        if (isNaN(value)) {
          commandError = new Error('right membutuhkan angka (derajat)');
          break;
        }
        const newAngleValue = ((currentAngle + value) % 360 + 360) % 360;
        newAngle = newAngleValue;
        setTurtleAngle(newAngleValue);
        await delay(300);
        break;
      }
        
      case 'goto': {
        if (parts.length < 3) {
          commandError = new Error('goto membutuhkan lat dan lng');
          break;
        }
        const gotoLat = parseFloat(parts[1]);
        const gotoLng = parseFloat(parts[2]);
        const gotoPos = [gotoLat, gotoLng];
        
        // Cek tabrakan di sepanjang lintasan
        const hasCollision = checkLineCollision(currentPos, gotoPos);
        
        if (hasCollision) {
          // Cari titik tabrakan pertama
          const collisionPoint = findFirstCollisionPoint(currentPos, gotoPos);
          
          if (collisionPoint && (collisionPoint[0] !== currentPos[0] || collisionPoint[1] !== currentPos[1])) {
            // Bergerak ke titik sebelum tabrakan
            newCollisions = await handleCollision(
              currentPos, 
              collisionPoint, 
              currentCollisions,
              (pos) => {
                newPos = pos;
                setTurtlePos(pos);
              }
            );
            newPos = collisionPoint;
            newTrail = [...newTrail, collisionPoint];
            setTrail(newTrail);
            commandError = new Error('Titik tujuan tidak valid');
            break;
          } else {
            commandError = new Error('Tidak bisa bergerak ke tujuan');
            break;
          }
        }
        
        // Tidak ada tabrakan, lanjutkan gerakan normal
        await animateMove(currentPos, gotoPos, (pos) => {
          newPos = pos;
          setTurtlePos(pos);
        });
        newPos = gotoPos;
        newTrail = [...newTrail, gotoPos];
        setTrail(newTrail);
        
        if (checkFinish(gotoPos)) {
          setIsFinished(true);
        }
        break;
      }
        
      default:
        commandError = new Error(`Perintah tidak dikenal: ${action}`);
    }

    return {
      position: newPos,
      angle: newAngle,
      trail: newTrail,
      collisions: newCollisions,
      error: commandError
    };
  };

  // Jalankan semua perintah - MULTI-LINE SUPPORT
  const runCommands = async () => {
    if (!commands.trim() || isExecuting || isFinished) return;
    
    setIsExecuting(true);
    setError('');
    if (!startTime) setStartTime(Date.now());
    
    // Split commands by newline dan filter komentar
    const lines = commands.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
    
    if (lines.length === 0) {
      setIsExecuting(false);
      setError('Tidak ada perintah valid!');
      setTimeout(() => {
        if (editorRef.current && editorRef.current.view) {
          editorRef.current.view.focus();
        }
      }, 50);
      return;
    }
    
    const history = [];
    
    // Ambil state terbaru dari refs
    let currentPos = turtlePosRef.current;
    let currentAngle = turtleAngleRef.current;
    let currentTrail = trailRef.current;
    let currentCollisions = collisionCountRef.current;
    
    try {
      // Eksekusi perintah secara berurutan dari atas ke bawah
      for (let i = 0; i < lines.length; i++) {
        // Cek apakah sudah finish
        if (isFinishedRef.current) break;
        
        const currentCmd = lines[i];
        history.push({ 
          cmd: currentCmd, 
          status: 'running',
          index: i + 1,
          total: lines.length
        });
        setCommandHistory([...history]);
        
        // Jalankan perintah dengan state terbaru
        const result = await executeCommand(
          currentCmd,
          currentPos,
          currentAngle,
          currentTrail,
          currentCollisions
        );
        
        // Update state dengan hasil eksekusi
        if (result.error) {
          history[history.length - 1].status = 'error';
          history[history.length - 1].error = result.error.message;
          setCommandHistory([...history]);
          throw result.error;
        }
        
        // Update posisi, sudut, trail, dan collisions
        currentPos = result.position;
        currentAngle = result.angle;
        currentTrail = result.trail;
        currentCollisions = result.collisions;
        
        // Update refs
        turtlePosRef.current = currentPos;
        turtleAngleRef.current = currentAngle;
        trailRef.current = currentTrail;
        collisionCountRef.current = currentCollisions;
        
        // Update status menjadi selesai
        history[history.length - 1].status = 'done';
        setCommandHistory([...history]);
        
        // Delay kecil antar perintah untuk visualisasi yang lebih baik
        await delay(100);
      }
      
      // Jika semua perintah selesai dan belum mencapai finish
      if (!isFinishedRef.current) {
        setAlertMsg('✅ Semua perintah selesai dieksekusi!');
        setTimeout(() => setAlertMsg(null), 2000);
      }
      
    } catch (err) {
      setError(err.message);
      if (history.length) {
        history[history.length - 1].status = 'error';
        history[history.length - 1].error = err.message;
      }
      setCommandHistory([history]);
      
      setAlertMsg(`❌ Error pada baris ${history.length}: ${err.message}`);
      setTimeout(() => setAlertMsg(null), 4000);
    }
    
    setIsExecuting(false);
    setCommands('');
    
    // Fokus ke editor setelah eksekusi selesai
    setTimeout(() => {
      if (editorRef.current && editorRef.current.view) {
        editorRef.current.view.focus();
      }
    }, 100);
  };

  // Reset
  const reset = () => {
    setTurtlePos(startPoint);
    setTurtleAngle(0);
    setCommands('');
    setCommandHistory([]);
    setError('');
    setStartTime(null);
    setElapsedTime(0);
    setIsFinished(false);
    setTrail([startPoint]);
    setCollisionCount(0);
    setCollisionEffect(false);
    setShowUpdateModal(false);
    setAlertMsg(null);
    
    // Reset refs
    turtlePosRef.current = startPoint;
    turtleAngleRef.current = 0;
    trailRef.current = [startPoint];
    collisionCountRef.current = 0;
    isFinishedRef.current = false;
    
    // Fokus ke editor setelah reset
    setTimeout(() => {
      if (editorRef.current && editorRef.current.view) {
        editorRef.current.view.focus();
      }
    }, 100);
  };

  // Handle finish
  const handleFinish = async () => {
    setIsFinished(true);
    
    const finalSkor = calculateScore(collisionCount);
    const pathSegments = trail.length - 1;
    
    setNewScore(finalSkor);
    setNewTime(elapsedTime);
    setNewPath(pathSegments);
    
    const existing = await checkExistingData();
    
    let hasValidData = false;
    
    if (existing) {
      hasValidData = (existing.skor > 0 || existing.time > 0 || existing.path > 0);
    }
    
    if (existing && hasValidData) {
      setExistingScore(existing.skor || 0);
      setExistingTime(existing.time || 0);
      setExistingPath(existing.path || 0);
      setShowUpdateModal(true);
    } else {
      const saved = await saveToDatabase();
      if (saved) {
        setAlertMsg(`✅ Data berhasil disimpan! Skor: ${finalSkor}, Segmen: ${pathSegments}`);
        setTimeout(() => setAlertMsg(null), 3000);
      }
    }
  };

  // Handle update decision
  const handleUpdateDecision = async (shouldUpdate) => {
    setShowUpdateModal(false);
    
    if (shouldUpdate) {
      const saved = await saveToDatabase();
      if (saved) {
        setAlertMsg(`✅ Data berhasil diupdate! Skor: ${newScore}`);
        setTimeout(() => setAlertMsg(null), 3000);
      }
    } else {
      setAlertMsg(`ℹ️ Data lama dipertahankan. Skor: ${existingScore}`);
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update isFinished ketika mencapai finish
  useEffect(() => {
    if (checkFinish(turtlePos) && !isFinished && startTime) {
      handleFinish();
    }
  }, [turtlePos]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate('/sungai')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </motion.button>
          
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <img src={turtleImage} alt="🐢" className="w-6 h-6" />
              Sungai Kuin
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-lg">
            <Clock size={16} className="text-amber-400" />
            <span className="text-white font-mono">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-lg">
            <Trophy size={16} className="text-purple-400" />
            <span className="text-white font-mono">{calculateScore(collisionCount)}</span>
          </div>
          {collisionCount > 0 && (
            <div className="flex items-center gap-2 bg-red-900/50 px-3 py-1 rounded-lg border border-red-600">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-red-300 text-sm">Tabrakan: {collisionCount}x</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-green-900/50 px-3 py-1 rounded-lg border border-green-600">
            <Flag size={16} className="text-green-400" />
            <span className="text-green-300 text-sm">Start → Finish</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={turtlePos}
            zoom={18}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <LayersControl position="topleft">              
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
              </LayersControl.BaseLayer>
              
              <LayersControl.BaseLayer name="Satelit ESRI">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles © Esri"
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            
            <FollowTurtle position={turtlePos} />
            
            <MapGrid 
              riverBounds={batasSungai}
              stepMeters={gridSizeMeters}
              enabled={gridEnabled}
              marginDeg={0.05}
            />
            
            <GeoJSON 
              data={sungaiKuinGeoJSON}
              style={polygonStyle}
              ref={geojsonRef}
            />
            
            <Polygon 
              positions={batasSungai}
              pathOptions={{ 
                color: '#0ea5e9', 
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0,
                dashArray: '5, 10'
              }}
            />

            {/* Alert Popup */}
            <AnimatePresence>
              {alertMsg && (
                <motion.div
                  className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[2000]"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                >
                  <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 ${
                    alertMsg.includes('✅') ? 'bg-green-600 border-green-400' : 
                    alertMsg.includes('ℹ️') ? 'bg-blue-600 border-blue-400' :
                    alertMsg.includes('Skor sudah 0') ? 'bg-yellow-600 border-yellow-400' :
                    'bg-red-600 border-red-400'
                  } text-white`}>
                    <AlertCircle size={24} />
                    <span className="font-medium">{alertMsg}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Jejak Perjalanan */}
            {showTrail && trail.length > 1 && (
              <Polyline 
                positions={trail}
                pathOptions={{ 
                  color: '#f59e0b', 
                  weight: 4,
                  opacity: 0.8,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            )}
            
            {showTrail && trail.map((point, index) => (
              index > 0 && index < trail.length - 1 && (
                <Marker 
                  key={index}
                  position={point}
                  icon={L.divIcon({
                    className: 'trail-dot',
                    html: `<div style="
                      width: 6px;
                      height: 6px;
                      background: #f59e0b;
                      border-radius: 50%;
                      border: 1px solid white;
                      opacity: 0.6;
                    "></div>`,
                    iconSize: [6, 6],
                    iconAnchor: [3, 3],
                  })}
                />
              )
            ))}
            
            {/* Start Point */}
            <Marker position={startPoint} icon={startIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-green-600">START</p>
                  <p className="text-xs">Titik awal</p>
                  <p className="text-xs">Lat: {startPoint[0].toFixed(5)}</p>
                  <p className="text-xs">Lng: {startPoint[1].toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Finish Point */}
            <Marker position={finishPoint} icon={finishIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-red-600">FINISH</p>
                  <p className="text-xs">Titik tujuan</p>
                  <p className="text-xs">Lat: {finishPoint[0].toFixed(5)}</p>
                  <p className="text-xs">Lng: {finishPoint[1].toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Kura-kura */}
            <Marker 
              position={turtlePos}
              icon={createTurtleIcon(turtleAngle, collisionEffect)}
              ref={markerRef}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold">🐢 Kura-kura</p>
                  <p className="text-xs">Lat: {turtlePos[0].toFixed(5)}</p>
                  <p className="text-xs">Lng: {turtlePos[1].toFixed(5)}</p>
                  <p className="text-xs">Arah: {turtleAngle}°</p>
                  <div className="mt-2">
                    <img 
                      src={turtleImage} 
                      alt="Kura-kura" 
                      className="w-12 h-12 mx-auto"
                      style={{ transform: `rotate(${turtleAngle}deg)` }}
                    />
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Marker Lokasi Sungai Kuin - Tampil di Peta */}
            {lokasiSungaiKuin.map((lokasi, idx) => (
              <Marker
                key={idx}
                position={[lokasi.lat, lokasi.lng]}
                icon={getMarkerIcon(lokasi.Kategori_Lokasi)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-gray-800">{lokasi.Nama_Lokasi}</h3>
                    <p className="text-sm text-gray-600">{lokasi.Alamat_Wilayah}</p>
                    <p className="text-xs text-gray-500">Kategori: {lokasi.Kategori_Lokasi}</p>
                    <p className="text-xs text-gray-500">Tahun: {lokasi.Tahun_Berdiri}</p>
                    {lokasi.Deskripsi_Lokasi && (
                      <p className="text-xs text-gray-500 mt-1">{lokasi.Deskripsi_Lokasi}</p>
                    )}
                    <div className="mt-2 text-xs">
                      <span className={`px-2 py-0.5 rounded ${lokasi.Akses_Lokasi === 'Mudah' ? 'bg-green-100 text-green-800' : lokasi.Akses_Lokasi === 'Sedang' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {lokasi.Akses_Lokasi}
                      </span>
                      <span className={`ml-1 px-2 py-0.5 rounded ${lokasi.Bisa_Dicapai_Perahu === 'Ya' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {lokasi.Bisa_Dicapai_Perahu === 'Ya' ? '🚤 Bisa perahu' : '🚫 Tidak'}
                      </span>
                    </div>
                    {lokasi.Foto_Lokasi && (
                      <a
                        href={lokasi.Foto_Lokasi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-600 underline block mt-1"
                      >
                        Lihat Foto
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Direction Indicator */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl border-2 border-teal-500 z-[1000]">
            <div className="text-sm font-bold text-gray-800 mb-2 text-center">Arah Kura-kura</div>
            <div 
              className="w-20 h-20 border-4 border-teal-500 rounded-full flex items-center justify-center relative bg-teal-50"
              style={{ transform: `rotate(${turtleAngle}deg)` }}
            >
              <div className="absolute -top-3 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-teal-600" />
              <div className="w-3 h-3 bg-teal-600 rounded-full" />
            </div>
            <div className="text-center text-lg font-mono font-bold text-teal-700 mt-2">
              {turtleAngle}°
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg z-[1000]">
            <h4 className="font-bold text-gray-800 mb-3 text-sm">Legenda</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs border-2 border-white shadow">🏁</div>
                <span className="text-gray-700">Start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs border-2 border-white shadow">🚩</div>
                <span className="text-gray-700">Finish</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white shadow overflow-hidden bg-amber-100">
                  <img src={turtleImage} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-gray-700">Kura-kura</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-amber-500 rounded" style={{ background: '#f59e0b', height: '4px' }}></div>
                <span className="text-gray-700">Jejak Perjalanan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-sky-500 rounded" style={{ background: 'transparent', borderTop: '3px dashed #0ea5e9', height: '3px', width: '24px' }}></div>
                <span className="text-gray-700">Batas Sungai</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0 border-t border-gray-400 border-dashed" style={{ borderTop: `1px dashed ${gridEnabled ? '#9ca3af' : '#6b7280'}` }}></div>
                <span className="text-gray-700">Grid Peta ({gridSizeMeters} m)</span>
                {!gridEnabled && <span className="text-xs text-gray-400">(tersembunyi)</span>}
              </div>
              <div className="flex items-center gap-2 border-t border-gray-200 pt-2 mt-2">
                <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white shadow flex items-center justify-center text-xs text-white font-bold">?</div>
                <span className="text-gray-700">Lokasi (berwarna)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-[420px] bg-gray-800 border-l border-gray-700 flex flex-col h-full min-h-0">
          {/* Command Input dengan CodeMirror */}
          <div className="flex-shrink-0 p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Terminal size={18} />
                <span className="font-bold text-sm">Terminal Perintah</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="bg-gray-700 px-2 py-0.5 rounded">Enter</span>
                <span>Jalankan</span>
                <span className="text-gray-600">|</span>
                <span className="bg-gray-700 px-2 py-0.5 rounded">Shift+Enter</span>
                <span>Baris Baru</span>
              </div>
            </div>
            
            <div className="relative border border-gray-600 rounded-lg overflow-hidden bg-gray-900">
              <CodeMirror
                ref={editorRef}
                value={commands}
                height="160px"
                maxHeight="160px"
                extensions={[javascript()]}
                theme={oneDark}
                onChange={(value) => {
                  if (!isExecuting) {
                    setCommands(value);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    runCommands();
                  }
                }}
                autoFocus={true}
                editable={!isExecuting}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  defaultKeymap: true,
                  searchKeymap: true,
                  historyKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
                }}
              />
              {isExecuting && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-gray-800/90 px-3 py-1 rounded-lg z-10">
                  <div className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-teal-400 text-xs font-mono">Menjalankan...</span>
                </div>
              )}
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                {commands.split('\n').filter(line => line.trim() && !line.trim().startsWith('#')).length} perintah
              </span>
              <span>
                {commands.split('\n').filter(line => line.trim().startsWith('#')).length} komentar
              </span>
            </div>
            
            {error && (
              <div className="mt-2 p-2 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2 text-red-300 text-xs">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            
            <div className="flex gap-2 mt-3">
              <motion.button
                onClick={runCommands}
                disabled={isExecuting || !commands.trim() || isFinished}
                className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                whileHover={!isExecuting && !isFinished ? { scale: 1.02 } : {}}
                whileTap={!isExecuting && !isFinished ? { scale: 0.98 } : {}}
              >
                {isExecuting ? (
                  <>
                    <Pause size={18} className="animate-pulse" />
                    Menjalankan...
                  </>
                ) : isFinished ? (
                  'Selesai! 🎉'
                ) : (
                  <>
                    <Play size={18} />
                    Jalankan Semua
                  </>
                )}
              </motion.button>
              
              <motion.button
                onClick={reset}
                className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset semua ke awal"
              >
                <RotateCcw size={18} />
              </motion.button>
            </div>
          </div>

          {/* Command History - scrollable dengan batas */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0" style={{ maxHeight: '280px' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
                <ChevronRight size={14} />
                Riwayat Eksekusi
              </h3>
              {commandHistory.length > 0 && (
                <span className="text-xs text-gray-500">
                  {commandHistory.filter(h => h.status === 'done').length}/{commandHistory.length} selesai
                </span>
              )}
            </div>
            
            {commandHistory.length === 0 ? (
              <div className="text-gray-500 text-sm italic text-center py-4">
                <p>Belum ada perintah dijalankan...</p>
                <p className="text-xs mt-1">Mulai navigasi dari START ke FINISH!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {commandHistory.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`p-1.5 rounded-lg text-xs font-mono transition-all ${
                      item.status === 'done' ? 'bg-green-900/30 text-green-400 border border-green-700' :
                      item.status === 'error' ? 'bg-red-900/30 text-red-400 border border-red-700' :
                      'bg-amber-900/30 text-amber-400 border border-amber-700 animate-pulse'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="opacity-50 mr-1.5 text-[10px]">#{item.index || idx + 1}</span>
                      <span className="flex-1 truncate">{item.cmd}</span>
                      <span className="text-[10px] opacity-50 ml-1.5">
                        {item.status === 'done' && '✅'}
                        {item.status === 'error' && '❌'}
                        {item.status === 'running' && '⏳'}
                      </span>
                    </div>
                    {item.error && (
                      <div className="mt-0.5 text-[10px] text-red-300 opacity-75 truncate">
                        {item.error}
                      </div>
                    )}
                    {item.total && (
                      <div className="mt-0.5 text-[9px] text-gray-500">
                        {idx + 1} / {item.total}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Jejak & Grid - fixed di bawah */}
          <div className="flex-shrink-0 p-3 bg-gray-900/50 border-t border-gray-700">
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-400">Panjang Jejak</p>
                <p className="text-amber-400 font-mono font-bold text-sm">{trail.length - 1} segmen</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-400">Total Jarak</p>
                <p className="text-teal-400 font-mono font-bold text-sm">
                  {(trail.length > 1 ? 
                    (Math.sqrt(
                      Math.pow(trail[trail.length-1][0] - trail[0][0], 2) + 
                      Math.pow(trail[trail.length-1][1] - trail[0][1], 2)
                    ) * 111).toFixed(2) : 0)} km
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-400">Tabrakan</p>
                <p className={collisionCount > 0 ? 'text-red-400 font-bold text-sm' : 'text-green-400 font-bold text-sm'}>
                  {collisionCount > 0 ? `⚠️ ${collisionCount}x` : '✅ 0x'}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-400">Skor</p>
                <p className="text-purple-400 font-bold text-sm">
                  {isFinished ? calculateScore(collisionCount) : '—'}
                </p>
              </div>
            </div>

            {/* Kontrol Grid */}
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-gray-300 text-xs font-bold">
                  <Grid3x3 size={13} />
                  <span>KOTAK GRID</span>
                </div>
                <button
                  onClick={() => setGridEnabled(!gridEnabled)}
                  className="p-0.5 hover:bg-gray-700 rounded transition-colors"
                >
                  {gridEnabled ? <Eye size={13} className="text-teal-400" /> : <EyeOff size={13} className="text-gray-500" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={12} className="text-gray-400" />
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="25"
                  value={gridSizeMeters}
                  onChange={(e) => setGridSizeMeters(parseInt(e.target.value))}
                  disabled={!gridEnabled}
                  className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  style={{
                    background: gridEnabled ? '#14b8a6' : '#4b5563'
                  }}
                />
                <span className="text-xs text-gray-300 font-mono w-14 text-right">
                  {gridSizeMeters} m
                </span>
              </div>
              <p className="text-[9px] text-gray-500 mt-0.5 text-center">
                Jarak antar garis grid (200m - 1km)
              </p>
            </div>
          </div>

          {/* Help - fixed di paling bawah */}
          <div className="flex-shrink-0 p-2.5 bg-gray-900 border-t border-gray-700">
            <h4 className="text-[10px] font-bold text-gray-400 mb-1">PERINTAH YANG TERSEDIA:</h4>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-300">
              <div><span className="text-teal-400">forward</span>/<span className="text-teal-400">fd</span> [m]</div>
              <div><span className="text-teal-400">backward</span>/<span className="text-teal-400">bk</span> [m]</div>
              <div><span className="text-teal-400">left</span>/<span className="text-teal-400">lt</span> [°]</div>
              <div><span className="text-teal-400">right</span>/<span className="text-teal-400">rt</span> [°]</div>
              <div><span className="text-teal-400">goto</span> [lat] [lng]</div>
            </div>
            <div className="mt-1 text-[9px] text-gray-500">
              <span className="text-red-400">⚠️</span> Tabrakan -5 poin &nbsp; <span className="text-green-400">✅</span> Skor: 100 - (tabrakan × 5)
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Update Data */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <RefreshCw size={24} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Update Data?</h2>
                  <p className="text-sm text-gray-500">Anda sudah memiliki data untuk sungai ini</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 text-center">Perbandingan Data</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="text-xs text-gray-500 font-bold">Data</div>
                  <div className="text-xs text-gray-500 font-bold">Lama</div>
                  <div className="text-xs text-gray-500 font-bold">Baru</div>
                  <div className="text-xs text-gray-500 font-bold">Status</div>
                  
                  <div className="text-xs text-gray-600">Skor</div>
                  <div className="text-sm font-bold text-gray-700">{existingScore}</div>
                  <div className="text-sm font-bold text-teal-600">{newScore}</div>
                  <div className={`text-xs font-bold ${newScore > existingScore ? 'text-green-600' : newScore < existingScore ? 'text-red-600' : 'text-gray-500'}`}>
                    {newScore > existingScore ? '↑ Lebih baik' : newScore < existingScore ? '↓ Lebih rendah' : 'Sama'}
                  </div>
                  
                  <div className="text-xs text-gray-600">Waktu</div>
                  <div className="text-sm font-bold text-gray-700">{formatTime(existingTime)}</div>
                  <div className="text-sm font-bold text-teal-600">{formatTime(newTime)}</div>
                  <div className={`text-xs font-bold ${newTime < existingTime ? 'text-green-600' : newTime > existingTime ? 'text-red-600' : 'text-gray-500'}`}>
                    {newTime < existingTime ? '↑ Lebih cepat' : newTime > existingTime ? '↓ Lebih lambat' : 'Sama'}
                  </div>
                  
                  <div className="text-xs text-gray-600">Segmen</div>
                  <div className="text-sm font-bold text-gray-700">{existingPath}</div>
                  <div className="text-sm font-bold text-teal-600">{newPath}</div>
                  <div className={`text-xs font-bold ${newPath < existingPath ? 'text-green-600' : newPath > existingPath ? 'text-red-600' : 'text-gray-500'}`}>
                    {newPath < existingPath ? '↑ Lebih pendek' : newPath > existingPath ? '↓ Lebih panjang' : 'Sama'}
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
                <p className="font-bold">⚠️ Perhatian!</p>
                <p>Jika Anda memilih "Update", data lama akan diganti dengan data baru ini. 
                Tindakan ini tidak dapat dibatalkan.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateDecision(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Pertahankan Lama
                </button>
                <button
                  onClick={() => handleUpdateDecision(true)}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Update Baru
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Modal */}
      <AnimatePresence>
        {isFinished && !showUpdateModal && (
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
            >
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <img src={turtleImage} alt="Kura-kura" className="w-16 h-16 object-contain" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Level Selesai! 🎉</h2>
              <p className="text-gray-600 mb-6">
                {collisionCount === 0 
                  ? 'Kura-kura berhasil mencapai FINISH tanpa tabrakan!'
                  : `Kura-kura berhasil mencapai FINISH dengan ${collisionCount} kali tabrakan!`}
              </p>
              
              <div className="bg-gray-100 rounded-2xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Waktu</p>
                    <p className="text-2xl font-bold text-teal-600 font-mono mt-1">{formatTime(elapsedTime)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Skor</p>
                    <p className={`text-2xl font-bold font-mono mt-1 ${collisionCount === 0 ? 'text-green-600' : collisionCount >= 20 ? 'text-red-600' : 'text-orange-600'}`}>
                      {calculateScore(collisionCount)}
                    </p>
                    {collisionCount > 0 && (
                      <p className="text-[10px] text-gray-400">100 - ({collisionCount}×5) = {calculateScore(collisionCount)}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Segmen</p>
                    <p className="text-2xl font-bold text-amber-600 font-mono mt-1">{trail.length - 1}</p>
                  </div>
                </div>
                {collisionCount > 0 && (
                  <div className="mt-2 text-xs text-red-500">
                    ⚠️ {collisionCount}x tabrakan × 5 = -{Math.min(collisionCount * 5, 100)} poin
                    {collisionCount >= 20 && " (Skor minimal 0)"}
                  </div>
                )}
                {collisionCount >= 20 && (
                  <div className="mt-1 text-xs text-yellow-600">
                    ℹ️ Skor sudah mencapai 0, tabrakan selanjutnya tidak mengurangi skor lagi
                  </div>
                )}
              </div>
              
              {isSaving ? (
                <div className="flex items-center justify-center gap-2 py-3 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
                  <span>Menyimpan data...</span>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4 text-sm text-green-700">
                  ✅ Data berhasil disimpan!
                  <br />
                  <span className="text-xs">Skor: {calculateScore(collisionCount)} | Segmen: {trail.length - 1}</span>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/sungai')}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={reset}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
                >
                  Main Lagi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS tambahan untuk animasi */}
      <style jsx>{`
        @keyframes collisionFlash {
          0% { filter: drop-shadow(0 0 0 rgba(255, 0, 0, 0)); }
          50% { filter: drop-shadow(0 0 20px rgba(255, 0, 0, 0.8)); }
          100% { filter: drop-shadow(0 0 0 rgba(255, 0, 0, 0)); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .collision-effect {
          animation: collisionFlash 0.5s ease 3;
        }
      `}</style>
    </div>
  );
};

export default SungaiKuin;