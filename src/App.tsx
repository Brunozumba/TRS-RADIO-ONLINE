/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import AudioPlayer from './components/AudioPlayer';
import Schedule from './components/Schedule';
import AboutUs from './components/AboutUs';
import Partnerships from './components/Partnerships';
import SongRequests from './components/SongRequests';
import NewsAndAds from './components/NewsAndAds';
import NewsSlider from './components/NewsSlider';
import TRSLogo from './components/TRSLogo';
import AdminPanel from './components/admin/AdminPanel';
import { ABOUT_TEXTS } from './data';
import { TRS_Database_Service } from './services/db';
import { Radio, Calendar, Info, Building2, Globe, Phone, Heart, Share2, MessageSquare, Newspaper, Shield, Menu, X } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'site' | 'admin'>('site');
  const [activeTab, setActiveTab] = useState<'news' | 'requests' | 'schedule' | 'about' | 'advertising'>('news');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [db, setDb] = useState(() => TRS_Database_Service.getDatabase());

  useEffect(() => {
    return TRS_Database_Service.subscribe(() => {
      setDb(TRS_Database_Service.getDatabase());
    });
  }, []);

  const handleNavigate = (tab: 'news' | 'requests' | 'schedule' | 'about' | 'advertising') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    
    // Smooth scroll to content section with fallback
    setTimeout(() => {
      const element = document.getElementById('navigation-tabs-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleBackToSite = () => {
    setDb(TRS_Database_Service.getDatabase());
    setViewMode('site');
  };

  const config = db.config;

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TRS Rádio Online',
        text: 'Sintonize a TRS Rádio Online - A Música Sem Fronteiras, de Angola para o mundo!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: Copy link
      navigator.clipboard.writeText(window.location.href);
      alert('Link da rádio copiado para a área de transferência!');
    }
  };

  if (viewMode === 'admin') {
    return <AdminPanel onBackToSite={handleBackToSite} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Decorative Global Background Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none translate-y-1/3" />

      {/* Top Banner Warning for direct stream connection */}
      <div className="bg-gradient-to-r from-amber-600 to-red-600 text-slate-950 text-xs py-2 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2 z-50">
        <span className="inline-block w-2 h-2 bg-slate-950 rounded-full animate-ping" />
        <span>SINTONIZE AO VIVO DE ANGOLA PARA O MUNDO • TRANSMISSÃO EM ALTA FIDELIDADE 128KBPS</span>
      </div>

      {/* MAIN HEADER */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <TRSLogo className="w-11 h-11 filter drop-shadow-[0_2px_8px_rgba(212,175,55,0.2)] hover:scale-105 transition-all duration-300" />
            <div>
              <span className="font-extrabold text-xl tracking-tighter text-white block">
                {config.radioName?.substring(0, 3) || 'TRS'}<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">{config.radioName?.substring(3) || 'ONLINE'}</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 block -mt-1">
                {config.slogan || ABOUT_TEXTS.slogan}
              </span>
            </div>
          </div>

          {/* Desktop Header Navigation (Center) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/45 p-1.5 rounded-2xl border border-slate-900/80">
            <button
              onClick={() => handleNavigate('news')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              Notícias
            </button>
            <button
              onClick={() => handleNavigate('requests')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Pedir Música
            </button>
            <button
              onClick={() => handleNavigate('schedule')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Grelha
            </button>
            <button
              onClick={() => handleNavigate('about')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              Sobre Nós
            </button>
            <button
              onClick={() => handleNavigate('advertising')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'advertising'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Publicidade
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-header-share"
              onClick={shareApp}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Partilhar Rádio"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              id="btn-header-whatsapp"
              href={config.whatsappUrl || ABOUT_TEXTS.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-xs rounded-xl items-center gap-1.5 shadow-lg shadow-green-950/20 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE NAV PANEL (DRAWER) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-18 bg-slate-950/98 backdrop-blur-lg border-b border-slate-900/90 z-50 flex flex-col p-6 space-y-6 animate-slideDown shadow-2xl">
          <div className="flex flex-col gap-2">
            <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-1">Menu de Páginas</p>
            <button
              onClick={() => handleNavigate('news')}
              className={`p-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'bg-slate-900/50 border border-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Newspaper className="w-4 h-4 shrink-0" />
              Notícias & Anúncios
            </button>
            <button
              onClick={() => handleNavigate('requests')}
              className={`p-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'bg-slate-900/50 border border-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 shrink-0" />
              Pedir Música & Mensagens
            </button>
            <button
              onClick={() => handleNavigate('schedule')}
              className={`p-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'bg-slate-900/50 border border-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              Grelha de Programação
            </button>
            <button
              onClick={() => handleNavigate('about')}
              className={`p-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'bg-slate-900/50 border border-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              A Nossa História
            </button>
            <button
              onClick={() => handleNavigate('advertising')}
              className={`p-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'advertising'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'bg-slate-900/50 border border-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              Publicidade & Parcerias
            </button>
          </div>

          <div className="pt-4 border-t border-slate-900/80 flex flex-col gap-3">
            <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-1">Contactos Rápidos</p>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <a href={config.whatsappUrl || ABOUT_TEXTS.whatsappUrl} target="_blank" rel="noreferrer" className="text-slate-300 text-xs font-mono font-bold hover:text-green-400 transition-colors">
                WhatsApp: {config.phone || ABOUT_TEXTS.phone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-300 text-xs font-mono">E-mail: {config.email || ABOUT_TEXTS.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* CORE CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* NAVIGATION TABS SECTION */}
        <section id="navigation-tabs-section" className="space-y-6">
          <div className="flex border-b border-slate-900 pb-px overflow-x-auto scrollbar-none">
            <div className="flex gap-2 sm:gap-6 min-w-max">
              <button
                id="nav-tab-news"
                onClick={() => handleNavigate('news')}
                className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'news'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                Notícias & Anúncios
              </button>
              <button
                id="nav-tab-requests"
                onClick={() => handleNavigate('requests')}
                className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'requests'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Heart className="w-4 h-4" />
                Pedir Música & Mensagens
              </button>
              <button
                id="nav-tab-schedule"
                onClick={() => handleNavigate('schedule')}
                className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Grelha de Programação
              </button>
              <button
                id="nav-tab-about"
                onClick={() => handleNavigate('about')}
                className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'about'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Info className="w-4 h-4" />
                A Nossa História
              </button>
              <button
                id="nav-tab-advertising"
                onClick={() => handleNavigate('advertising')}
                className={`py-3 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'advertising'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Publicidade & Parcerias
              </button>
            </div>
          </div>

          {/* DYNAMIC FEATURED NEWS CAROUSEL (SLIDER DE NOTÍCIAS) */}
          {activeTab === 'news' && <NewsSlider />}

          {/* PERSISTENT AUDIO PLAYER */}
          <section aria-label="Rádio Player">
            <AudioPlayer />
          </section>

          {/* ACTIVE TAB RENDERER */}
          <div className="transition-all duration-300">
            {activeTab === 'news' && <NewsAndAds />}
            {activeTab === 'requests' && <SongRequests />}
            {activeTab === 'schedule' && <Schedule />}
            {activeTab === 'about' && <AboutUs />}
            {activeTab === 'advertising' && <Partnerships />}
          </div>
        </section>

      </main>

      {/* STUNNING FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-900">
            
            {/* Branding Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-lg text-white">
                  {config.radioName?.substring(0, 3) || 'TRS'}<span className="text-amber-500">{config.radioName?.substring(3) || 'ONLINE'}</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                A {config.radioName || 'TRS Rádio Online'} é uma estação digital dedicada à promoção da música, cultura e entretenimento, conectando as nossas raízes angolanas com ouvintes espalhados pelos quatro cantos do planeta.
              </p>
              <p className="text-amber-500 font-bold text-xs italic">
                "{config.slogan || ABOUT_TEXTS.slogan}"
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Secções</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('news')} className="hover:text-amber-500 transition-colors cursor-pointer text-left">
                    Notícias & Anúncios
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('requests')} className="hover:text-amber-500 transition-colors cursor-pointer text-left">
                    Pedidos de Música
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('schedule')} className="hover:text-amber-500 transition-colors cursor-pointer text-left">
                    Grelha de Programação
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('about')} className="hover:text-amber-500 transition-colors cursor-pointer text-left">
                    História & Visão
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('advertising')} className="hover:text-amber-500 transition-colors cursor-pointer text-left">
                    Publicidade & Parcerias
                  </button>
                </li>
              </ul>
            </div>

            {/* Contacts Column */}
            <div className="space-y-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Contactos Estúdio</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <a href={config.whatsappUrl || ABOUT_TEXTS.whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    WhatsApp: {config.phone || ABOUT_TEXTS.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>E-mail: {config.email || ABOUT_TEXTS.email}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Sede: {config.address || ABOUT_TEXTS.address}</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            <p className="text-[11px] text-slate-500">
              &copy; {new Date().getFullYear()} {config.radioName || 'TRS Rádio Online'}. Todos os direitos reservados. De Angola para o mundo.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                id="btn-footer-admin"
                onClick={() => setViewMode('admin')}
                className="text-[11px] text-slate-400 hover:text-amber-500 flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/80 hover:border-amber-500/20"
                title="Aceder ao Painel Administrativo"
              >
                <Shield className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="font-bold">Painel Administrativo</span>
              </button>

              <p className="text-[10px] text-slate-600 flex items-center gap-1">
                Desenvolvido com <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para os amantes da boa música.
              </p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
