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
  RefreshCw,
  X,
  ChevronRight,
  BookOpen,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  CheckCircle,
  Code,
  Map as MapIcon,
  Navigation,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LayersControl } from 'react-leaflet';
// Import CodeMirror dari @uiw
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

// Import gambar kura-kura
import turtleImage from './assets/kura-kura-obj.png';
// Import file GeoJSON (sungai Martapura part 3)
import sungaiMartapuraPart3GeoJSON from './geojson/sungaimartapurapart3.json';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Kura-kura Icon
const createTurtleIcon = (angle) => {
  return L.divIcon({
    className: 'custom-turtle-obj-icon',
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

// Komponen grid
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

// Ekstrak koordinat sungai Martapura part 3
const batasSungai = extractCoordinates(sungaiMartapuraPart3GeoJSON);

// Titik Start dan Finish
const startPoint = [-3.3121, 114.5935];
const finishPoint = [-3.3274, 114.5945];

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

// Fungsi mencari titik batas
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

// Komponen Onboarding/Welcome Popup
const OnboardingPopup = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      icon: <BookOpen className="text-teal-400" size={32} />,
      title: "Selamat Datang di Tutorial! 🐢",
      description: "Halo! Selamat datang di mode tutorial. Di sini kamu akan belajar cara menavigasi kura-kura menyusuri sungai menggunakan perintah-perintah sederhana.",
      tips: [
        "Mode ini GRATIS dan TANPA SKOR",
        "Belajar tanpa tekanan",
        "Cocok untuk pemula"
      ]
    },
    {
      icon: <Code className="text-blue-400" size={32} />,
      title: "Perintah Dasar",
      description: "Kura-kura bisa digerakkan dengan perintah-perintah berikut. Coba tulis di terminal!",
      tips: [
        "forward / fd [meter] - Maju",
        "backward / bk [meter] - Mundur",
        "left / lt [derajat] - Belok kiri",
        "right / rt [derajat] - Belok kanan"
      ]
    },
    {
      icon: <MapIcon className="text-green-400" size={32} />,
      title: "Peta & Navigasi",
      description: "Lihat peta dengan batas sungai (garis biru putus-putus). Jaga kura-kura tetap di dalam sungai!",
      tips: [
        "🏁 START - Titik awal",
        "🚩 FINISH - Titik tujuan",
        "⚠️ Keluar sungai = tabrakan",
        "📊 Skor = 100 - (tabrakan × 5)"
      ]
    },
    {
      icon: <Navigation className="text-amber-400" size={32} />,
      title: "Tips & Trik",
      description: "Beberapa tips untuk membantu perjalananmu mencapai FINISH dengan skor terbaik!",
      tips: [
        "Gunakan perintah kecil dulu (50m)",
        "Belok perlahan (30°-45°)",
        "Gunakan # untuk komentar",
        "Enter = jalankan, Shift+Enter = baris baru"
      ]
    }
  ];

  const current = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const nextStep = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  return (
    <motion.div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl max-w-lg w-full mx-4 shadow-2xl border border-white/20 overflow-hidden"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-white/50 font-medium">
              Langkah {currentStep + 1} dari {steps.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="flex gap-1 mb-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  idx === currentStep 
                    ? 'bg-gradient-to-r from-teal-400 to-cyan-400' 
                    : idx < currentStep 
                    ? 'bg-teal-400/50' 
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex flex-col items-center text-center">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4"
            >
              {current.icon}
            </motion.div>

            <motion.h2
              key={`title-${currentStep}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {current.title}
            </motion.h2>

            <motion.p
              key={`desc-${currentStep}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white/70 text-sm mb-4"
            >
              {current.description}
            </motion.p>

            <motion.div
              key={`tips-${currentStep}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-2 text-white/60 text-xs font-medium">
                <Info size={14} />
                <span>Tips & Informasi</span>
              </div>
              <div className="space-y-1.5 text-left">
                {current.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-white/80">
                    <CheckCircle size={14} className="text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-white/10">
          <button
            onClick={prevStep}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1 ${
              currentStep > 0
                ? 'text-white/80 hover:bg-white/10'
                : 'text-white/20 cursor-not-allowed'
            }`}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={16} />
            Kembali
          </button>

          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span>Tekan <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">→</kbd> atau <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">Enter</kbd> untuk lanjut</span>
          </div>

          <button
            onClick={nextStep}
            className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-1 shadow-lg"
          >
            {isLast ? (
              <>Mulai! <CheckCircle size={16} /></>
            ) : (
              <>Lanjut <ChevronRightIcon size={16} /></>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Tutorial = () => {
  const [alertMsg, setAlertMsg] = useState(null);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geojsonRef = useRef(null);
  
  // State untuk Onboarding
  const [showOnboarding, setShowOnboarding] = useState(true);
  
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
  const [collisionCount, setCollisionCount] = useState(0);
  
  const [trail, setTrail] = useState([startPoint]);
  const [showTrail, setShowTrail] = useState(true);

  // State untuk grid
  const [gridEnabled, setGridEnabled] = useState(true);
  const [gridSizeMeters, setGridSizeMeters] = useState(275);

  // State untuk popup hasil tutorial
  const [showResultPopup, setShowResultPopup] = useState(false);

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
      markerRef.current.setIcon(createTurtleIcon(turtleAngle));
    }
  }, [turtleAngle]);

  // Zoom ke batas sungai
  useEffect(() => {
    if (mapRef.current && batasSungai.length > 0) {
      const bounds = L.latLngBounds(batasSungai);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, []);

  // Fungsi untuk menghitung skor
  const calculateScore = (collisions) => {
    return Math.max(0, 100 - (collisions * 5));
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

  // Eksekusi perintah tunggal
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
        
        if (!isValidPosition(targetPos)) {
          const boundaryPos = findBoundaryPoint(currentPos, targetPos);
          if (boundaryPos[0] !== currentPos[0] || boundaryPos[1] !== currentPos[1]) {
            await animateMove(currentPos, boundaryPos, (pos) => {
              newPos = pos;
              setTurtlePos(pos);
            });
            newPos = boundaryPos;
            newTrail = [...newTrail, boundaryPos];
            setTrail(newTrail);
            
            newCollisions = currentCollisions + 1;
            setCollisionCount(newCollisions);
            
            const currentScore = calculateScore(currentCollisions);
            const newScore = calculateScore(newCollisions);
            
            if (currentScore === 0) {
              setAlertMsg(`⚠️ Skor sudah 0! Tabrakan tidak mengurangi skor lagi. (Total tabrakan: ${newCollisions}x)`);
            } else {
              setAlertMsg(`⚠️ Kura-kura keluar sungai! Skor berkurang 5 (${currentScore} → ${newScore}) (Tabrakan #${newCollisions})`);
            }
            setTimeout(() => setAlertMsg(null), 3000);
            commandError = new Error('Perintah melebihi batas wilayah');
            break;
          } else {
            commandError = new Error('Tidak bisa bergerak, sudah di batas');
            break;
          }
        }
        
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
        
        if (!isValidPosition(backTarget)) {
          const boundaryPos = findBoundaryPoint(currentPos, backTarget);
          if (boundaryPos[0] !== currentPos[0] || boundaryPos[1] !== currentPos[1]) {
            await animateMove(currentPos, boundaryPos, (pos) => {
              newPos = pos;
              setTurtlePos(pos);
            });
            newPos = boundaryPos;
            newTrail = [...newTrail, boundaryPos];
            setTrail(newTrail);
            
            newCollisions = currentCollisions + 1;
            setCollisionCount(newCollisions);
            
            const currentScore = calculateScore(currentCollisions);
            const newScore = calculateScore(newCollisions);
            
            if (currentScore === 0) {
              setAlertMsg(`⚠️ Skor sudah 0! Tabrakan tidak mengurangi skor lagi. (Total tabrakan: ${newCollisions}x)`);
            } else {
              setAlertMsg(`⚠️ Kura-kura keluar sungai! Skor berkurang 5 (${currentScore} → ${newScore}) (Tabrakan #${newCollisions})`);
            }
            setTimeout(() => setAlertMsg(null), 3000);
            commandError = new Error('Perintah melebihi batas wilayah');
            break;
          } else {
            commandError = new Error('Tidak bisa bergerak, sudah di batas');
            break;
          }
        }
        
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

  // Jalankan semua perintah
  const runCommands = async () => {
    if (!commands.trim() || isExecuting || isFinished) return;
    
    setIsExecuting(true);
    setError('');
    if (!startTime) setStartTime(Date.now());
    
    const lines = commands.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
    
    if (lines.length === 0) {
      setIsExecuting(false);
      setError('Tidak ada perintah valid!');
      return;
    }
    
    const history = [];
    let currentPos = turtlePosRef.current;
    let currentAngle = turtleAngleRef.current;
    let currentTrail = trailRef.current;
    let currentCollisions = collisionCountRef.current;
    
    try {
      for (let i = 0; i < lines.length; i++) {
        if (isFinishedRef.current) break;
        
        const currentCmd = lines[i];
        history.push({ 
          cmd: currentCmd, 
          status: 'running',
          index: i + 1,
          total: lines.length
        });
        setCommandHistory([...history]);
        
        const result = await executeCommand(
          currentCmd,
          currentPos,
          currentAngle,
          currentTrail,
          currentCollisions
        );
        
        if (result.error) {
          history[history.length - 1].status = 'error';
          history[history.length - 1].error = result.error.message;
          setCommandHistory([...history]);
          throw result.error;
        }
        
        currentPos = result.position;
        currentAngle = result.angle;
        currentTrail = result.trail;
        currentCollisions = result.collisions;
        
        turtlePosRef.current = currentPos;
        turtleAngleRef.current = currentAngle;
        trailRef.current = currentTrail;
        collisionCountRef.current = currentCollisions;
        
        history[history.length - 1].status = 'done';
        setCommandHistory([...history]);
        await delay(100);
      }
      
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
  };

  const handleFinish = () => {
    setIsFinished(true);
    setShowResultPopup(true);
  };

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
    setShowResultPopup(false);
    setAlertMsg(null);
    
    turtlePosRef.current = startPoint;
    turtleAngleRef.current = 0;
    trailRef.current = [startPoint];
    collisionCountRef.current = 0;
    isFinishedRef.current = false;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (checkFinish(turtlePos) && !isFinished && startTime) {
      handleFinish();
    }
  }, [turtlePos]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Onboarding Popup */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingPopup onClose={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

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
              Sungai Martapura (Tutorial)
            </h1>
            <span className="text-xs text-teal-400 ml-2">📖 Mode Tutorial - Skor tidak disimpan</span>
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
          <div className="bg-amber-900/50 px-3 py-1 rounded-lg border border-amber-600">
            <span className="text-amber-300 text-xs">🔓 Gratis - Tanpa Skor</span>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="bg-teal-600/50 hover:bg-teal-600 px-3 py-1 rounded-lg border border-teal-500 text-teal-300 text-xs flex items-center gap-1 transition"
          >
            <Info size={14} />
            Panduan
          </button>
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
              data={sungaiMartapuraPart3GeoJSON}
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
                    alertMsg.includes('❌') ? 'bg-red-600 border-red-400' :
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
              icon={createTurtleIcon(turtleAngle)}
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
            </div>
          </div>
        </div>

        {/* Control Panel - Dengan layout yang lebih terstruktur */}
        <div className="w-[420px] bg-gray-800 border-l border-gray-700 flex flex-col h-full min-h-0">
          {/* Command Input - fixed height */}
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
          <div className="flex-1 overflow-y-auto p-4 min-h-0" style={{ maxHeight: '220px' }}>
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
          <div className="flex-shrink-0 p-3 bg-gray-900 border-t border-gray-700">
            <h4 className="text-xs font-bold text-gray-400 mb-1.5">PERINTAH YANG TERSEDIA:</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
              <div><span className="text-teal-400">forward</span> / <span className="text-teal-400">fd</span> [m]</div>
              <div><span className="text-teal-400">backward</span> / <span className="text-teal-400">bk</span> [m]</div>
              <div><span className="text-teal-400">left</span> / <span className="text-teal-400">lt</span> [°]</div>
              <div><span className="text-teal-400">right</span> / <span className="text-teal-400">rt</span> [°]</div>
            </div>
            <div className="mt-1 text-[10px] text-gray-500">
              <span className="text-green-400">💡</span> <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[9px]">Enter</kbd> Jalankan &nbsp;|&nbsp; <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[9px]">Shift+Enter</kbd> Baris baru &nbsp;|&nbsp; <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[9px]">#</kbd> Komentar
            </div>
            <div className="mt-1 text-[10px] text-gray-500 border-t border-gray-700 pt-1">
              <span className="text-red-400">⚠️</span> Tabrakan -5 poin &nbsp; <span className="text-green-400">✅</span> Skor: 100 - (tabrakan × 5)
            </div>
          </div>
        </div>
      </div>

      {/* Result Popup */}
      <AnimatePresence>
        {showResultPopup && (
          <motion.div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 Tutorial Selesai!</h2>
              <p className="text-gray-600 mb-6">
                {collisionCount === 0 
                  ? '✨ Kura-kura berhasil mencapai FINISH tanpa tabrakan!'
                  : `🐢 Kura-kura berhasil mencapai FINISH dengan ${collisionCount} kali tabrakan!`}
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6 border-2 border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-sm font-bold text-blue-600">📊 HASIL TUTORIAL</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Tidak Disimpan</span>
                </div>
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

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
                <p className="font-bold">🔓 Mode Tutorial</p>
                <p className="text-xs">Skor ini hanya untuk latihan dan tidak disimpan ke database.</p>
                <p className="text-xs mt-1">Gunakan mode ini untuk berlatih sebelum bermain sungguhan!</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/sungai')}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Kembali
                </button>
                <button
                  onClick={reset}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Coba Lagi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tutorial;