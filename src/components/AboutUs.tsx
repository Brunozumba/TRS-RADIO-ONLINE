import { useState, useEffect } from 'react';
import { ABOUT_TEXTS } from '../data';
import { TRS_Database_Service } from '../services/db';
import { Radio, Globe, Compass, Star, Heart, Award, Sparkles, MessageSquare } from 'lucide-react';
import TRSLogo from './TRSLogo';

export default function AboutUs() {
  const [config, setConfig] = useState(() => TRS_Database_Service.getDatabase().config);

  useEffect(() => {
    const updateConfig = () => {
      setConfig(TRS_Database_Service.getDatabase().config);
    };
    updateConfig();
    return TRS_Database_Service.subscribe(updateConfig);
  }, []);

  // Format the text into paragraphs for cleaner reading
  const paragraphs = ABOUT_TEXTS.whoWeAre.split('\n\n');

  return (
    <div id="about-us-section" className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-red-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-950 text-amber-400 border border-amber-900/40 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Conheça a nossa história
        </span>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Sobre a {config.radioName || 'TRS Rádio Online'}
        </h2>
        <p className="text-amber-500 font-semibold text-sm mt-1.5 flex items-center gap-2">
          <span>{ABOUT_TEXTS.subtitle}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Who We Are text */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500" />
            Quem Somos
          </h3>
          <div className="text-slate-300 text-sm leading-relaxed space-y-4">
            {paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Logo Emblem Presentation */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-6 bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50">
            <TRSLogo className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.15)]" />
            <div className="text-center sm:text-left space-y-1">
              <h4 className="text-white font-extrabold text-base tracking-tight">Símbolo de Qualidade e Identidade</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Este é o emblema oficial da <strong className="text-amber-500">{config.radioName || 'TRS RÁDIO ONLINE'}</strong>. Representa a harmonia, a modernidade e a conexão sem fronteiras que levamos diariamente aos nossos ouvintes em todos os cantos do planeta.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Mission, Vision, Slogan Bento widgets */}
        <div className="space-y-6">
          
          {/* Mission Card */}
          <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Missão
            </h4>
            <p className="text-white text-sm leading-relaxed">
              {ABOUT_TEXTS.mission}
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <Star className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Visão
            </h4>
            <p className="text-white text-sm leading-relaxed">
              {ABOUT_TEXTS.vision}
            </p>
          </div>

          {/* Slogan / Sintonize Card */}
          <div className="bg-gradient-to-r from-amber-500/10 to-red-600/10 border border-amber-500/30 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-red-600 flex items-center justify-center text-white">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-2">
              Lema e Essência
            </h4>
            <p className="text-white font-bold text-sm leading-relaxed mb-3">
              {config.slogan || ABOUT_TEXTS.slogan}
            </p>
            <p className="text-slate-400 text-xs leading-relaxed italic">
              {ABOUT_TEXTS.footerNote}
            </p>
          </div>

          {/* Direct WhatsApp Call banner */}
          <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-8 h-8 text-green-500 mb-3 animate-bounce" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Linha Direta WhatsApp</span>
            <a 
              href={config.whatsappUrl || ABOUT_TEXTS.whatsappUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-white font-extrabold text-base hover:text-green-400 transition-colors mt-1"
            >
              {config.phone || ABOUT_TEXTS.phone}
            </a>
            <span className="text-xs text-slate-400 mt-1">Ligue ou envie sua mensagem para o estúdio!</span>
          </div>

        </div>
      </div>
    </div>
  );
}
