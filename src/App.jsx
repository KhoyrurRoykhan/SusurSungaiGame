import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DaftarSungai from './components/DaftarSungai';
import SungaiBarito from './components/game/SungaiBarito';
import SungaiAlalak from './components/game/SungaiAlalak';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sungai" element={<DaftarSungai />} />
        <Route path="/game/barito" element={<SungaiBarito />} />
        <Route path="/game/alalak" element={<SungaiAlalak />} />
      </Routes>
    </Router>
  );
}

export default App;