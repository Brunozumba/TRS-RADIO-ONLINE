import React, { useState, useEffect } from 'react';
import { Show } from '../types';
import { WEEKDAY_SCHEDULE, SATURDAY_SCHEDULE, SUNDAY_SCHEDULE } from '../data';
import { getAngolaTime } from './AudioPlayer';
import { Clock, Calendar, Disc, Users, Tag } from 'lucide-react';
import { TRS_Database_Service } from '../services/db';

export default function Schedule() {
  const [activeTab, setActiveTab] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');
  const [currentTime, setCurrentTime] = useState(getAngolaTime());
  const [dbShows, setDbShows] = useState<Show[]>([]);

  useEffect(() => {
    // Set default tab based on the actual day in Angola!
    const time = getAngolaTime();
    setCurrentTime(time);
    
    if (time.day === 6) {
      setActiveTab('saturday');
    } else if (time.day === 0) {
      setActiveTab('sunday');
    } else {
      setActiveTab('weekday');
    }

    const interval = setInterval(() => {
      setCurrentTime(getAngolaTime());
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const db = await TRS_Database_Service.getDatabase();
        if (db && db.shows && db.shows.length > 0) {
          setDbShows(db.shows);
        }
      } catch (err) {
        console.error('Error fetching shows from DB:', err);
      }
    };
    fetchShows();

    return TRS_Database_Service.subscribe(fetchShows);
  }, []);

  const getActiveSchedule = (): Show[] => {
    if (dbShows.length > 0) {
      return dbShows.filter(show => {
        if (show.day) {
          if (activeTab === 'saturday') return show.day === 'Sábado';
          if (activeTab === 'sunday') return show.day === 'Domingo';
          return show.day === 'Segunda a Sexta';
        }

        // Fallback keyword heuristic for legacy data
        const titleL = show.title.toLowerCase();
        const descL = show.description.toLowerCase();
        const tagL = (show.tag || '').toLowerCase();
        
        if (activeTab === 'saturday') {
          return titleL.includes('sábado') || descL.includes('sábado') || tagL.includes('sábado') || 
                 titleL.includes('top 50') || titleL.includes('mix dj') || titleL.includes('entrevistas');
        } else if (activeTab === 'sunday') {
          return titleL.includes('domingo') || descL.includes('domingo') || tagL.includes('domingo') || 
                 titleL.includes('gospel') || titleL.includes('histórias');
        } else {
          return !titleL.includes('sábado') && !descL.includes('sábado') && !tagL.includes('sábado') &&
                 !titleL.includes('domingo') && !descL.includes('domingo') && !tagL.includes('domingo') &&
                 !titleL.includes('top 50') && !titleL.includes('gospel');
        }
      });
    }

    switch (activeTab) {
      case 'saturday':
        return SATURDAY_SCHEDULE;
      case 'sunday':
        return SUNDAY_SCHEDULE;
      case 'weekday':
      default:
        return WEEKDAY_SCHEDULE;
    }
  };

  // Helper to determine if a show on the active tab is currently live
  const isCurrentlyLive = (show: Show): boolean => {
    const { day, totalMinutes } = currentTime;
    
    // Day type must match active tab
    const isWeekdayTab = activeTab === 'weekday' && day >= 1 && day <= 5;
    const isSaturdayTab = activeTab === 'saturday' && day === 6;
    const isSundayTab = activeTab === 'sunday' && day === 0;
    
    if (!isWeekdayTab && !isSaturdayTab && !isSundayTab) {
      return false;
    }

    const [startH, startM] = show.timeStart.split(':').map(Number);
    const [endH, endM] = show.timeEnd.split(':').map(Number);
    
    let startMin = startH * 60 + startM;
    let endMin = endH * 60 + endM;
    
    if (endH === 0 && endM === 0) {
      endMin = 24 * 60;
    }
    
    if (endMin < startMin) {
      return totalMinutes >= startMin || totalMinutes < endMin;
    }
    
    return totalMinutes >= startMin && totalMinutes < endMin;
  };

  return (
    <div id="schedule-section" className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Grelha de Programação
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Da manhã à madrugada — confira o que está no ar e o que vem a seguir.
          </p>
        </div>
        
        {/* Dynamic Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-mono bg-slate-950 border border-slate-800 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Fuso Horário de Angola (WAT)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl gap-1 mb-6 border border-slate-800/60">
        <button
          id="tab-weekday"
          onClick={() => setActiveTab('weekday')}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'weekday' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Segunda a Sexta
        </button>
        <button
          id="tab-saturday"
          onClick={() => setActiveTab('saturday')}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'saturday' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Sábado
        </button>
        <button
          id="tab-sunday"
          onClick={() => setActiveTab('sunday')}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'sunday' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Domingo
        </button>
      </div>

      {/* Show List */}
      <div className="grid gap-4">
        {getActiveSchedule().map((show) => {
          const live = isCurrentlyLive(show);
          return (
            <div
              key={show.id}
              id={`show-card-${show.id}`}
              className={`group p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                live
                  ? 'bg-gradient-to-r from-amber-950/40 to-red-950/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.07)] ring-1 ring-amber-500/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/70 hover:border-slate-700/60'
              }`}
            >
              {/* Highlight Background Glow */}
              {live && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent blur-2xl pointer-events-none" />
              )}
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Time & Title Info */}
                <div className="flex items-start sm:items-center gap-4">
                  {/* Time Circle */}
                  <div className={`w-14 h-14 shrink-0 rounded-2xl flex flex-col items-center justify-center font-mono text-center border transition-colors ${
                    live 
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' 
                      : 'bg-slate-900 text-slate-300 border-slate-800 group-hover:border-slate-700'
                  }`}>
                    <Clock className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] leading-none font-bold">
                      {show.timeStart}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-base lg:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {show.title}
                      </h3>
                      {live && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-red-950 text-red-400 border border-red-900/40 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          No Ar
                        </span>
                      )}
                      {show.tag && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/30">
                          <Tag className="w-2.5 h-2.5 text-amber-500" />
                          {show.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 md:line-clamp-none max-w-2xl leading-relaxed">
                      {show.description}
                    </p>
                  </div>
                </div>

                {/* Host Info */}
                {show.hosts && show.hosts.length > 0 && (
                  <div className="flex items-center gap-2 text-xs bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800/40 shrink-0">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    <div className="text-left">
                      <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider leading-none">Locução</p>
                      <p className="text-slate-300 font-bold mt-0.5">{show.hosts.join(', ')}</p>
                    </div>
                  </div>
                )}

              </div>
              
              {/* Show-end indicator timeline dot */}
              <div className="absolute top-1/2 left-0 w-1 h-8 bg-amber-500 rounded-r-md -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
      
      {/* Slogan Note */}
      <div className="mt-6 text-center text-xs text-slate-500 italic">
        * A programação de Sábados e Domingos destaca nossos programas especiais em Angola (WAT). Transmissão sem interrupções.
      </div>
    </div>
  );
}
