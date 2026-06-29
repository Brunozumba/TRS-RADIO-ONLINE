import React, { useState, useEffect } from 'react';
import { INITIAL_SONG_REQUESTS } from '../data';
import { SongRequest } from '../types';
import { Music, Send, ThumbsUp, MessageSquare, Heart, Sparkles, Check } from 'lucide-react';
import { TRS_Database_Service, ContactMessage } from '../services/db';

export default function SongRequests() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [sender, setSender] = useState('');
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load from local storage or set initial data
  useEffect(() => {
    const saved = localStorage.getItem('trs_song_requests');
    if (saved) {
      setRequests(JSON.parse(saved));
    } else {
      setRequests(INITIAL_SONG_REQUESTS);
      localStorage.setItem('trs_song_requests', JSON.stringify(INITIAL_SONG_REQUESTS));
    }
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !song || !artist) return;

    const dedicationText = message || 'Mandando um abraço para todos os ouvintes da TRS!';

    const newRequest: SongRequest = {
      id: 'req_' + Date.now(),
      sender,
      song,
      artist,
      message: dedicationText,
      timestamp: 'Agora mesmo',
      likes: 0
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    localStorage.setItem('trs_song_requests', JSON.stringify(updated));

    // Also dispatch to administrative messages backend!
    try {
      const newMsg: ContactMessage = {
        id: 'msg-' + Date.now(),
        senderName: sender,
        senderEmail: 'ouvinte@trsradioonline.com',
        senderPhone: '+244 926 874 444',
        subject: `🎵 Pedido: ${song} (${artist})`,
        message: `Dedicatória do Ouvinte:\n"${dedicationText}"`,
        timestamp: new Date().toISOString(),
        isRead: false,
        replied: false
      };
      await TRS_Database_Service.insert('messages', newMsg);
    } catch (err) {
      console.error('Error inserting msg:', err);
    }

    // Reset Form
    setSender('');
    setSong('');
    setArtist('');
    setMessage('');

    // Highlight Success
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const handleLike = (id: string) => {
    const updated = requests.map(req => {
      if (req.id === id) {
        return { ...req, likes: req.likes + 1 };
      }
      return req;
    });
    setRequests(updated);
    localStorage.setItem('trs_song_requests', JSON.stringify(updated));
  };

  return (
    <div id="song-requests-section" className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl">
      <div className="border-b border-slate-800 pb-6 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-950 text-amber-400 border border-amber-900/40 mb-3">
          <Music className="w-3.5 h-3.5" />
          Interatividade no Ar
        </span>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Pedir Música & Mensagens
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Partilhe a sua voz, peça o seu som favorito e ofereça aos seus familiares e amigos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Form: Submit Request (2/5 size) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-5 rounded-2xl relative h-fit">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Faça o seu pedido
          </h3>

          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                O seu nome *
              </label>
              <input
                id="request-sender"
                type="text"
                required
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Ex: Pedro Miguel"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Nome da Música *
              </label>
              <input
                id="request-song"
                type="text"
                required
                value={song}
                onChange={(e) => setSong(e.target.value)}
                placeholder="Ex: Te Amo"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Artista / Banda *
              </label>
              <input
                id="request-artist"
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ex: Anselmo Ralph"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Mensagem / Dedicatória (Opcional)
              </label>
              <textarea
                id="request-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mande um salve para Luanda, dedique à família ou mande a sua vibração..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 resize-none"
              />
            </div>

            <button
              id="btn-submit-request"
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar ao Estúdio
            </button>
          </form>

          {showSuccess && (
            <div className="absolute inset-0 bg-slate-950/95 border border-amber-500/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-10">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-3 border border-amber-500/30">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-white font-bold text-sm">Pedido Recebido!</p>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                A sua música foi enviada para o nosso programador e locutor. Fique ligado na emissão!
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Feed of Requests (3/5 size) */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            Pedidos Recentes dos Ouvintes
          </h3>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
            {requests.map((req) => (
              <div
                key={req.id}
                id={`request-card-${req.id}`}
                className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl flex items-start gap-3 hover:border-slate-700 transition-colors"
              >
                {/* Vinyl Accent Icon */}
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-amber-500" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-white text-xs font-bold truncate">{req.sender}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{req.timestamp}</span>
                  </div>
                  
                  {/* Music description badge */}
                  <p className="text-xs bg-slate-900/60 inline-block px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-semibold mb-2">
                    🎵 <span className="text-amber-400">{req.song}</span> — <span className="text-slate-400 font-normal">{req.artist}</span>
                  </p>

                  <p className="text-slate-400 text-xs italic leading-relaxed bg-slate-950/20 p-2 rounded-lg border border-slate-800/20">
                    "{req.message}"
                  </p>
                  
                  {/* Actions (Vote / Like) */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <Heart className="w-3 h-3 text-red-500/70" />
                      Pedida por ouvinte
                    </span>

                    <button
                      id={`btn-like-${req.id}`}
                      onClick={() => handleLike(req.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-500 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Quero Ouvir ({req.likes})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
