import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, GeoJSON, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Terminal,
  MapPin,
  Trophy,
  Clock,
  ArrowLeft,
  AlertCircle,
  Flag,
  Eraser,
  Mountain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LayersControl } from 'react-leaflet';

// Import gambar kura-kura
import turtleImage from './assets/kura-kura-obj.png';
// Import file GeoJSON
import sungaiBaritoGeoJSON from './geojson/sungaialalak.json';
import pulauKembangGeoJSON from './geojson/Pulau_Kembang.json';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Kura-kura Icon dengan gambar dan arah yang bisa berubah
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

// Fungsi untuk mengekstrak koordinat dari GeoJSON
const extractCoordinates = (geojson) => {
  if (geojson.features && geojson.features.length > 0) {
    const feature = geojson.features[0];
    if (feature.geometry.type === 'Polygon') {
      // Untuk Polygon, ambil ring pertama (biasanya yang terluar)
      return feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      // Untuk MultiPolygon, ambil ring pertama dari polygon pertama
      return feature.geometry.coordinates[0][0].map(coord => [coord[1], coord[0]]);
    }
  }
  return [];
};

// Ekstrak koordinat dari GeoJSON
const batasSungai = extractCoordinates(sungaiBaritoGeoJSON);
const pulauKembang = extractCoordinates(pulauKembangGeoJSON);

// Fungsi untuk menghitung titik tengah dari array koordinat
const calculateCenter = (coordinates) => {
  if (coordinates.length === 0) return [-3.305, 114.555];
  
  let latSum = 0, lngSum = 0;
  coordinates.forEach(coord => {
    latSum += coord[0];
    lngSum += coord[1];
  });
  
  return [latSum / coordinates.length, lngSum / coordinates.length];
};

// Hitung titik tengah untuk center map
const centerPoint = calculateCenter(batasSungai);

// Fungsi untuk mencari titik terendah (paling selatan) dan tertinggi (paling utara)
const findExtremePoints = (coordinates) => {
  let southPoint = coordinates[0]; // Lowest latitude (paling selatan)
  let northPoint = coordinates[0]; // Highest latitude (paling utara)
  
  coordinates.forEach(coord => {
    if (coord[0] < southPoint[0]) southPoint = coord; // Lebih kecil = lebih selatan
    if (coord[0] > northPoint[0]) northPoint = coord; // Lebih besar = lebih utara
  });
  
  return { southPoint, northPoint };
};

const { southPoint, northPoint } = findExtremePoints(batasSungai);

// Titik Start (bawah/selatan) dan Finish (atas/utara)
const startPoint = [-3.2814, 114.5667]; // Titik paling selatan sebagai START
const finishPoint = [-3.2884, 114.6008]; // Titik paling utara sebagai FINISH


// Style untuk polygon GeoJSON - Hanya garis
const polygonStyle = {
  color: '#0ea5e9',
  weight: 3,
  opacity: 0.8,
  fillOpacity: 0, // Tidak ada fill
  dashArray: '5, 10'
};

// Style untuk obstacle (Pulau Kembang)
const obstacleStyle = {
  // color: '#8B4513', // Warna coklat
  weight: 2,
  opacity: 0.9,
  // fillColor: '#8B4513',
  fillOpacity: 0.6,
  dashArray: null // Garis lurus
};

