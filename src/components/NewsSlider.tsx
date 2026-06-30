import React, { useState, useEffect, useRef } from 'react';
import { NewsItem } from '../types';
import { TRS_Database_Service } from '../services/db';
import { 
  Sparkles, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Eye, 
  ArrowRight,
  User,
  Share2
} from 'lucide-react';

export default function NewsSlider() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPlaying, setIsSliderPlaying] = useState(true);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [newsViews, setNewsViews] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const db = await TRS_Database_Service.getDatabase();
        if (db && db.news && db.news.length > 0) {
          // Sort or take featured news (with category 'Destaque' or simply all of them)
          setNewsList(db.news);
          
          const viewsObj: { [id: string]: number } = {};
          db.news.forEach(n => {
            viewsObj[n.id] = n.views;
          });
          setNewsViews(viewsObj);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNews();

    return TRS_Database_Service.subscribe(fetchNews);
  }, []);

  useEffect(() => {
    if (isSliderPlaying && newsList.length > 0) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % newsList.length);
      }, 5000);
    } else {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    }

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [isSliderPlaying, newsList]);

  const nextSlide = () => {
    if (newsList.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % newsList.length);
  };

  const prevSlide = () => {
    if (newsList.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + newsList.length) % newsList.length);
  };

  const openNewsDetail = async (item: NewsItem) => {
    const nextViews = {
      ...newsViews,
      [item.id]: (newsViews[item.id] || item.views) + 1
    };
    setNewsViews(nextViews);
    setSelectedNews(item);

    try {
      const db = await TRS_Database_Service.getDatabase();
      const newsItem = db.news.find(n => n.id === item.id);
      if (newsItem) {
        await TRS_Database_Service.update('news', item.id, {
          views: newsItem.views + 1
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (newsList.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* 1. DYNAMIC NEWS SLIDER (SLIDE DE NOTÍCIAS EM DESTAQUES) */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute top-4 left-6 z-20 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white shadow-lg animate-pulse">
            <Sparkles className="w-3 h-3" />
            Em Destaque
          </span>
        </div>

        {/* Play/Pause controls for slide auto-rotation */}
        <div className="absolute top-4 right-6 z-20 flex items-center gap-2">
          <button
            id="btn-slider-playpause-slider"
            onClick={() => setIsSliderPlaying(!isSliderPlaying)}
            className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isSliderPlaying ? 'Pausar Rotação' : 'Iniciar Rotação'}
          >
            {isSliderPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>

        {/* Carousel Tracks */}
        <div className="relative h-[280px] sm:h-[350px] lg:h-[380px] w-full">
          {newsList.map((news, index) => {
            const isActive = index === currentSlide;
            const currentItemViews = newsViews[news.id] || news.views;
            
            return (
              <div
                key={news.id}
                id={`news-slide-slider-${news.id}`}
                className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-out flex flex-col justify-end p-6 sm:p-10 lg:p-12 ${
                  isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                {/* Background Image with optimized zoom and darkening gradient */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] ease-out select-none pointer-events-none"
                  style={{ 
                    backgroundImage: `url(${news.image})`,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)'
                  }}
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/30" />

                {/* News details card content */}
                <div className="relative z-10 max-w-3xl space-y-3 text-left">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-slate-950">
                      {news.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      {news.date}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                      <Eye className="w-3 h-3 text-amber-500" />
                      {currentItemViews} visualizações
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                    {news.title}
                  </h2>

                  <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
                    {news.excerpt}
                  </p>

                  <div className="pt-2 flex items-center gap-4">
                    <button
                      id={`btn-slide-read-slider-${news.id}`}
                      onClick={() => openNewsDetail(news)}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      Ler Notícia Completa
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="text-slate-400 text-xs italic hidden sm:inline">
                      Por: {news.author}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          id="btn-slider-prev-slider"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Notícia Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          id="btn-slider-next-slider"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Próxima Notícia"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel indicators dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 p-1 bg-slate-950/40 rounded-full border border-slate-800/20">
          {newsList.map((_, idx) => (
            <button
              key={idx}
              id={`btn-indicator-slider-${idx}`}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'bg-amber-500 w-5' : 'bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* MODAL NEWS DETAIL VIEW */}
      {selectedNews && (
        <div 
          id="news-detail-modal-slider"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image with close button */}
            <div 
              className="h-56 sm:h-64 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${selectedNews.image})` }}
              referrerPolicy="no-referrer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              
              <button
                id="btn-modal-close-slider"
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-800 font-bold text-sm cursor-pointer hover:scale-105 transition-all"
                title="Fechar"
              >
                ✕
              </button>

              <span className="absolute bottom-4 left-6 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
                {selectedNews.category}
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  Autor: {selectedNews.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {selectedNews.date}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  {newsViews[selectedNews.id] || selectedNews.views} visualizações
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {selectedNews.title}
              </h3>

              <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap space-y-4 border-t border-slate-800/80 pt-4">
                {selectedNews.content}
              </div>

              {/* Share & actions footer in modal */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <p className="text-[10px] text-slate-500 italic">TRS Rádio Online — A Música Sem Fronteiras</p>
                
                <div className="flex items-center gap-2">
                  <button
                    id="btn-modal-share-slider"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedNews.title,
                          text: selectedNews.excerpt,
                          url: window.location.href
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link da notícia copiado para a área de transferência!');
                      }
                    }}
                    className="p-2 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Partilhar</span>
                  </button>

                  <button
                    id="btn-modal-close-foot-slider"
                    onClick={() => setSelectedNews(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
