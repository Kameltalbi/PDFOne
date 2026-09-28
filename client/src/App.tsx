import { useEffect, useRef } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { localizedPath, stripLocalePrefix, urlLocaleFromPath } from './i18n/localePath';
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
import FillSign from './pages/FillSign';
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
import NotFound from './pages/NotFound';
import { trackPageView, trackPricingView, trackToolOpen } from './lib/analytics';
import { BillingProvider } from './lib/billing';
import { UpgradeProvider } from './lib/upgrade';
import { UpgradeModal } from './components/UpgradeModal';
import PwaInstallBanner from './components/PwaInstallBanner';
import './App.css';

function RedirectTo({ to }: { to: string }) {
  const { pathname, search } = useLocation();
  return <Navigate to={`${localizedPath(to, urlLocaleFromPath(pathname))}${search}`} replace />;
}

function localeRoutes(prefix: '' | '/fr' | '/es') {
  const p = (path: string) => (prefix ? (path === '/' ? prefix : `${prefix}${path}`) : path);
  return [
    <Route key={p('/')} path={p('/')} element={<Home />} />,
    <Route key={p('/merge')} path={p('/merge')} element={<Merge />} />,
    <Route key={p('/pdf-to-word')} path={p('/pdf-to-word')} element={<PdfToWord />} />,
    <Route key={p('/word-to-pdf')} path={p('/word-to-pdf')} element={<WordToPdf />} />,
    <Route key={p('/pdf-to-excel')} path={p('/pdf-to-excel')} element={<PdfToExcel />} />,
    <Route key={p('/excel-to-pdf')} path={p('/excel-to-pdf')} element={<ExcelToPdf />} />,
    <Route key={p('/pdf-to-ppt')} path={p('/pdf-to-ppt')} element={<PdfToPpt />} />,
    <Route key={p('/pdf-to-pptx')} path={p('/pdf-to-pptx')} element={<RedirectTo to="/pdf-to-ppt" />} />,
    <Route key={p('/ppt-to-pdf')} path={p('/ppt-to-pdf')} element={<PptToPdf />} />,
    <Route key={p('/pptx-to-pdf')} path={p('/pptx-to-pdf')} element={<RedirectTo to="/ppt-to-pdf" />} />,
    <Route key={p('/compress')} path={p('/compress')} element={<Compress />} />,
    <Route key={p('/protect')} path={p('/protect')} element={<Protect />} />,
    <Route key={p('/to-jpg')} path={p('/to-jpg')} element={<ToJpg />} />,
    <Route key={p('/to-png')} path={p('/to-png')} element={<ToPng />} />,
    <Route key={p('/pdf-to-text')} path={p('/pdf-to-text')} element={<PdfToText />} />,
    <Route key={p('/unlock')} path={p('/unlock')} element={<Unlock />} />,
    <Route key={p('/ocr')} path={p('/ocr')} element={<Ocr />} />,
    <Route key={p('/summarize')} path={p('/summarize')} element={<Summarize />} />,
    <Route key={p('/translate')} path={p('/translate')} element={<Translate />} />,
    <Route key={p('/html-to-pdf')} path={p('/html-to-pdf')} element={<HtmlToPdf />} />,
    <Route key={p('/jpg-to-pdf')} path={p('/jpg-to-pdf')} element={<JpgToPdf />} />,
    <Route key={p('/split')} path={p('/split')} element={<Split />} />,
    <Route key={p('/delete-pages')} path={p('/delete-pages')} element={<DeletePages />} />,
    <Route key={p('/reorder')} path={p('/reorder')} element={<ReorderPages />} />,
    <Route key={p('/rotate')} path={p('/rotate')} element={<Rotate />} />,
    <Route key={p('/watermark')} path={p('/watermark')} element={<Watermark />} />,
    <Route key={p('/page-numbers')} path={p('/page-numbers')} element={<PageNumbers />} />,
    <Route key={p('/crop')} path={p('/crop')} element={<Crop />} />,
    <Route key={p('/sign')} path={p('/sign')} element={<Sign />} />,
    <Route key={p('/extract-pages')} path={p('/extract-pages')} element={<ExtractPages />} />,
    <Route key={p('/extract-images')} path={p('/extract-images')} element={<ExtractImages />} />,
    <Route key={p('/flatten')} path={p('/flatten')} element={<Flatten />} />,
    <Route key={p('/header-footer')} path={p('/header-footer')} element={<HeaderFooter />} />,
    <Route key={p('/fill-form')} path={p('/fill-form')} element={<FillForm />} />,
    <Route key={p('/fill-sign-pdf')} path={p('/fill-sign-pdf')} element={<FillSign />} />,
    <Route key={p('/heic-to-pdf')} path={p('/heic-to-pdf')} element={<HeicToPdf />} />,
    <Route key={p('/pricing')} path={p('/pricing')} element={<Pricing />} />,
    <Route key={p('/pricing/success')} path={p('/pricing/success')} element={<PricingSuccess />} />,
    <Route key={p('/login')} path={p('/login')} element={<LoginPage />} />,
    <Route key={p('/signup')} path={p('/signup')} element={<SignupPage />} />,
    <Route key={p('/account')} path={p('/account')} element={<AccountPage />} />,
    <Route key={p('/png-to-pdf')} path={p('/png-to-pdf')} element={<RedirectTo to="/jpg-to-pdf" />} />,
    <Route key={p('/tools')} path={p('/tools')} element={<Tools />} />,
    <Route key={p('/edit-pdf')} path={p('/edit-pdf')} element={<EditPdf />} />,
    <Route key={p('/edit-pdf/result')} path={p('/edit-pdf/result')} element={<EditResult />} />,
    <Route key={p('/privacy')} path={p('/privacy')} element={prefix === '/es' ? <Navigate to="/privacy" replace /> : <Privacy />} />,
    <Route key={p('/about')} path={p('/about')} element={<About />} />,
    <Route key={p('/contact')} path={p('/contact')} element={<Contact />} />,
    <Route key={p('/blog/:slug')} path={p('/blog/:slug')} element={<BlogPost />} />,
    <Route key={p('/blog')} path={p('/blog')} element={<Blog />} />,
    <Route key={p('/internal/ops')} path={p('/internal/ops')} element={<InternalOps />} />,
    ...(prefix === '' ? [<Route key="*" path="*" element={<NotFound />} />] : [])
  ];
}

function AppShell() {
  const { pathname, search } = useLocation();
  const barePath = stripLocalePrefix(pathname);
  const isAuth = barePath === '/login' || barePath === '/signup';
  const isOps = barePath.startsWith('/internal');
  const lastPageView = useRef<string | null>(null);

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
    if (barePath.startsWith('/internal')) return;
    const location = `${pathname}${search}`;
    if (lastPageView.current === location) return;
    lastPageView.current = location;
    trackPageView(pathname, search);
  }, [barePath, pathname, search]);

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
    <div className={isAuth ? 'app auth-app' : 'app'}>
      {!isAuth && !isOps && <Header />}
      <div className="app-body">
        <Routes>
          {localeRoutes('')}
          {localeRoutes('/fr')}
          {localeRoutes('/es')}
        </Routes>
      </div>
      {!isAuth && !isOps && <Footer />}
      {!isAuth && !isOps && <PwaInstallBanner />}
    </div>
  );
}

function App() {
  return (
    <BillingProvider>
    <UpgradeProvider>
    <AppShell />
    <UpgradeModal />
    </UpgradeProvider>
    </BillingProvider>
  );
}

export default App;
