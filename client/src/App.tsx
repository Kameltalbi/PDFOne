import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Merge from './pages/Merge';
import PdfToWord from './pages/PdfToWord';
import WordToPdf from './pages/WordToPdf';
import PdfToExcel from './pages/PdfToExcel';
import ExcelToPdf from './pages/ExcelToPdf';
import PdfToPpt from './pages/PdfToPpt';
import PptToPdf from './pages/PptToPdf';
import ToPng from './pages/ToPng';
import PdfToText from './pages/PdfToText';
import Unlock from './pages/Unlock';
import Ocr from './pages/Ocr';
import Summarize from './pages/Summarize';
import Translate from './pages/Translate';
import HtmlToPdf from './pages/HtmlToPdf';
import Compress from './pages/Compress';
import Protect from './pages/Protect';
import ToJpg from './pages/ToJpg';
import JpgToPdf from './pages/JpgToPdf';
import Split from './pages/Split';
import DeletePages from './pages/DeletePages';
import ReorderPages from './pages/ReorderPages';
import Rotate from './pages/Rotate';
import Watermark from './pages/Watermark';
import PageNumbers from './pages/PageNumbers';
import Crop from './pages/Crop';
import Sign from './pages/Sign';
import ExtractPages from './pages/ExtractPages';
import ExtractImages from './pages/ExtractImages';
import Flatten from './pages/Flatten';
import HeaderFooter from './pages/HeaderFooter';
import FillForm from './pages/FillForm';
import HeicToPdf from './pages/HeicToPdf';
import Pricing from './pages/Pricing';
import PricingSuccess from './pages/PricingSuccess';
import { AccountPage } from './pages/Account';
import { LoginPage, SignupPage } from './pages/Auth';
import Tools from './pages/Tools';
import EditPdf from './pages/EditPdf';
import EditResult from './pages/EditResult';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import InternalOps from './pages/InternalOps';
import { trackPageView, trackPricingView, trackToolOpen } from './lib/analytics';
import { BillingProvider } from './lib/billing';
import { UpgradeProvider } from './lib/upgrade';
import { UpgradeModal } from './components/UpgradeModal';
import './App.css';

function AppShell() {
  const { pathname, search } = useLocation();
  const bare = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/internal');
  const skipFirstPageView = useRef(true);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    trackToolOpen(pathname);
    trackPricingView(pathname);
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith('/internal')) return;
    if (skipFirstPageView.current) {
      skipFirstPageView.current = false;
      return;
    }
    trackPageView(pathname, search);
  }, [pathname, search]);

  useEffect(() => {
    if (window.location.hash) return;
    const reset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    reset();
    const frame = window.requestAnimationFrame(reset);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className={bare ? 'app auth-app' : 'app'}>
      {!bare && <Header />}
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge" element={<Merge />} />
          <Route path="/pdf-to-word" element={<PdfToWord />} />
          <Route path="/word-to-pdf" element={<WordToPdf />} />
          <Route path="/pdf-to-excel" element={<PdfToExcel />} />
          <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
          <Route path="/pdf-to-ppt" element={<PdfToPpt />} />
          <Route path="/pdf-to-pptx" element={<PdfToPpt />} />
          <Route path="/ppt-to-pdf" element={<PptToPdf />} />
          <Route path="/pptx-to-pdf" element={<PptToPdf />} />
          <Route path="/compress" element={<Compress />} />
          <Route path="/protect" element={<Protect />} />
          <Route path="/to-jpg" element={<ToJpg />} />
          <Route path="/to-png" element={<ToPng />} />
          <Route path="/pdf-to-text" element={<PdfToText />} />
          <Route path="/unlock" element={<Unlock />} />
          <Route path="/ocr" element={<Ocr />} />
          <Route path="/summarize" element={<Summarize />} />
          <Route path="/translate" element={<Translate />} />
          <Route path="/html-to-pdf" element={<HtmlToPdf />} />
          <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
          <Route path="/split" element={<Split />} />
          <Route path="/delete-pages" element={<DeletePages />} />
          <Route path="/reorder" element={<ReorderPages />} />
          <Route path="/rotate" element={<Rotate />} />
          <Route path="/watermark" element={<Watermark />} />
          <Route path="/page-numbers" element={<PageNumbers />} />
          <Route path="/crop" element={<Crop />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/extract-pages" element={<ExtractPages />} />
          <Route path="/extract-images" element={<ExtractImages />} />
          <Route path="/flatten" element={<Flatten />} />
          <Route path="/header-footer" element={<HeaderFooter />} />
          <Route path="/fill-form" element={<FillForm />} />
          <Route path="/heic-to-pdf" element={<HeicToPdf />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/pricing/success" element={<PricingSuccess />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/png-to-pdf" element={<JpgToPdf />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/edit-pdf" element={<EditPdf />} />
          <Route path="/edit-pdf/result" element={<EditResult />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/internal/ops" element={<InternalOps />} />
        </Routes>
      </div>
      {!bare && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <BillingProvider>
      <UpgradeProvider>
      <AppShell />
      <UpgradeModal />
      </UpgradeProvider>
      </BillingProvider>
    </Router>
  );
}

export default App;
