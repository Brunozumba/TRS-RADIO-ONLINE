import React, { useState, useEffect, useRef } from 'react';
import { NEWS_DATA, ADS_DATA, ABOUT_TEXTS } from '../data';
import { NewsItem, AdBanner } from '../types';
import { TRS_Database_Service } from '../services/db';
import { 
  Newspaper, 
  Megaphone, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  User, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Share2, 
  Play, 
  Pause, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function NewsAndAds() {
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPlaying, setIsSliderPlaying] = useState(true);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Selected News Item for modal details
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Dynamic news and ads lists
  const [newsList, setNewsList] = useState<NewsItem[]>(NEWS_DATA);
  const [adsList, setAdsList] = useState<any[]>(ADS_DATA);
  
  // Local states for view counters
  const [newsViews, setNewsViews] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    const fetchDB = async () => {
      try {
        const db = await TRS_Database_Service.getDatabase();
        if (db) {
          if (db.news && db.news.length > 0) {
            setNewsList(db.news);
            
            // Build views from DB
            const viewsObj: { [id: string]: number } = {};
            db.news.forEach(n => {
              viewsObj[n.id] = n.views;
            });
            setNewsViews(viewsObj);
          } else {
            // Default static views
            const initial: { [id: string]: number } = {};
            NEWS_DATA.forEach(n => {
              initial[n.id] = n.views;
            });
            setNewsViews(initial);
          }

          if (db.campaigns && db.campaigns.length > 0) {
            const activeCampaigns = db.campaigns
              .filter(c => c.status === 'Ativo')
              .map(c => {
                const sponsor = db.sponsors.find(s => s.id === c.clientId);
                return {
                  id: c.id,
                  client: sponsor ? sponsor.name : 'unidade comercial trs',
                  title: c.title,
                  tagline: `Promoção comercial sob demanda. Campanha ativa com prioridade ${c.priority}.`,
                  category: c.position,
                  ctaText: 'Ver Detalhes / Sintonizar',
                  ctaLink: sponsor ? sponsor.website : 'https://trsradioonline.com',
                  gradient: c.priority === 'Alta' ? 'linear-gradient(135deg, #1e1b4b 0%, #311005 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                  isCampaign: true
                };
              });
            
            setAdsList([...activeCampaigns, ...ADS_DATA].slice(0, 4));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDB();
  }, []);

  // Tracking Impressions (Views)
  useEffect(() => {
    adsList.forEach(async (ad) => {
      if (ad.isCampaign) {
        try {
          const db = await TRS_Database_Service.getDatabase();
          const camp = db.campaigns.find(c => c.id === ad.id);
          if (camp) {
            await TRS_Database_Service.update('campaigns', ad.id, {
              viewsCount: Math.min(camp.viewsCount + 1, camp.maxViews)
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  }, [adsList]);

  // Handle auto-play of the News Slider
  useEffect(() => {
    if (isSliderPlaying && newsList.length > 0) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % newsList.length);
      }, 5000); // cycle every 5 seconds
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

  // Navigate slides
  const nextSlide = () => {
    if (newsList.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % newsList.length);
  };

  const prevSlide = () => {
    if (newsList.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + newsList.length) % newsList.length);
  };

  // Open modal & increment view count
  const openNewsDetail = async (item: NewsItem) => {
    const nextViews = {
      ...newsViews,
      [item.id]: (newsViews[item.id] || item.views) + 1
    };
    setNewsViews(nextViews);
    localStorage.setItem('trs_news_views', JSON.stringify(nextViews));
    setSelectedNews(item);

    // Save view to DB if available
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

  const handleAdClick = async (ad: any) => {
    if (ad.isCampaign) {
      try {
        const db = await TRS_Database_Service.getDatabase();
        const camp = db.campaigns.find(c => c.id === ad.id);
        if (camp) {
          await TRS_Database_Service.update('campaigns', ad.id, {
            clicksCount: Math.min(camp.clicksCount + 1, camp.maxClicks)
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div id="news-and-ads-section" className="space-y-8">
      
      {/* 2. PUBLICITY SPACES & CLASSIFIED ADS (ESPAÇO PUBLICITÁRIO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adsList.map((ad) => (
          <div
            key={ad.id}
            id={`ad-card-${ad.id}`}
            style={{ background: ad.gradient }}
            className="p-6 rounded-3xl border border-slate-800/40 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300 min-h-[220px]"
          >
            {/* Visual background ambient pattern */}
            <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-wider bg-slate-950/60 text-slate-300 font-bold px-2 py-0.5 rounded-md border border-slate-800/20">
                  {ad.category}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-amber-400 font-mono font-black flex items-center gap-1">
                  <Megaphone className="w-3 h-3 text-red-500 shrink-0" />
                  Patrocinado
                </span>
              </div>
              
              <span className="text-xs text-amber-500 font-mono font-semibold block uppercase">{ad.client}</span>
              <h3 className="text-base font-extrabold text-white mt-1 leading-snug tracking-tight">
                {ad.title}
              </h3>
              <p className="text-slate-300 text-[11px] leading-relaxed mt-2 line-clamp-3">
                {ad.tagline}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              <a
                id={`btn-ad-cta-${ad.id}`}
                href={ad.ctaLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleAdClick(ad)}
                className="w-full py-2 bg-white/10 hover:bg-white text-slate-100 hover:text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{ad.ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 3. COMPREHENSIVE NEWS FEED */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl">
        <div className="border-b border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-amber-500" />
              Feed de Notícias & Cultura
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Fique por dentro de tudo o que acontece na música angolana e no entretenimento lusófono.
            </p>
          </div>
          
          <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            Atualizado: Hoje às {ABOUT_TEXTS.phone ? 'Luanda' : ''} (WAT)
          </span>
        </div>

        {/* Grid Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((item) => {
            const currentItemViews = newsViews[item.id] || item.views;
            return (
              <article
                key={item.id}
                id={`feed-card-${item.id}`}
                className="group flex flex-col justify-between bg-slate-950 border border-slate-800/60 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300"
              >
                <div 
                  className="h-44 bg-cover bg-center relative cursor-pointer"
                  onClick={() => openNewsDetail(item)}
                  style={{ backgroundImage: `url(${item.image})` }}
                  referrerPolicy="no-referrer"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
                    {item.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-500/70" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-amber-500/70" />
                        {currentItemViews} views
                      </span>
                    </div>

                    <h4 
                      onClick={() => openNewsDetail(item)}
                      className="text-white text-sm font-bold leading-snug group-hover:text-amber-500 transition-colors cursor-pointer line-clamp-2"
                    >
                      {item.title}
                    </h4>

                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span className="text-slate-500 italic">Por {item.author}</span>
                    <button
                      id={`btn-feed-read-${item.id}`}
                      onClick={() => openNewsDetail(item)}
                      className="text-amber-500 group-hover:text-amber-400 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      Ler Mais
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Sponsor Call */}
        <div className="mt-8 p-5 bg-gradient-to-r from-amber-500/5 to-red-600/5 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Espaço Comercial Disponível</span>
            <h4 className="text-white font-extrabold text-sm mt-0.5">Quer ver o seu negócio ou produto divulgado aqui?</h4>
            <p className="text-slate-400 text-xs mt-0.5">Alcançamos ouvintes fiéis em Angola, Portugal, Brasil e em toda a comunidade lusófona.</p>
          </div>
          <a
            id="btn-ad-footer-whatsapp"
            href={ABOUT_TEXTS.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Anunciar Connosco
          </a>
        </div>
      </div>

      {/* 4. MODAL NEWS DETAIL VIEW */}
      {selectedNews && (
        <div 
          id="news-detail-modal"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedNews(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()} // stop closing modal on clicking inner box
          >
            {/* Header image with close button */}
            <div 
              className="h-56 sm:h-64 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${selectedNews.image})` }}
              referrerPolicy="no-referrer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              
              <button
                id="btn-modal-close"
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
                    id="btn-modal-share"
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
                    id="btn-modal-close-foot"
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
