import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Music, Clock, Settings, HelpCircle, Activity, Wifi, AlertCircle, ExternalLink } from 'lucide-react';
import { Show } from '../types';
import { WEEKDAY_SCHEDULE, SATURDAY_SCHEDULE, SUNDAY_SCHEDULE } from '../data';
import TRSLogo from './TRSLogo';
import { TRS_Database_Service } from '../services/db';

// Helper to get current Angola time (UTC+1)
export function getAngolaTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const angolaDate = new Date(utc + 3600000 * 1); // UTC+1
  
  const hours = angolaDate.getHours();
  const minutes = angolaDate.getMinutes();
  const day = angolaDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  return {
    day,
    hours,
    minutes,
    totalMinutes: hours * 60 + minutes,
    formatted: angolaDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    dateFormatted: angolaDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
  };
}

// Check if show is active
function isShowActive(show: Show, currentMinutes: number): boolean {
  const [startH, startM] = show.timeStart.split(':').map(Number);
  const [endH, endM] = show.timeEnd.split(':').map(Number);
  
  let startMin = startH * 60 + startM;
  let endMin = endH * 60 + endM;
  
  if (endH === 0 && endM === 0) {
    endMin = 24 * 60;
  }
  
  if (endMin < startMin) {
    return currentMinutes >= startMin || currentMinutes < endMin;
  }
  
  return currentMinutes >= startMin && currentMinutes < endMin;
}

// Find current show and up next show
export function getCurrentAndNextShow() {
  const { day, totalMinutes } = getAngolaTime();
  let schedule: Show[] = [];
  
  if (day >= 1 && day <= 5) {
    schedule = WEEKDAY_SCHEDULE;
  } else if (day === 6) {
    schedule = SATURDAY_SCHEDULE;
  } else {
    schedule = SUNDAY_SCHEDULE;
  }
  
  let currentShow: Show | null = null;
  let nextShow: Show | null = null;
  
  // Find current
  for (let i = 0; i < schedule.length; i++) {
    if (isShowActive(schedule[i], totalMinutes)) {
      currentShow = schedule[i];
      // Next show is simply the next in list, circular
      nextShow = schedule[(i + 1) % schedule.length];
      break;
    }
  }
  
  // If no show matches active time (mainly Saturday/Sunday off-hours)
  if (!currentShow && schedule.length > 0) {
    // Find the next upcoming show
    const sortedShows = [...schedule].sort((a, b) => {
      const [ah, am] = a.timeStart.split(':').map(Number);
      const [bh, bm] = b.timeStart.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });
    
    for (const show of sortedShows) {
      const [sh, sm] = show.timeStart.split(':').map(Number);
      if (sh * 60 + sm > totalMinutes) {
        nextShow = show;
        break;
      }
    }
    
    if (!nextShow) nextShow = sortedShows[0];
    
    currentShow = {
      id: 'default',
      title: 'TRS - A Música Sem Fronteiras',
      timeStart: '00:00',
      timeEnd: '00:00',
      description: 'A melhor seleção de música angolana e ritmos africanos em emissão contínua.',
      tag: 'Playlist Especial',
      hosts: ['Programação Automática']
    };
  }
  
  return { currentShow, nextShow };
}

interface AudioPlayerProps {
  layout?: 'full' | 'mini';
}

