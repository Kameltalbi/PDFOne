import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Merge from './pages/Merge';
import PdfToWord from './pages/PdfToWord';
import WordToPdf from './pages/WordToPdf';
import PdfToExcel from './pages/PdfToExcel';
import Compress from './pages/Compress';
import Protect from './pages/Protect';
import ToJpg from './pages/ToJpg';
import Tools from './pages/Tools'; // Catalogue des outils PDF
import EditPdf from './pages/EditPdf';
import EditResult from './pages/EditResult';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge" element={<Merge />} />
          <Route path="/pdf-to-word" element={<PdfToWord />} />
          <Route path="/word-to-pdf" element={<WordToPdf />} />
          <Route path="/pdf-to-excel" element={<PdfToExcel />} />
          <Route path="/compress" element={<Compress />} />
          <Route path="/protect" element={<Protect />} />
          <Route path="/to-jpg" element={<ToJpg />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/edit-pdf" element={<EditPdf />} />
          <Route path="/edit-pdf/result" element={<EditResult />} />
          {/* Add more routes as we implement other tools */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
