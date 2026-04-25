import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DaftarSungai from './components/DaftarSungai';
import SungaiBarito from './components/game/SungaiBarito';
import SungaiAlalak from './components/game/SungaiAlalak';
import SungaiMartapura from './components/game/SungaiMartapura';
import SungaiAlalakPart2 from './components/game/SungaiAlalakPart2';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sungai" element={<DaftarSungai />} />
        <Route path="/game/barito" element={<SungaiBarito />} />
        <Route path="/game/alalak" element={<SungaiAlalak />} />
        <Route path="/game/martapura" element={<SungaiMartapura />} />
        <Route path="/game/alalak2" element={<SungaiAlalakPart2 />} />
      </Routes>
    </Router>
  );
}

export default App;