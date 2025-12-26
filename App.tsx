
import React, { useState, useEffect } from 'react';
import { FamilyMember, SubmissionProposal, CertifiedCollaborator } from './types';
import { INITIAL_FAMILY_DATA } from './constants';
import TreeVisualizer from './components/TreeVisualizer';
import MemberDetails from './components/MemberDetails';
import AdminPanel from './components/AdminPanel';
import SubmissionForm from './components/SubmissionForm';
import SettingsOverlay from './components/SettingsOverlay';
import RelationshipTool from './components/RelationshipTool';
import GenerationView from './components/GenerationView';
import RelationshipMap from './components/RelationshipMap';
import { Search, Users, ShieldCheck, Settings, PlusCircle, GitBranch, Layers, Network, MessageCircle } from 'lucide-react';

type ViewType = 'tree' | 'admin' | 'generations' | 'relationships';

const App: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_DATA);
  const [proposals, setProposals] = useState<SubmissionProposal[]>([]);
  const [certifiedCollaborators, setCertifiedCollaborators] = useState<CertifiedCollaborator[]>([
    { id: '1', name: 'Alhaji Musa', phone: '2348012345678', certifiedAt: Date.now() }
  ]);
  const [adminWhatsApp, setAdminWhatsApp] = useState('2348000000000');
  
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [view, setView] = useState<ViewType>('tree');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [isAdminDirectEntry, setIsAdminDirectEntry] = useState(false);
  const [submissionParent, setSubmissionParent] = useState<FamilyMember | null>(null);
  
  const [showRelationshipTool, setShowRelationshipTool] = useState(false);
  const [compMemberA, setCompMemberA] = useState<FamilyMember | null>(null);

  const [settings, setSettings] = useState({
    showNicknames: true,
    highlightRoyal: true,
    showMaternalLinks: false,
    compactMode: false
  });

  const handleMemberSelect = (member: FamilyMember) => setSelectedMember(member);

  const handleStartComparison = (member: FamilyMember) => {
    setCompMemberA(member);
    setShowRelationshipTool(true);
  };

  const handleAddSubmission = (proposal: any) => {
    if (proposal.status === 'approved') {
      const newMember: FamilyMember = {
        ...proposal.data,
        id: `mem-${Date.now()}`
      };
      setMembers([...members, newMember]);
      setShowSubmissionForm(false);
      setIsAdminDirectEntry(false);
    } else {
      const newProposal: SubmissionProposal = {
        ...proposal,
        id: `prop-${Date.now()}`
      };
      setProposals([...proposals, newProposal]);
      setShowSubmissionForm(false);
      alert("Your proposal has been sent to the legacy archivists for verification.");
    }
  };

  const approveProposal = (id: string) => {
    const proposal = proposals.find(p => p.id === id);
    if (!proposal) return;
    const newMember: FamilyMember = {
      ...proposal.data,
      id: `mem-${Date.now()}`
    };
    setMembers([...members, newMember]);
    setProposals(proposals.filter(p => p.id !== id));
  };

  const rejectProposal = (id: string) => {
    setProposals(proposals.filter(p => p.id !== id));
  };

  const handleCertifyCollaborator = (collab: Omit<CertifiedCollaborator, 'id' | 'certifiedAt'>) => {
    const newCollab: CertifiedCollaborator = {
      ...collab,
      id: `collab-${Date.now()}`,
      certifiedAt: Date.now()
    };
    setCertifiedCollaborators([...certifiedCollaborators, newCollab]);
  };

  const handleRevokeCertification = (id: string) => {
    setCertifiedCollaborators(certifiedCollaborators.filter(c => c.id !== id));
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.nickName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex flex-col font-sans overflow-x-hidden text-stone-800">
      <header className="bg-white/80 backdrop-blur-xl border-b border-stone-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-900 text-white p-2.5 rounded-2xl shadow-xl shadow-emerald-900/20">
            <Users className="w-6 h-6" />
          </div>
          <div className="cursor-pointer" onClick={() => setView('tree')}>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight leading-none">Ibrahim Dabo <span className="text-amber-600 italic">Legacy</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-400 mt-1">Ancestral Repository</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="hidden xl:flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 shadow-inner">
          <button onClick={() => setView('tree')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'tree' ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
            <GitBranch className="w-4 h-4" /> Tree
          </button>
          <button onClick={() => setView('generations')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'generations' ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
            <Layers className="w-4 h-4" /> Generations
          </button>
          <button onClick={() => setView('relationships')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'relationships' ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
            <Network className="w-4 h-4" /> Kinship Map
          </button>
          <div className="w-px h-6 bg-stone-200 mx-2" />
          <button onClick={() => setView('admin')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'admin' ? 'bg-amber-600 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}>
            <ShieldCheck className="w-4 h-4" /> Admin {proposals.filter(p => p.status === 'pending').length > 0 && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
          </button>
        </div>

        <nav className="flex items-center gap-3">
          <button onClick={() => { setSubmissionParent(null); setIsAdminDirectEntry(false); setShowSubmissionForm(true); }} className="px-5 py-2.5 bg-emerald-900 text-white rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-950 transition-all shadow-lg shadow-emerald-900/10">
            <PlusCircle className="w-4 h-4" /> Propose Entry
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2.5 text-stone-400 hover:text-emerald-800 transition-all rounded-xl hover:bg-stone-50"><Settings className="w-5 h-5" /></button>
        </nav>
      </header>

      <main className="flex-1 p-8">
        <div className="flex-1 flex flex-col h-full max-w-[1600px] mx-auto">
          {view === 'tree' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-6xl font-serif font-bold text-stone-900">Genealogical Tapestry</h2>
                  <p className="text-stone-500 mt-3 text-lg font-medium">A unified archive of Ibrahim Dabo descent.</p>
                </div>
              </div>
              <div className="flex-1 min-h-[750px]">
                <TreeVisualizer data={filteredMembers} onMemberClick={handleMemberSelect} settings={settings} />
              </div>
            </div>
          )}

          {view === 'generations' && (
            <GenerationView members={members} onMemberSelect={handleMemberSelect} />
          )}

          {view === 'relationships' && (
            <RelationshipMap members={members} onMemberSelect={handleMemberSelect} />
          )}

          {view === 'admin' && (
            <AdminPanel 
              proposals={proposals} 
              onApprove={approveProposal} 
              onReject={rejectProposal} 
              onDirectEntry={() => { setIsAdminDirectEntry(true); setShowSubmissionForm(true); }}
              certifiedCollaborators={certifiedCollaborators}
              onCertify={handleCertifyCollaborator}
              onRevoke={handleRevokeCertification}
              adminWhatsApp={adminWhatsApp}
              onUpdateAdminWhatsApp={setAdminWhatsApp}
            />
          )}
        </div>
      </main>

      <MemberDetails member={selectedMember} allMembers={members} isAdminMode={view === 'admin'} onClose={() => setSelectedMember(null)} onSelectMember={handleMemberSelect} onCompare={handleStartComparison} />
      {showSettings && <SettingsOverlay settings={settings} onUpdateSettings={setSettings} onClose={() => setShowSettings(false)} onViewChange={setView} />}
      {showRelationshipTool && <RelationshipTool members={members} memberA={compMemberA} onSelectA={setCompMemberA} onClose={() => setShowRelationshipTool(false)} />}
      {showSubmissionForm && (
        <SubmissionForm 
          parentMember={submissionParent} 
          allMembers={members} 
          isAdminMode={isAdminDirectEntry} 
          certifiedCollaborators={certifiedCollaborators}
          adminWhatsApp={adminWhatsApp}
          onSubmit={handleAddSubmission} 
          onCancel={() => { setShowSubmissionForm(false); setIsAdminDirectEntry(false); }} 
        />
      )}
    </div>
  );
};

export default App;