export default function AudioPlayer({ layout = 'full' }: AudioPlayerProps) {
  const [config, setConfig] = useState(() => TRS_Database_Service.getDatabase().config);
  const [activeStreamId, setActiveStreamId] = useState('trs-official');
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);

  useEffect(() => {
    const updateConfig = () => {
      setConfig(TRS_Database_Service.getDatabase().config);
    };
    return TRS_Database_Service.subscribe(updateConfig);
  }, []);

  const streamUrl = config.streamUrl || 'https://link.radio.br:17308/stream';

  const STREAM_OPTIONS = [
    {
      id: 'trs-official',
      name: 'Canal Oficial TRS (Kizomba/Semba/Kuduro)',
      url: streamUrl,
      note: 'Transmissão direta de alta fidelidade (Porto 17308). Requer que o navegador ou rede permita conexões a portas personalizadas.',
      isOfficial: true
    },
    {
      id: 'trs-http-fallback',
      name: 'Canal Oficial TRS (Transmissão via HTTP)',
      url: streamUrl.replace('https://', 'http://'),
      note: 'Útil caso o seu navegador ou rede bloqueie a porta com SSL (HTTPS). Pode ser jogado diretamente no seu reprodutor.',
      isOfficial: true
    },
    {
      id: 'secure-backup',
      name: 'Servidor Seguro Alternativo (Ritmos Africanos)',
      url: 'https://stream.zeno.fm/f378v6v27reuv',
      note: 'Fluxo contínuo via HTTPS standard (Porto 443). Funciona em qualquer navegador, rede corporativa ou iframe.',
      isOfficial: false
    },
    {
      id: 'test-backup',
      name: 'Canal de Teste de Áudio & Visualizador (Música do Mundo)',
      url: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      note: 'Fluxo mundial padrão (HTTPS) ideal para testar os efeitos visuais e o equalizador em tempo real.',
      isOfficial: false
    }
  ];
  
  const activeStream = STREAM_OPTIONS.find(s => s.id === activeStreamId)?.url || STREAM_OPTIONS[0].url;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [angolaTimeStr, setAngolaTimeStr] = useState('');
  const [shows, setShows] = useState(getCurrentAndNextShow());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isStoppingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Live Clock & Active Show polling (every 1 second)
  useEffect(() => {
    const updateTime = () => {
      const time = getAngolaTime();
      setAngolaTimeStr(`${time.dateFormatted}, ${time.formatted} (WAT)`);
      setShows(getCurrentAndNextShow());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        try {
          audioRef.current.src = '';
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Synchronize activeStream with the actual audio element src when it changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    const currentSrc = audioRef.current.src;
    if (currentSrc && isPlaying) {
      const normalizedCurrent = currentSrc.replace(/\/$/, '');
      const normalizedNew = activeStream.replace(/\/$/, '');
      if (normalizedCurrent !== normalizedNew) {
        console.log(`[STREAM SWITCH] URL changed from ${normalizedCurrent} to ${normalizedNew}. Re-applying to player...`);
        setIsLoading(true);
        audioRef.current.pause();
        audioRef.current.src = activeStream;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('[STREAM SWITCH] Error reloading stream:', err);
            setIsLoading(false);
            setIsPlaying(false);
            setErrorMsg('Falha ao conectar ao novo link de transmissão.');
          });
      }
    }
  }, [activeStream, isPlaying]);
  
  // Playback control
  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      isStoppingRef.current = true;
      audioRef.current.pause();
      try {
        // Clear src to stop downloading stream in background
        audioRef.current.src = '';
      } catch (err) {
        console.warn('Silent src clear error:', err);
      }
      setIsPlaying(false);
      setIsLoading(false);
      setTimeout(() => {
        isStoppingRef.current = false;
      }, 500);
    } else {
      isStoppingRef.current = false;
      setIsLoading(true);
      setErrorMsg(null);
      try {
        audioRef.current.src = activeStream;
        audioRef.current.load();
        audioRef.current.volume = isMuted ? 0 : volume;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        setIsPlaying(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Playback error:', err instanceof Error ? err.message : String(err));
        setIsLoading(false);
        setIsPlaying(false);
        setErrorMsg('Erro de sintonia. O canal oficial pode estar inacessível devido a restrições de porta do seu navegador. Tente selecionar um canal alternativo abaixo.');
        setShowTroubleshooter(true);
      }
    }
  };

  // Switch stream channel
  const handleStreamChange = async (streamId: string) => {
    setActiveStreamId(streamId);
    setErrorMsg(null);
    const selected = STREAM_OPTIONS.find(s => s.id === streamId);
    const newUrl = selected?.url || STREAM_OPTIONS[0].url;
    
    if (isPlaying && audioRef.current) {
      setIsLoading(true);
      isStoppingRef.current = true;
      try {
        audioRef.current.pause();
        audioRef.current.src = newUrl;
        audioRef.current.load();
        isStoppingRef.current = false;
        audioRef.current.volume = isMuted ? 0 : volume;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        isStoppingRef.current = false;
        console.error('Error switching stream:', err instanceof Error ? err.message : String(err));
        setIsLoading(false);
        setIsPlaying(false);
        setErrorMsg('Erro ao mudar de canal. O fluxo selecionado pode estar indisponível na sua rede.');
        setShowTroubleshooter(true);
      }
    }
  };
  
  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val;
    }
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.volume = nextMute ? 0 : volume;
  };
  
  // Canvas soundwave visualizer animation (procedural beat animation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 120;
    
    let animationId: number;
    let phase = 0;
    
    const barsCount = 45;
    const barWidth = (canvas.width / barsCount) - 3;
    const barHeights = Array(barsCount).fill(5);
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      phase += 0.08;
      
      for (let i = 0; i < barsCount; i++) {
        let targetHeight = 6;
        
        if (isPlaying && !isLoading) {
          // Compute procedural wave form using overlapping sine waves
          const wave1 = Math.sin(i * 0.15 + phase) * 35;
          const wave2 = Math.cos(i * 0.35 - phase * 1.5) * 15;
          const wave3 = Math.sin(i * 0.05 + phase * 2.5) * 10;
          const volumeFactor = volume * 1.2;
          
          targetHeight = Math.max(6, Math.abs(wave1 + wave2 + wave3) * volumeFactor + (Math.random() * 8));
          if (targetHeight > canvas.height - 10) {
            targetHeight = canvas.height - 10;
          }
        } else if (isLoading) {
          // Slow breathing animation while buffering
          targetHeight = 12 + Math.sin(i * 0.4 + phase * 1.5) * 8;
        } else {
          // Flat default height with slight ambient motion
          targetHeight = 4 + Math.sin(i * 0.2 + phase * 0.2) * 1.5;
        }
        
        // Smooth transition
        barHeights[i] += (targetHeight - barHeights[i]) * 0.18;
        
        const x = i * (barWidth + 3);
        const y = canvas.height / 2 - barHeights[i] / 2;
        
        // Color gradient mirroring TRS theme (deep gold to warm red)
        const grad = ctx.createLinearGradient(x, y, x, y + barHeights[i]);
        grad.addColorStop(0, '#f59e0b'); // amber-500
        grad.addColorStop(0.5, '#ef4444'); // red-500
        grad.addColorStop(1, '#be123c'); // rose-700
        
        ctx.fillStyle = grad;
        
        // Rounded bar representation
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeights[i], 3);
        } else {
          ctx.rect(x, y, barWidth, barHeights[i]);
        }
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    
    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
      }
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, isLoading, volume]);

  return (
    <>
      {/* PERSISTENT HTML5 AUDIO ELEMENT - Kept alive across layout changes */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onError={(e) => {
          if (isStoppingRef.current) {
            return;
          }
          if (!isPlaying && !isLoading) {
            return;
          }
          
          const mediaError = audioRef.current?.error;
          console.error("Audio element error:", {
            code: mediaError?.code,
            message: mediaError?.message,
            type: e.type
          });
          
          if (activeStreamId === 'trs-official' || activeStreamId === 'trs-http-fallback') {
            console.log("TRS Main Stream failed. Automatically falling back to secure alternative stream...");
            setActiveStreamId('secure-backup');
            setErrorMsg('Sinal principal offline. Conectando automaticamente ao Servidor Seguro Alternativo...');
            
            if (audioRef.current) {
              const backupStream = STREAM_OPTIONS.find(s => s.id === 'secure-backup')?.url || STREAM_OPTIONS[2].url;
              setTimeout(async () => {
                if (audioRef.current && (isPlaying || isLoading)) {
                  try {
                    audioRef.current.src = backupStream;
                    audioRef.current.load();
                    audioRef.current.volume = isMuted ? 0 : volume;
                    const playPromise = audioRef.current.play();
                    if (playPromise !== undefined) {
                      await playPromise;
                    }
                    setIsPlaying(true);
                    setIsLoading(false);
                  } catch (retryErr) {
                    console.error("Fallback stream retry failed:", retryErr);
                    setIsLoading(false);
                    setIsPlaying(false);
                    setErrorMsg('Sinal de rádio temporariamente indisponível.');
                  }
                }
              }, 1000);
            }
          } else {
            setIsLoading(false);
            setIsPlaying(false);
            setErrorMsg('O sinal selecionado falhou. Verifique a sua ligação ou tente outro canal de transmissão.');
          }
        }}
      />

      {layout === 'mini' ? (
        <div id="radio-player-mini-bar" className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/80 px-4 py-3 shadow-2xl backdrop-blur-md animate-slideUp">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Album cover / spinning vinyl */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`relative w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 ${isPlaying && !isLoading ? 'animate-spin [animation-duration:8s]' : ''}`}>
                <TRSLogo className="w-full h-full p-0.5" />
                {isPlaying && !isLoading && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-red-500">No Ar</span>
                  {isPlaying && !isLoading && (
                    <div className="flex items-center gap-0.5 h-3 px-1">
                      <span className="w-0.5 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                      <span className="w-0.5 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.8s' }} />
                      <span className="w-0.5 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '0.5s' }} />
                    </div>
                  )}
                </div>
                <h4 className="text-white font-extrabold text-xs sm:text-sm truncate leading-tight">
                  {shows.currentShow?.title || 'Programação Automática'}
                </h4>
                <p className="text-slate-400 text-[9px] sm:text-[10px] truncate leading-tight mt-0.5">
                  Apresentação: {shows.currentShow?.hosts?.join(', ') || 'Sem locutor'}
                </p>
              </div>
            </div>

            {/* Center: Play Controls */}
            <div className="flex items-center gap-3">
              <button
                id="btn-mini-play"
                onClick={togglePlay}
                disabled={isLoading}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-red-600 text-white flex items-center justify-center shadow-lg hover:scale-115 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0 border border-amber-400/20"
                title={isPlaying ? 'Pausar Emissão' : 'Sintonizar Emissão'}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white translate-x-0.5" />
                )}
              </button>
              
              <span className="hidden lg:inline text-[10px] font-black tracking-widest text-amber-500 uppercase">
                {isPlaying ? 'EMISSÃO SINTONIZADA • TRS ONLINE' : 'CLIQUE PARA OUVIR'}
              </span>
            </div>

            {/* Right: Volume & Advanced Stream switch */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Volume bar */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-850">
                <button
                  onClick={toggleMute}
                  className="text-slate-400 hover:text-white transition-colors"
                  title={isMuted ? 'Ativar som' : 'Silenciar'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-500" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 accent-amber-500 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Quick backup stream switch button */}
              <button
                onClick={() => {
                  const targetId = activeStreamId === 'trs-official' ? 'secure-backup' : 'trs-official';
                  handleStreamChange(targetId);
                }}
                className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-amber-500/40 bg-slate-900 hover:text-amber-500 transition-all text-slate-400 cursor-pointer"
                title="Trocar entre canais de transmissão"
              >
                {activeStreamId === 'secure-backup' ? 'Servidor Seguro' : 'Canal Principal'}
              </button>
            </div>
          </div>

          {/* Error notification bar inside mini-player */}
          {errorMsg && (
            <div className="absolute bottom-16 left-4 right-4 bg-red-950/95 border border-red-800 text-red-200 text-[10px] px-3 py-2 rounded-xl flex items-center justify-between shadow-2xl z-30 animate-bounce">
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                {errorMsg}
              </span>
              <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white font-bold ml-2 shrink-0">Fechar</button>
            </div>
          )}
        </div>
      ) : (
        <div id="radio-player-container" className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Decorative top-right colored ambient blur */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/10 via-red-500/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 z-10 relative">
            
            {/* Animated Vinyl/Logo Deck */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-red-600 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />
              <div className={`relative w-44 h-44 rounded-full bg-slate-950 flex items-center justify-center border-4 border-slate-800 shadow-xl overflow-hidden ${isPlaying && !isLoading ? 'animate-spin [animation-duration:12s]' : ''}`}>
                
                {/* The Official Gold Medallion Logo, beautifully rotating */}
                <TRSLogo className="w-full h-full p-0.5" />
                
                {/* Pulsing play/status overlay */}
                {isPlaying && !isLoading && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
            </div>
            
            {/* Main controls & visualizer layout */}
            <div className="w-full flex-1 flex flex-col justify-between min-h-[176px]">
              <div>
                {/* Show Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-red-950 text-red-400 border border-red-900/40">
                    <span className={`w-2 h-2 rounded-full bg-red-500 ${isPlaying && !isLoading ? 'animate-pulse' : ''}`} />
                    {isPlaying ? (isLoading ? 'Ligando...' : 'No Ar') : 'Sintonizar'}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{angolaTimeStr || 'A carregar hora...'}</span>
                  </div>
                </div>
                
                {/* Currently Playing Show Name */}
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm flex items-center gap-2">
                  {shows.currentShow?.title}
                </h1>
                
                {/* Show Host & Slogan */}
                <p className="text-slate-300 text-sm mt-1 flex items-center gap-1.5">
                  <span className="text-amber-500 font-medium">Apresentação:</span>{' '}
                  {shows.currentShow?.hosts?.join(', ') || 'Programação Automática'}
                  <span className="text-slate-500 mx-2">•</span>
                  <span className="text-slate-400 italic">"{shows.currentShow?.description}"</span>
                </p>
              </div>
              
              {/* Animated Waveform Visualizer */}
              <div className="w-full my-4 bg-slate-950/60 rounded-xl px-2 py-1.5 border border-slate-800/40 relative">
                <canvas ref={canvasRef} className="w-full block" />
                
                {/* Subtle branding layer in canvas */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10">
                  <span className="font-mono text-sm tracking-[0.3em] uppercase text-white font-black">TRSONLINE</span>
                </div>
              </div>
              
              {/* Interactive controls bottom row */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Play Button Wrapper with extreme highlight */}
                  <div className="relative flex items-center gap-4">
                    <div className="relative">
                      {/* Glowing dynamic background rings when not playing */}
                      {!isPlaying && (
                        <>
                          <span className="absolute -inset-2.5 rounded-full bg-amber-500/40 blur animate-ping [animation-duration:2s]" />
                          <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-500 to-red-600 blur opacity-90 animate-pulse" />
                        </>
                      )}
                      <button
                        id="btn-toggle-play"
                        onClick={togglePlay}
                        disabled={isLoading}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 text-white flex items-center justify-center shadow-2xl hover:shadow-amber-500/50 hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-50 cursor-pointer border-2 border-amber-300/40 z-10`}
                        title={isPlaying ? 'Pausar Rádio' : 'Tocar Rádio'}
                      >
                        {isLoading ? (
                          <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : isPlaying ? (
                          <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
                        ) : (
                          <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-1" />
                        )}
                      </button>
                    </div>
                    
                    {/* Highlight Label and URL info */}
                    <div className="flex flex-col justify-center">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isPlaying ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}`}>
                        {isPlaying ? 'A Emitir Em Direto' : 'Rádio Desconectada'}
                      </span>
                      <span className="text-white font-extrabold text-sm sm:text-lg leading-tight uppercase tracking-tight">
                        {isPlaying ? 'TOCANDO AGORA' : 'CLIQUE PARA OUVIR AGORA!'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-full border border-slate-700/30">
                    <button
                      id="btn-toggle-mute"
                      onClick={toggleMute}
                      className="text-slate-400 hover:text-white transition-colors"
                      title={isMuted ? 'Ativar som' : 'Silenciar'}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-500" />}
                    </button>
                    <input
                      id="volume-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-24 accent-amber-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Advanced Settings & Troubleshooter button */}
                  <button
                    id="btn-toggle-troubleshooter"
                    onClick={() => setShowTroubleshooter(!showTroubleshooter)}
                    className={`p-2.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      showTroubleshooter 
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/15' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                    }`}
                    title="Configurações de Transmissão / Canais Alternativos"
                  >
                    <Settings className={`w-4 h-4 ${showTroubleshooter ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                {/* Show up next info */}
                {shows.nextShow && (
                  <div className="flex items-center gap-2 bg-slate-800/20 px-4 py-2 rounded-2xl border border-slate-800/80 max-w-full sm:max-w-xs text-xs">
                    <Radio className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                    <div className="truncate">
                      <span className="text-slate-400 font-medium">A seguir às {shows.nextShow.timeStart}:</span>
                      <p className="text-white font-bold truncate">{shows.nextShow.title}</p>
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </div>

          {/* Troubleshooter & Stream Selection Collapsible Panel */}
          {showTroubleshooter && (
            <div id="player-troubleshooter" className="mt-6 pt-6 border-t border-slate-800/80 space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-amber-500" />
                    Sintonizador & Opções de Conexão
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Se estiver a ter problemas de carregamento no seu navegador, selecione um canal alternativo abaixo.
                  </p>
                </div>
                
                <button
                  id="btn-hide-troubleshooter"
                  onClick={() => setShowTroubleshooter(false)}
                  className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Fechar Definições
                </button>
              </div>

              {/* Stream Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STREAM_OPTIONS.map((option) => {
                  const isActive = option.id === activeStreamId;
                  return (
                    <button
                      key={option.id}
                      id={`btn-select-stream-${option.id}`}
                      onClick={() => handleStreamChange(option.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1 w-full text-xs cursor-pointer ${
                        isActive 
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/5' 
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full mb-1">
                        <span className="font-bold flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`} />
                          {option.name}
                        </span>
                        {option.isOfficial ? (
                          <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 font-bold">
                            Oficial
                          </span>
                        ) : (
                          <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 font-bold">
                            Backup
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                        {option.note}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Helpful troubleshooting notes */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  Porquê que a rádio não toca automaticamente?
                </h4>
                
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-2 leading-relaxed">
                  <li>
                    <strong className="text-slate-300">Porta Bloqueada:</strong> O servidor de áudio principal utiliza a porta personalizada <code className="px-1 py-0.5 bg-slate-900 rounded font-mono text-amber-500 text-[10px]">17308</code>. Redes públicas, corporativas ou escolares costumam bloquear estes portos. Recomendamos usar o <strong className="text-amber-500">Servidor Seguro Alternativo</strong> (Opera no porto padrão 443 com SSL completo).
                  </li>
                  <li>
                    <strong className="text-slate-300">Interação Obrigatória:</strong> A maioria dos navegadores (como Chrome, Safari e Firefox) impede a reprodução automática de áudio (autoplay) sem que o utilizador clique primeiro no ecrã.
                  </li>
                </ul>

                <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Estado da Emissão: <span className="font-bold text-emerald-400">ONLINE</span>
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Error toaster banner inside player */}
          {errorMsg && (
            <div className="absolute bottom-4 left-6 right-6 bg-red-950/95 border border-red-700 text-red-200 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-2xl animate-bounce z-30">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                {errorMsg}
              </span>
              <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white font-bold ml-2">Fechar</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
