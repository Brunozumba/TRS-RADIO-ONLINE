import React, { useState } from 'react';
import { 
  Megaphone, Users, Plus, Edit, Trash2, ShieldAlert, Eye, MousePointer, 
  Settings, Search, Calendar, DollarSign, Tag, ExternalLink, RefreshCw, Image
} from 'lucide-react';
import { TRS_Database, TRS_Database_Service, Sponsor, AdCampaign } from '../../services/db';

interface AdminAdManagerProps {
  db: TRS_Database;
  employeeEmail: string;
  hasPermission: (module: string, action: 'view' | 'manage') => boolean;
  onRefresh: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminAdManager({ db, employeeEmail, hasPermission, onRefresh, showToast }: AdminAdManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'sponsors'>('campaigns');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [sponsorSearch, setSponsorSearch] = useState('');

  // Campaign Form states
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    clientId: '',
    startDate: '',
    endDate: '',
    priority: 'Média' as AdCampaign['priority'],
    maxViews: 10000,
    maxClicks: 500,
    position: 'Banner Home' as AdCampaign['position'],
    status: 'Ativo' as AdCampaign['status'],
    audioUrl: '',
    image: '',
    classification: 'Anúncio' as 'Anúncio' | 'Publicidade' | 'Patrocinador'
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sponsor Form states
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    logo: '',
    website: '',
    status: 'Ativo' as Sponsor['status'],
    contactPerson: '',
    contactEmail: '',
    contributionLevel: 'Gold' as Sponsor['contributionLevel'],
    classification: 'Patrocinador' as 'Anúncio' | 'Publicidade' | 'Patrocinador'
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const canManage = hasPermission('advertising', 'manage');

  // ==========================================
  // CAMPAIGN CRUD HANDLERS
  // ==========================================
  const handleOpenCampaignModal = (campaign: AdCampaign | null) => {
    if (!canManage) return;

    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        title: campaign.title,
        clientId: campaign.clientId,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        priority: campaign.priority,
        maxViews: campaign.maxViews,
        clicksCount: campaign.clicksCount, // preserve click states if any
        maxClicks: campaign.maxClicks,
        position: campaign.position,
        status: campaign.status,
        audioUrl: campaign.audioUrl || '',
        image: campaign.image || '',
        classification: campaign.classification || 'Anúncio'
      } as any);
    } else {
      setEditingCampaign(null);
      setCampaignForm({
        title: '',
        clientId: db.banners[0]?.id || db.sponsors[0]?.id || 'client-default',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // 30 days
        priority: 'Média',
        maxViews: 20000,
        maxClicks: 1000,
        position: 'Banner Home',
        status: 'Ativo',
        audioUrl: '',
        image: '',
        classification: 'Anúncio'
      });
    }
    setCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.title || !campaignForm.startDate || !campaignForm.endDate) return;

    if (editingCampaign) {
      const updated: Partial<AdCampaign> = {
        title: campaignForm.title,
        clientId: campaignForm.clientId,
        startDate: campaignForm.startDate,
        endDate: campaignForm.endDate,
        priority: campaignForm.priority,
        maxViews: Number(campaignForm.maxViews),
        maxClicks: Number(campaignForm.maxClicks),
        position: campaignForm.position,
        status: campaignForm.status,
        audioUrl: campaignForm.audioUrl || undefined,
        image: campaignForm.image || undefined,
        classification: campaignForm.classification
      };
      await TRS_Database_Service.update('campaigns', editingCampaign.id, updated, employeeEmail);
    } else {
      const created: AdCampaign = {
        id: `camp-${Date.now()}`,
        title: campaignForm.title,
        clientId: campaignForm.clientId,
        startDate: campaignForm.startDate,
        endDate: campaignForm.endDate,
        priority: campaignForm.priority,
        viewsCount: 0,
        maxViews: Number(campaignForm.maxViews),
        clicksCount: 0,
        maxClicks: Number(campaignForm.maxClicks),
        position: campaignForm.position,
        status: campaignForm.status,
        audioUrl: campaignForm.audioUrl || undefined,
        image: campaignForm.image || undefined,
        classification: campaignForm.classification
      };
      await TRS_Database_Service.insert('campaigns', created, employeeEmail);
    }

    setCampaignModalOpen(false);
    onRefresh();
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!canManage) return;
    setConfirmModal({
      isOpen: true,
      title: 'Remover Campanha',
      message: 'Deseja realmente remover esta campanha publicitária? Isso interromperá as métricas.',
      onConfirm: async () => {
        await TRS_Database_Service.delete('campaigns', id, employeeEmail);
        onRefresh();
      }
    });
  };

  // ==========================================
  // SPONSOR CRUD HANDLERS
  // ==========================================
  const handleOpenSponsorModal = (sponsor: Sponsor | null) => {
    if (!canManage) return;

    if (sponsor) {
      setEditingSponsor(sponsor);
      setSponsorForm({
        name: sponsor.name,
        logo: sponsor.logo,
        website: sponsor.website,
        status: sponsor.status,
        contactPerson: sponsor.contactPerson,
        contactEmail: sponsor.contactEmail,
        contributionLevel: sponsor.contributionLevel,
        classification: sponsor.classification || 'Patrocinador'
      });
    } else {
      setEditingSponsor(null);
      setSponsorForm({
        name: '',
        logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&auto=format&fit=crop&q=60',
        website: '',
        status: 'Ativo',
        contactPerson: '',
        contactEmail: '',
        contributionLevel: 'Gold',
        classification: 'Patrocinador'
      });
    }
    setSponsorModalOpen(true);
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorForm.name) return;

    if (editingSponsor) {
      const updated: Partial<Sponsor> = {
        name: sponsorForm.name,
        logo: sponsorForm.logo,
        website: sponsorForm.website,
        status: sponsorForm.status,
        contactPerson: sponsorForm.contactPerson,
        contactEmail: sponsorForm.contactEmail,
        contributionLevel: sponsorForm.contributionLevel,
        classification: sponsorForm.classification
      };
      await TRS_Database_Service.update('sponsors', editingSponsor.id, updated, employeeEmail);
    } else {
      const created: Sponsor = {
        id: `spon-${Date.now()}`,
        name: sponsorForm.name,
        logo: sponsorForm.logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&auto=format&fit=crop&q=60',
        website: sponsorForm.website,
        status: sponsorForm.status,
        contactPerson: sponsorForm.contactPerson,
        contactEmail: sponsorForm.contactEmail,
        contributionLevel: sponsorForm.contributionLevel,
        classification: sponsorForm.classification
      };
      await TRS_Database_Service.insert('sponsors', created, employeeEmail);
    }

    setSponsorModalOpen(false);
    onRefresh();
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!canManage) return;
    setConfirmModal({
      isOpen: true,
      title: 'Remover Patrocinador',
      message: 'Tem a certeza que deseja remover este patrocinador do sistema?',
      onConfirm: async () => {
        await TRS_Database_Service.delete('sponsors', id, employeeEmail);
        onRefresh();
      }
    });
  };

  // Simulate traffic impressions & clicks (extremely useful tool for commercial testings)
  const handleSimulateTraffic = async () => {
    if (!canManage) return;
    for (const campaign of db.campaigns) {
      if (campaign.status === 'Ativo') {
        const extraViews = Math.floor(Math.random() * 45) + 5;
        const extraClicks = Math.floor(Math.random() * 3) + (extraViews > 35 ? 1 : 0);
        await TRS_Database_Service.update('campaigns', campaign.id, {
          viewsCount: Math.min(campaign.viewsCount + extraViews, campaign.maxViews),
          clicksCount: Math.min(campaign.clicksCount + extraClicks, campaign.maxClicks)
        });
      }
    }
    onRefresh();
    await TRS_Database_Service.addLog(employeeEmail, 'Simulação comercial efetuada', 'ADVERTISING', 'Simulou-se cliques e visualizações de banners para testes estatísticos.');
  };

  // Filters
  const filteredCampaigns = db.campaigns.filter(c => 
    c.title.toLowerCase().includes(campaignSearch.toLowerCase()) ||
    c.position.toLowerCase().includes(campaignSearch.toLowerCase())
  );

  const filteredSponsors = db.sponsors.filter(s => 
    s.name.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(sponsorSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Tab selection */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`px-5 py-3 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'campaigns' 
              ? 'border-amber-500 text-white bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Campanhas Banners ({db.campaigns.length})
        </button>
        <button
          onClick={() => setActiveSubTab('sponsors')}
          className={`px-5 py-3 text-xs uppercase font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'sponsors' 
              ? 'border-amber-500 text-white bg-amber-500/5' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Patrocinadores ({db.sponsors.length})
        </button>
      </div>

      {/* RBAC Warnings */}
      {!canManage && (
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>O seu cargo atual apenas lhe confere permissões de <strong>Visualização</strong> neste módulo comercial.</span>
        </div>
      )}

      {/* ==========================================
          CAMPAIGNS TAB
          ========================================== */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                placeholder="Pesquisar por título, posição..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              {canManage && (
                <>
                  <button
                    onClick={handleSimulateTraffic}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Incrementa impressões e cliques aleatoriamente para verificar o funcionamento do dashboard comercial"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                    Gerar Tráfego Comercial
                  </button>
                  <button
                    onClick={() => handleOpenCampaignModal(null)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Banner
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-x-auto shadow-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-850">
                <tr>
                  <th className="p-4 font-bold">Campanha / Posição</th>
                  <th className="p-4 font-bold">Impressões (Visualizações)</th>
                  <th className="p-4 font-bold">Cliques / CTR %</th>
                  <th className="p-4 font-bold">Vigência</th>
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredCampaigns.map((item) => {
                  const ctr = item.viewsCount > 0 ? ((item.clicksCount / item.viewsCount) * 100).toFixed(1) : '0.0';
                  const isUnlimitedViews = item.maxViews >= 999999999;
                  const isUnlimitedClicks = item.maxClicks >= 999999999;
                  const viewsPercent = isUnlimitedViews ? 100 : Math.min((item.viewsCount / item.maxViews) * 100, 100);
                  const clicksPercent = isUnlimitedClicks ? 100 : Math.min((item.clicksCount / item.maxClicks) * 100, 100);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-extrabold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 text-amber-500 rounded font-mono font-bold text-[8px]">
                              {item.position}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              item.classification === 'Patrocinador' ? 'bg-amber-950/60 text-amber-400 border border-amber-500/10' :
                              item.classification === 'Publicidade' ? 'bg-blue-950/60 text-blue-400 border border-blue-500/10' :
                              'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10'
                            }`}>
                              {item.classification || 'Anúncio'}
                            </span>
                            Prioridade: <strong className="text-slate-400 font-bold">{item.priority}</strong>
                          </p>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium">
                        <div className="space-y-1 w-32 sm:w-40">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-extrabold text-slate-300">{item.viewsCount}</span>
                            <span className="text-slate-500">/ {isUnlimitedViews ? 'Sem limite' : item.maxViews}</span>
                          </div>
                          <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isUnlimitedViews ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500'}`} style={{ width: `${viewsPercent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium">
                        <div className="space-y-1 w-32 sm:w-40">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-extrabold text-slate-300">{item.clicksCount} <span className="text-[9px] text-emerald-400">({ctr}% CTR)</span></span>
                            <span className="text-slate-500">/ {isUnlimitedClicks ? 'Sem limite' : item.maxClicks}</span>
                          </div>
                          <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isUnlimitedClicks ? 'bg-teal-500 animate-pulse' : 'bg-emerald-500'}`} style={{ width: `${clicksPercent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <p className="font-bold">{item.startDate}</p>
                        <p className="text-[10px] text-slate-500">Até {item.endDate}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          item.status === 'Ativo' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManage ? (
                            <>
                              <button
                                onClick={() => handleOpenCampaignModal(item)}
                                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCampaign(item.id)}
                                className="p-1.5 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-600 uppercase font-bold font-mono">Bloqueado</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCampaigns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhum banner ou anúncio registado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          SPONSORS TAB
          ========================================== */}
      {activeSubTab === 'sponsors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={sponsorSearch}
                onChange={(e) => setSponsorSearch(e.target.value)}
                placeholder="Pesquisar por patrocinador, contacto..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            
            {canManage && (
              <button
                onClick={() => handleOpenSponsorModal(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Adicionar Patrocinador
              </button>
            )}
          </div>

          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-x-auto shadow-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-850">
                <tr>
                  <th className="p-4 font-bold">Patrocinador</th>
                  <th className="p-4 font-bold">Nível Contribuição</th>
                  <th className="p-4 font-bold">Pessoa Contrato</th>
                  <th className="p-4 font-bold">E-mail Comercial</th>
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredSponsors.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.logo} 
                          alt="" 
                          className="w-10 h-10 object-contain bg-slate-950 rounded-xl border border-slate-800 shrink-0 p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&auto=format&fit=crop&q=60';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-white">{item.name}</p>
                            <span className={`px-1.5 py-0.2 rounded text-[7px] font-black uppercase tracking-wider ${
                              item.classification === 'Anúncio' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10' :
                              item.classification === 'Publicidade' ? 'bg-blue-950/60 text-blue-400 border border-blue-500/10' :
                              'bg-amber-950/60 text-amber-400 border border-amber-500/10'
                            }`}>
                              {item.classification || 'Patrocinador'}
                            </span>
                          </div>
                          {item.website && (
                            <a 
                              href={item.website} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[10px] text-slate-500 hover:text-amber-500 flex items-center gap-1.5 mt-0.5"
                            >
                              {item.website.replace('https://', '')}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        item.contributionLevel === 'Premium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        item.contributionLevel === 'Gold' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {item.contributionLevel}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{item.contactPerson}</td>
                    <td className="p-4 text-slate-400 font-mono">{item.contactEmail}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        item.status === 'Ativo' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/10' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManage ? (
                          <>
                            <button
                              onClick={() => handleOpenSponsorModal(item)}
                              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSponsor(item.id)}
                              className="p-1.5 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-600 uppercase font-bold font-mono">Bloqueado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredSponsors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhum patrocinador oficial sintonizado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS overlay forms
          ========================================== */}
      
      {/* 1. CAMPAIGN MODAL */}
      {campaignModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl my-8 space-y-5">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Megaphone className="w-4 h-4 text-amber-500" />
              {editingCampaign ? 'Editar Campanha de Banner' : 'Lançar Nova Campanha de Banner'}
            </h3>

            <form onSubmit={handleSaveCampaign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Título Comercial da Campanha</label>
                <input
                  type="text"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  placeholder="Kero frescos - Fim de Semana Especial..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-amber-500">Classificação Comercial</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {(['Anúncio', 'Publicidade', 'Patrocinador'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCampaignForm(prev => ({ ...prev, classification: type }))}
                      className={`py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        (campaignForm.classification || 'Anúncio') === type
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Posição do Banner no Site</label>
                  <select
                    value={campaignForm.position}
                    onChange={(e) => setCampaignForm({ ...campaignForm, position: e.target.value as AdCampaign['position'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Banner Home">Banner Home (Principal)</option>
                    <option value="Banner Player">Banner Player (Estreito)</option>
                    <option value="Banner Lateral">Banner Lateral (Bento Grid)</option>
                    <option value="Banner Notícias">Banner Notícias (Fim do Artigo)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Prioridade</label>
                  <select
                    value={campaignForm.priority}
                    onChange={(e) => setCampaignForm({ ...campaignForm, priority: e.target.value as AdCampaign['priority'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Baixa">Baixa (Menor rotação)</option>
                    <option value="Média">Média (Padrão)</option>
                    <option value="Alta">Alta (Destaque absoluto)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400">Limite Visualizações</label>
                    <label className="flex items-center gap-1 text-[10px] font-bold text-amber-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={campaignForm.maxViews >= 999999999}
                        onChange={(e) => setCampaignForm({
                          ...campaignForm,
                          maxViews: e.target.checked ? 999999999 : 10000
                        })}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0"
                      />
                      Sem limite
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={campaignForm.maxViews >= 999999999}
                    value={campaignForm.maxViews >= 999999999 ? '' : campaignForm.maxViews}
                    onChange={(e) => setCampaignForm({ ...campaignForm, maxViews: Number(e.target.value) })}
                    placeholder="Sem limite"
                    className="w-full px-3 py-2 bg-slate-950 disabled:bg-slate-900/40 disabled:text-slate-500 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-400">Limite Cliques</label>
                    <label className="flex items-center gap-1 text-[10px] font-bold text-amber-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={campaignForm.maxClicks >= 999999999}
                        onChange={(e) => setCampaignForm({
                          ...campaignForm,
                          maxClicks: e.target.checked ? 999999999 : 500
                        })}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0 focus:ring-offset-0"
                      />
                      Sem limite
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={campaignForm.maxClicks >= 999999999}
                    value={campaignForm.maxClicks >= 999999999 ? '' : campaignForm.maxClicks}
                    onChange={(e) => setCampaignForm({ ...campaignForm, maxClicks: Number(e.target.value) })}
                    placeholder="Sem limite"
                    className="w-full px-3 py-2 bg-slate-950 disabled:bg-slate-900/40 disabled:text-slate-500 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-center"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Imagem de Banner Comercial (Opcional)</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950 rounded-2xl p-4 transition-all relative group">
                  {campaignForm.image ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden">
                      <img src={campaignForm.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase rounded-lg cursor-pointer hover:bg-amber-400 transition-all">
                          Alterar Imagem
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (base64) => setCampaignForm({ ...campaignForm, image: base64 }))}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setCampaignForm({ ...campaignForm, image: '' })}
                          className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-extrabold uppercase rounded-lg hover:bg-red-500 transition-all cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full py-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                      <div className="p-2 bg-slate-900 rounded-full text-slate-400 group-hover:text-amber-500 transition-colors">
                        <Image className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-300">Carregar Imagem de Banner</span>
                      <span className="text-[9px] text-slate-500">Clique para selecionar imagem em formato horizontal</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (base64) => setCampaignForm({ ...campaignForm, image: base64 }))}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Data Início</label>
                  <input
                    type="date"
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Data Término</label>
                  <input
                    type="date"
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-center"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">URL de Áudio Spot (Opcional - Autoplay)</label>
                <input
                  type="text"
                  value={campaignForm.audioUrl}
                  onChange={(e) => setCampaignForm({ ...campaignForm, audioUrl: e.target.value })}
                  placeholder="https://exemplo.com/spot-comercial.mp3"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Estado da Campanha</label>
                <select
                  value={campaignForm.status}
                  onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value as AdCampaign['status'] })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Ativo">Ativo (Em rotação)</option>
                  <option value="Pausado">Pausado (Inativo provisório)</option>
                  <option value="Expirado">Expirado (Desativado)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-md"
                >
                  Gravar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SPONSOR MODAL */}
      {sponsorModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-2xl my-8 space-y-5">
            <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users className="w-4 h-4 text-amber-500" />
              {editingSponsor ? 'Editar Patrocinador' : 'Registrar Novo Patrocinador'}
            </h3>

            <form onSubmit={handleSaveSponsor} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Nome da Empresa / Marca</label>
                <input
                  type="text"
                  value={sponsorForm.name}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                  placeholder="Unitel Angola, Banco BAI..."
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-amber-500">Classificação Comercial</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {(['Anúncio', 'Publicidade', 'Patrocinador'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSponsorForm(prev => ({ ...prev, classification: type }))}
                      className={`py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        (sponsorForm.classification || 'Patrocinador') === type
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nível Contribuição</label>
                  <select
                    value={sponsorForm.contributionLevel}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, contributionLevel: e.target.value as Sponsor['contributionLevel'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Premium">Premium (Patrocinador principal)</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze (Apoio simples)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Website Oficial</label>
                  <input
                    type="text"
                    value={sponsorForm.website}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, website: e.target.value })}
                    placeholder="https://exemplo.ao"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Logótipo do Patrocinador</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950 rounded-2xl p-4 transition-all relative group">
                  {sponsorForm.logo ? (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center p-2">
                      <img src={sponsorForm.logo} alt="Preview" className="max-w-full max-h-full object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <label className="px-2 py-1 bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase rounded cursor-pointer hover:bg-amber-400 transition-all">
                          Alterar
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (base64) => setSponsorForm({ ...sponsorForm, logo: base64 }))}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setSponsorForm({ ...sponsorForm, logo: '' })}
                          className="px-2 py-1 bg-red-600 text-white text-[9px] font-extrabold uppercase rounded hover:bg-red-500 transition-all cursor-pointer"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full py-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                      <div className="p-2 bg-slate-900 rounded-full text-slate-400 group-hover:text-amber-500 transition-colors">
                        <Image className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-300">Carregar Logótipo</span>
                      <span className="text-[9px] text-slate-500">Formato quadrado ou transparente (PNG, JPG, SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (base64) => setSponsorForm({ ...sponsorForm, logo: base64 }))}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Pessoa de Contacto</label>
                  <input
                    type="text"
                    value={sponsorForm.contactPerson}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, contactPerson: e.target.value })}
                    placeholder="Nome do Diretor de Marketing"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">E-mail Comercial</label>
                  <input
                    type="email"
                    value={sponsorForm.contactEmail}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, contactEmail: e.target.value })}
                    placeholder="comercial@marca.ao"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Estado de Contrato</label>
                <select
                  value={sponsorForm.status}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, status: e.target.value as Sponsor['status'] })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Ativo">Ativo (Aparece no rodapé/parcerias)</option>
                  <option value="Inativo">Inativo (Pausado)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800 justify-end">
                <button
                  type="button"
                  onClick={() => setSponsorModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-md"
                >
                  Salvar Patrocinador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              {confirmModal.title}
            </h3>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  await confirmModal.onConfirm();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-md shadow-red-600/10"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
