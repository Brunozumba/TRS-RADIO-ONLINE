import React, { useState, useEffect } from 'react';
import { ADVERTISING_DATA, ABOUT_TEXTS } from '../data';
import { CheckCircle, Send, Users, Sparkles, Building2, Phone, Mail, Award, ExternalLink } from 'lucide-react';
import { PartnershipInquiry } from '../types';
import { TRS_Database_Service, Sponsor } from '../services/db';

export default function Partnerships() {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interestType, setInterestType] = useState('Spots publicitários');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sponsorsList, setSponsorsList] = useState<Sponsor[]>([]);
  const [config, setConfig] = useState(() => TRS_Database_Service.getDatabase().config);

  useEffect(() => {
    const fetchSponsors = async () => {
      setConfig(TRS_Database_Service.getDatabase().config);
      try {
        const db = await TRS_Database_Service.getDatabase();
        if (db && db.sponsors) {
          const levelPriority = { Premium: 4, Gold: 3, Silver: 2, Bronze: 1 };
          const activeSponsors = db.sponsors
            .filter(s => s.status === 'Ativo')
            .sort((a, b) => {
              const priorityA = levelPriority[a.contributionLevel] || 0;
              const priorityB = levelPriority[b.contributionLevel] || 0;
              if (priorityB !== priorityA) {
                return priorityB - priorityA;
              }
              return a.name.localeCompare(b.name);
            });
          setSponsorsList(activeSponsors);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSponsors();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !contactName || !email || !phone || !message) return;

    setLoading(true);

    // Simulate server post
    setTimeout(() => {
      const newInquiry: PartnershipInquiry = {
        id: 'inq_' + Date.now(),
        company,
        contactName,
        email,
        phone,
        interestType,
        message,
        timestamp: new Date().toLocaleString('pt-PT')
      };

      // Save to local storage for realistic state simulation
      const saved = localStorage.getItem('trs_partnership_inquiries');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newInquiry);
      localStorage.setItem('trs_partnership_inquiries', JSON.stringify(list));

      // Also insert into centralized database messages table!
      try {
        const dbMsg = {
          id: 'msg-' + Date.now(),
          senderName: contactName,
          senderEmail: email,
          senderPhone: phone,
          subject: `🤝 Parceria: ${company} (${interestType})`,
          message: `Inquérito de Parceria / Publicidade:\n\nEmpresa: ${company}\nTipo de Interesse: ${interestType}\nMensagem:\n"${message}"`,
          timestamp: new Date().toISOString(),
          isRead: false,
          replied: false,
          notes: `Proposta de parceria submetida via formulário de publicidade.`
        };
        TRS_Database_Service.insert('messages', dbMsg);
      } catch (err) {
        console.error('Error inserting partnership message:', err);
      }

      setLoading(false);
      setSubmitted(true);

      // Reset form fields
      setCompany('');
      setContactName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 1200);
  };

  return (
    <div id="partnerships-section" className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl">
      {/* Title */}
      <div className="border-b border-slate-800 pb-6 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-950 text-amber-400 border border-amber-900/40 mb-3">
          <Building2 className="w-3.5 h-3.5" />
          Publicidade & Parcerias
        </span>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Cresça Connosco na TRS
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-3xl leading-relaxed">
          {ADVERTISING_DATA.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Side: Offers & Partners Info */}
        <div className="space-y-8">
          
          {/* What We Offer */}
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              O Que Oferecemos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ADVERTISING_DATA.offers.map((offer, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl hover:border-slate-700/80 transition-colors">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-xs leading-relaxed font-medium">{offer}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Who We Look For */}
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-amber-500" />
              Procuramos Parceiros
            </h3>
            <div className="flex flex-wrap gap-2">
              {ADVERTISING_DATA.partnerships.map((partner, idx) => (
                <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium px-3.5 py-2 rounded-xl hover:border-amber-500/30 transition-colors">
                  • {partner}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Contacts Block */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Contacto Direto para Negócios</p>
              <p className="text-white text-lg font-black mt-1">{config.phone || ABOUT_TEXTS.phone}</p>
              <p className="text-slate-500 text-xs mt-1">E-mail: {config.email || ABOUT_TEXTS.email}</p>
            </div>
            <a 
              href={config.whatsappUrl || ABOUT_TEXTS.whatsappUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-green-950/20 transition-all cursor-pointer"
            >
              Falar Comercial
            </a>
          </div>

        </div>

        {/* Right Side: Contact Form */}
        <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl relative">
          
          {submitted ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 border border-green-500/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Proposta Enviada com Sucesso!</h4>
              <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
                Agradecemos o seu interesse na TRS Rádio Online. O seu pedido foi registado e a nossa equipa comercial entrará em contacto dentro das próximas 24 horas.
              </p>
              <button
                id="btn-new-inquiry"
                onClick={() => setSubmitted(false)}
                className="mt-6 px-5 py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                Enviar nova proposta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Formulário de Candidatura/Publicidade
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    Nome da Empresa / Projeto *
                  </label>
                  <input
                    id="input-company"
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Empresa Lda."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    Nome do Contacto *
                  </label>
                  <input
                    id="input-contact"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    E-mail de Contacto *
                  </label>
                  <input
                    id="input-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="comercial@empresa.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    Telemóvel / WhatsApp *
                  </label>
                  <input
                    id="input-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+244 9..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  Tipo de Interesse *
                </label>
                <select
                  id="select-interest"
                  value={interestType}
                  onChange={(e) => setInterestType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="Spots publicitários">Spots publicitários diários</option>
                  <option value="Divulgação de eventos">Divulgação de Eventos</option>
                  <option value="Entrevistas / Reportagens">Entrevistas e reportagens especiais</option>
                  <option value="Redes Sociais">Publicidade nas Redes Sociais</option>
                  <option value="Parceria de Conteúdos">Parceria de intercâmbio de conteúdos</option>
                  <option value="Outro">Outro tipo de parceria</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  Proposta / Mensagem *
                </label>
                <textarea
                  id="textarea-proposal"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva brevemente o seu negócio e qual a sua proposta de divulgação ou parceria comercial..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 resize-none"
                />
              </div>

              <button
                id="btn-submit-proposal"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    A enviar...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Enviar Proposta Comercial
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

      {/* ALL SPONSORS ORDERED IN A SINGLE VISUALLY STUNNING SPACE */}
      {sponsorsList.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-800/80 space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Award className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              Parceiros de Excelência
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Marcas que Apoiam a Música Sem Fronteiras
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
              Agradecemos aos nossos patrocinadores pelo apoio contínuo ao desenvolvimento da cultura e comunicação digital angolana.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sponsorsList.map((sponsor) => {
              const badgeColors = {
                Premium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                Gold: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                Silver: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
                Bronze: 'bg-amber-900/10 text-amber-700 border-amber-900/20'
              };
              
              return (
                <div 
                  key={sponsor.id} 
                  id={`sponsor-pub-card-${sponsor.id}`}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/30 rounded-2xl p-4 flex flex-col items-center justify-between gap-3 text-center transition-all group hover:scale-[1.02] duration-300 relative overflow-hidden"
                >
                  <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${badgeColors[sponsor.contributionLevel] || 'bg-slate-800 text-slate-300'}`}>
                    {sponsor.contributionLevel}
                  </span>

                  <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center p-2 mt-2 group-hover:bg-white/10 transition-colors">
                    <img 
                      src={sponsor.logo} 
                      alt={sponsor.name} 
                      className="max-w-full max-h-full object-contain filter group-hover:brightness-110 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1 w-full">
                    <h4 className="text-white text-xs font-bold truncate px-1">{sponsor.name}</h4>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">Patrocinador {sponsor.contributionLevel}</p>
                  </div>

                  <a
                    id={`btn-sponsor-visit-${sponsor.id}`}
                    href={sponsor.website}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 bg-slate-900 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-800 hover:border-amber-500 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Visitar Site</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