// Fungsi untuk mengecek apakah titik berada di dalam obstacle
const isPointInObstacle = (point, obstacle) => {
  const x = point[1], y = point[0];
  let inside = false;
  for (let i = 0, j = obstacle.length - 1; i < obstacle.length; j = i++) {
    const xi = obstacle[i][1], yi = obstacle[i][0];
    const xj = obstacle[j][1], yj = obstacle[j][0];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Fungsi untuk mengecek apakah titik valid (di dalam sungai dan tidak di obstacle)
const isValidPosition = (point) => {
  // Cek apakah di dalam batas sungai
  const inRiver = isPointInPolygon(point, batasSungai);
  if (!inRiver) return false;
  
  // Cek apakah di obstacle (Pulau Kembang)
  const inObstacle = isPointInObstacle(point, pulauKembang);
  if (inObstacle) return false;
  
  return true;
};

// Fungsi untuk mengecek titik di dalam polygon (untuk batas sungai)
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

const SungaiAlalak = () => {
    const navigate = useNavigate();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geojsonRef = useRef(null);
  const obstacleRef = useRef(null);
  const textareaRef = useRef(null); // Ref untuk textarea
  const [alertMsg, setAlertMsg] = useState(null); // State untuk popup alert
  
  // Turtle State - mulai dari startPoint
  const [turtlePos, setTurtlePos] = useState(startPoint);
  const [turtleAngle, setTurtleAngle] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commands, setCommands] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // State untuk jejak perjalanan
  const [trail, setTrail] = useState([startPoint]); // Mulai dengan titik start
  const [showTrail, setShowTrail] = useState(true);

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

  // Update marker icon when angle changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(createTurtleIcon(turtleAngle));
    }
  }, [turtleAngle]);

  // Zoom ke batas sungai saat pertama kali dimuat
  useEffect(() => {
    if (mapRef.current && batasSungai.length > 0) {
      const bounds = L.latLngBounds(batasSungai);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, []);

  // Effect untuk memfokuskan textarea setelah eksekusi selesai
  useEffect(() => {
    // Jika tidak sedang executing dan textarea ada, fokuskan
    if (!isExecuting && textareaRef.current && !isFinished) {
      textareaRef.current.focus();
    }
  }, [isExecuting, isFinished]);

  // Calculate new position
  const calculateNewPos = (lat, lng, angle, distance) => {
    const rad = (angle * Math.PI) / 180;
    const deltaLat = (distance * Math.cos(rad)) / 111000;
    const deltaLng = (distance * Math.sin(rad)) / (111000 * Math.cos(lat * Math.PI / 180));
    return [lat + deltaLat, lng + deltaLng];
  };

  // Check if reached finish
  const checkFinish = (pos) => {
    const distToFinish = Math.sqrt(
      Math.pow(pos[0] - finishPoint[0], 2) + 
      Math.pow(pos[1] - finishPoint[1], 2)
    );
    // Threshold ~100m
    return distToFinish < 0.001;
  };

  // Fungsi untuk mencari titik mentok di batas sungai/pulau
  const findBoundaryPoint = (start, target) => {
    // Hitung jarak antara start dan target (dalam meter)
    const lat1 = start[0];
    const lng1 = start[1];
    const lat2 = target[0];
    const lng2 = target[1];
    
    // Konversi ke radian untuk perhitungan jarak
    const R = 6371000; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const totalDistance = R * c; // dalam meter
    
    if (totalDistance === 0) return start;
    
    // Iterasi dengan step 1 meter
    const step = 1; // meter
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
        // Titik ini tidak valid, berhenti
        break;
      }
    }
    return lastValid;
  };

  // Modifikasi executeCommand untuk forward, backward, goto
  const executeCommand = async (cmd) => {
    const parts = cmd.trim().toLowerCase().split(' ');
    const action = parts[0];
    const value = parseFloat(parts[1]);

    switch(action) {
      case 'forward':
      case 'fd':
        if (isNaN(value)) throw new Error('forward membutuhkan angka (meter)');
        const targetPos = calculateNewPos(turtlePos[0], turtlePos[1], turtleAngle, value);
        
        if (!isValidPosition(targetPos)) {
          // Cari titik mentok
          const boundaryPos = findBoundaryPoint(turtlePos, targetPos);
          if (boundaryPos[0] !== turtlePos[0] || boundaryPos[1] !== turtlePos[1]) {
            await animateMove(boundaryPos);
            setTurtlePos(boundaryPos);
            setTrail(prev => [...prev, boundaryPos]);
            // Tampilkan alert popup
            setAlertMsg("⚠️ Kura-kura keluar sungai! Perintah tidak dapat dilanjutkan.");
            // Hapus alert setelah 3 detik
            setTimeout(() => setAlertMsg(null), 3000);
            throw new Error('Perintah melebihi batas wilayah');
          } else {
            throw new Error('Tidak bisa bergerak, sudah di batas');
          }
        }
        
        await animateMove(targetPos);
        setTurtlePos(targetPos);
        setTrail(prev => [...prev, targetPos]);
        if (checkFinish(targetPos)) setIsFinished(true);
        break;
        
      case 'backward':
      case 'bk':
        if (isNaN(value)) throw new Error('backward membutuhkan angka (meter)');
        const backTarget = calculateNewPos(turtlePos[0], turtlePos[1], turtleAngle + 180, value);
        
        if (!isValidPosition(backTarget)) {
          const boundaryPos = findBoundaryPoint(turtlePos, backTarget);
          if (boundaryPos[0] !== turtlePos[0] || boundaryPos[1] !== turtlePos[1]) {
            await animateMove(boundaryPos);
            setTurtlePos(boundaryPos);
            setTrail(prev => [...prev, boundaryPos]);
            setAlertMsg("⚠️ Kura-kura keluar batas sungai! Perintah tidak dapat dilanjutkan.");
            setTimeout(() => setAlertMsg(null), 3000);
            throw new Error('Perintah melebihi batas wilayah');
          } else {
            throw new Error('Tidak bisa bergerak, sudah di batas');
          }
        }
        
        await animateMove(backTarget);
        setTurtlePos(backTarget);
        setTrail(prev => [...prev, backTarget]);
        if (checkFinish(backTarget)) setIsFinished(true);
        break;
        
      case 'left':
      case 'lt':
        if (isNaN(value)) throw new Error('left membutuhkan angka (derajat)');
        setTurtleAngle(prev => {
          const newAngle = (prev - value) % 360;
          return newAngle < 0 ? newAngle + 360 : newAngle;
        });
        await delay(300);
        break;
        
      case 'right':
      case 'rt':
        if (isNaN(value)) throw new Error('right membutuhkan angka (derajat)');
        setTurtleAngle(prev => {
          const newAngle = (prev + value) % 360;
          return newAngle < 0 ? newAngle + 360 : newAngle;
        });
        await delay(300);
        break;
        
      case 'goto':
        if (parts.length < 3) throw new Error('goto membutuhkan lat dan lng');
        const gotoLat = parseFloat(parts[1]);
        const gotoLng = parseFloat(parts[2]);
        const gotoPos = [gotoLat, gotoLng];
        
        if (!isValidPosition(gotoPos)) {
          const boundaryPos = findBoundaryPoint(turtlePos, gotoPos);
          if (boundaryPos[0] !== turtlePos[0] || boundaryPos[1] !== turtlePos[1]) {
            await animateMove(boundaryPos);
            setTurtlePos(boundaryPos);
            setTrail(prev => [...prev, boundaryPos]);
            setAlertMsg("⚠️ Titik tujuan di luar batas, kura-kura hanya sampai batas terdekat.");
            setTimeout(() => setAlertMsg(null), 3000);
            throw new Error('Titik tujuan tidak valid');
          } else {
            throw new Error('Tidak bisa bergerak ke tujuan');
          }
        }
        
        await animateMove(gotoPos);
        setTurtlePos(gotoPos);
        setTrail(prev => [...prev, gotoPos]);
        if (checkFinish(gotoPos)) setIsFinished(true);
        break;
        
      default:
        throw new Error(`Perintah tidak dikenal: ${action}`);
    }
  };

  // Animate movement
  const animateMove = (targetPos) => {
    return new Promise((resolve) => {
      const startPos = [...turtlePos];
      const steps = 20;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentLat = startPos[0] + (targetPos[0] - startPos[0]) * progress;
        const currentLng = startPos[1] + (targetPos[1] - startPos[1]) * progress;
        
        setTurtlePos([currentLat, currentLng]);
        
        if (currentStep >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Run all commands
  const runCommands = async () => {
    if (!commands.trim() || isExecuting || isFinished) return;
    
    setIsExecuting(true);
    setError('');
    if (!startTime) setStartTime(Date.now());
    
    const lines = commands.split('\n').filter(line => line.trim());
    const history = [];
    
    try {
      for (const line of lines) {
        if (isFinished) break;
        
        history.push({ cmd: line, status: 'running' });
        setCommandHistory([...history]);
        
        await executeCommand(line);
        
        history[history.length - 1].status = 'done';
        setCommandHistory([...history]);
      }
      
    } catch (err) {
      setError(err.message);
      history[history.length - 1].status = 'error';
      setCommandHistory([...history]);
    }
    
    setIsExecuting(false);
    
    // Hapus semua kode di terminal setelah selesai dieksekusi
    setCommands('');
    
    // Fokus kembali ke textarea setelah state diupdate
    // useEffect akan menangani fokus karena isExecuting berubah
  };

  // Handler untuk key down di textarea
  const handleKeyDown = (e) => {
    // Cek jika tombol Enter ditekan tanpa Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Mencegah new line
      runCommands(); // Jalankan perintah
    }
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
    setTrail([startPoint]); // Reset jejak ke titik start saja
    
    // Fokus ke textarea setelah reset
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  // Hapus jejak
  const clearTrail = () => {
    setTrail([turtlePos]); // Set jejak hanya dengan posisi saat ini
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
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
              Sungai Alalak
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-lg">
            <Clock size={16} className="text-amber-400" />
            <span className="text-white font-mono">{formatTime(elapsedTime)}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-green-900/50 px-3 py-1 rounded-lg border border-green-600">
            <Flag size={16} className="text-green-400" />
            <span className="text-green-300 text-sm">Start → Finish</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={turtlePos} // Center mengikuti posisi kura-kura
            zoom={18} // Zoom lebih dekat
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <LayersControl position="topleft">
            
            <LayersControl.BaseLayer checked name="Satelit ESRI">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>

          </LayersControl>
            
            {/* Komponen untuk mengikuti kura-kura */}
            <FollowTurtle position={turtlePos} />
            
            {/* River Boundary dari GeoJSON - Hanya garis */}
            <GeoJSON 
              data={sungaiBaritoGeoJSON}
              style={polygonStyle}
              ref={geojsonRef}
            />
            
            {/* Pulau Kembang sebagai obstacle */}
            <GeoJSON 
              data={pulauKembangGeoJSON}
              style={obstacleStyle}
              ref={obstacleRef}
            />
            
            {/* Polygon untuk kompatibilitas dengan fungsi isPointInPolygon - juga hanya garis */}
            <Polygon 
              positions={batasSungai}
              pathOptions={{ 
                color: '#0ea5e9', 
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0, // Transparan penuh, hanya garis
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
                    <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-red-400">
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
                  lineJoin: 'round',
                  dashArray: null
                }}
              />
            )}
            
            {/* Titik-titik jejak (opsional) */}
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
                  <p className="text-xs">Titik paling utara</p>
                  <p className="text-xs">Lat: {finishPoint[0].toFixed(5)}</p>
                  <p className="text-xs">Lng: {finishPoint[1].toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Kura-kura dengan gambar dan arah yang bisa berputar */}
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
                <span className="text-gray-700">Finish (Utara)</span>
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
                <div className="w-6 h-1 bg-sky-500 rounded" style={{ 
                  background: 'transparent', 
                  borderTop: '3px dashed #0ea5e9',
                  height: '3px',
                  width: '24px'
                }}></div>
                <span className="text-gray-700">Batas Sungai</span>
                </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Command Input */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-2 text-gray-300">
              <Terminal size={18} />
              <span className="font-bold text-sm">Terminal Perintah</span>
            </div>
            
            <textarea
              ref={textareaRef}
              value={commands}
              onChange={(e) => setCommands(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Contoh perintah:\nforward 100\nleft 90\nforward 50\nright 45\nbackward 30\n\nTekan Enter untuk menjalankan`}
              className="w-full h-36 bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg border border-gray-600 focus:border-teal-500 focus:outline-none resize-none"
              disabled={isExecuting}
              autoFocus // Auto focus saat komponen dimuat
            />
            
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
                {isExecuting ? <Pause size={18} /> : <Play size={18} />}
                {isExecuting ? 'Running...' : isFinished ? 'Selesai!' : 'Jalankan'}
              </motion.button>
              
              <motion.button
                onClick={reset}
                className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={18} />
              </motion.button>
            </div>
            
          </div>

          {/* Command History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-bold text-gray-400 mb-3">Riwayat Eksekusi</h3>
            
            {commandHistory.length === 0 ? (
              <div className="text-gray-500 text-sm italic text-center py-8">
                <p>Belum ada perintah dijalankan...</p>
                <p className="text-xs mt-2">Mulai navigasi dari START ke FINISH! Hindari Pulau Kembang!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {commandHistory.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`p-2 rounded-lg text-sm font-mono ${
                      item.status === 'done' ? 'bg-green-900/30 text-green-400 border border-green-700' :
                      item.status === 'error' ? 'bg-red-900/30 text-red-400 border border-red-700' :
                      'bg-amber-900/30 text-amber-400 border border-amber-700'
                    }`}
                  >
                    <span className="opacity-50 mr-2">{idx + 1}.</span>
                    {item.cmd}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Jejak */}
          <div className="p-3 bg-gray-900/50 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Panjang Jejak:</span>
              <span className="text-amber-400 font-mono font-bold">{trail.length - 1} segmen</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Total Jarak:</span>
              <span className="text-teal-400 font-mono font-bold">
                {(trail.length > 1 ? 
                  (Math.sqrt(
                    Math.pow(trail[trail.length-1][0] - trail[0][0], 2) + 
                    Math.pow(trail[trail.length-1][1] - trail[0][1], 2)
                  ) * 111).toFixed(2) : 0)} km
              </span>
            </div>
          </div>

          {/* Help */}
          <div className="p-4 bg-gray-900 border-t border-gray-700">
            <h4 className="text-xs font-bold text-gray-400 mb-2">PERINTAH YANG TERSEDIA:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div><span className="text-teal-400">forward</span> / <span className="text-teal-400">fd</span> [m]</div>
              <div><span className="text-teal-400">backward</span> / <span className="text-teal-400">bk</span> [m]</div>
              <div><span className="text-teal-400">left</span> / <span className="text-teal-400">lt</span> [°]</div>
              <div><span className="text-teal-400">right</span> / <span className="text-teal-400">rt</span> [°]</div>
            </div>
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      <AnimatePresence>
        {isFinished && (
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
            >
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <img src={turtleImage} alt="Kura-kura" className="w-16 h-16 object-contain" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Level Selesai! 🎉</h2>
              <p className="text-gray-600 mb-6">Kura-kura berhasil mencapai FINISH tanpa menabrak pulau!</p>
              
              <div className="bg-gray-100 rounded-2xl p-4 mb-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Waktu Penyelesaian</p>
                  <p className="text-4xl font-bold text-teal-600 font-mono mt-1">{formatTime(elapsedTime)}</p>
                </div>
                <div className="flex justify-between mt-3 text-xs">
                  <span className="text-gray-500">Panjang Jejak:</span>
                  <span className="text-amber-600 font-bold">{trail.length - 1} segmen</span>
                </div>
              </div>
              
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
    </div>
  )
}

export default SungaiAlalak
