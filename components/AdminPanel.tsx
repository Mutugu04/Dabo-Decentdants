
import React, { useState } from 'react';
import { SubmissionProposal, Gender, CertifiedCollaborator } from '../types';
import { 
  Database, ShieldCheck, Clock, CheckCircle2, 
  XCircle, User, MapPin, Calendar, Heart, Award,
  PlusCircle, MessageCircle, Phone, UserPlus, Trash2, Check, RefreshCw,
  Globe, Shield
} from 'lucide-react';
import { normalizePhone, isLikelyVirtualSim, displayPhone } from '../utils/phoneUtils';

interface Props {
  proposals: SubmissionProposal[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDirectEntry: () => void;
  certifiedCollaborators: CertifiedCollaborator[];
  onCertify: (collab: { name: string; phone: string }) => void;
  onRevoke: (id: string) => void;
  adminWhatsApp: string;
  onUpdateAdminWhatsApp: (phone: string) => void;
}

const AdminPanel: React.FC<Props> = ({ 
  proposals, onApprove, onReject, onDirectEntry,
  certifiedCollaborators, onCertify, onRevoke,
  adminWhatsApp, onUpdateAdminWhatsApp
}) => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'certification'>('proposals');
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabPhone, setNewCollabPhone] = useState('');

  const pending = proposals.filter(p => p.status === 'pending');

  const handleAddCollab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabName || !newCollabPhone) return;
    onCertify({ name: newCollabName, phone: normalizePhone(newCollabPhone) });
    setNewCollabName('');
    setNewCollabPhone('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-10">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-stone-900">Archive Oversight</h2>
          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => setActiveTab('proposals')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'proposals' ? 'bg-emerald-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Proposals ({pending.length})
            </button>
            <button 
              onClick={() => setActiveTab('certification')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'certification' ? 'bg-emerald-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Certified Numbers
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onDirectEntry}
            className="px-6 py-3 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" /> Direct Registry Entry
          </button>
        </div>
      </div>

      {activeTab === 'proposals' ? (
        <div className="space-y-8">
          {pending.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[3rem] shadow-xl border-2 border-dashed border-stone-200">
              <Database className="w-16 h-16 text-stone-200 mx-auto mb-6" />
              <p className="text-stone-400 font-serif italic text-xl">The lineage archive is current and verified.</p>
            </div>
          ) : (
            pending.map(p => (
              <div key={p.id} className="bg-white rounded-[3rem] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 border border-stone-100">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/3 bg-stone-50 p-10 border-r border-stone-100 flex flex-col items-center justify-center text-center">
                    <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center mb-6 shadow-md border-4 border-white overflow-hidden">
                      <img src={p.data.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} className="w-full h-full object-cover" alt="Member" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-stone-900 leading-tight mb-2">{p.data.name}</h3>
                    <div className={`px-3 py-1 ${p.data.isRoyal ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} rounded-full text-[10px] font-black uppercase tracking-widest mb-6`}>
                      {p.data.isRoyal ? 'Royal Dabo Descent' : 'Maternal Branch Entry'}
                    </div>
                    <div className="pt-6 border-t border-stone-200 w-full">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Submitted By</p>
                      <p className="text-sm font-bold text-stone-800">{p.submitter.name}</p>
                      <p className="text-xs text-stone-400 mb-1">{p.submitter.email}</p>
                      {p.submitter.phone && (
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 py-1 rounded-full border border-emerald-100 mt-2">
                          <MessageCircle className="w-3 h-3" /> {displayPhone(p.submitter.phone)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 p-10 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Birth</p>
                        <p className="text-sm font-bold">{p.data.birthDate || 'Unknown'}</p>
                        <p className="text-xs text-stone-500">{p.data.birthPlace || 'Location not specified'}</p>
                      </div>
                      {p.data.deathDate && (
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Death</p>
                          <p className="text-sm font-bold">{p.data.deathDate}</p>
                          <p className="text-xs text-stone-500">{p.data.deathPlace || 'Location not specified'}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Award className="w-3 h-3" /> Primary Title</p>
                        <p className="text-sm font-bold truncate">{p.data.titleRecords?.[0]?.title || 'None Listed'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /> Marital Records</p>
                      <div className="flex flex-wrap gap-2">
                        {p.data.marriageRecords?.map((m, i) => (
                          <div key={i} className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-900">
                            {m.spouseName} ({m.date || 'Year?'})
                          </div>
                        ))}
                        {(!p.data.marriageRecords || p.data.marriageRecords.length === 0) && <p className="text-xs text-stone-400 italic">No marriage records provided</p>}
                      </div>
                    </div>

                    <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Historical Narrative</p>
                      <p className="text-sm font-serif italic text-stone-700 line-clamp-3 leading-relaxed">"{p.data.bio}"</p>
                    </div>

                    <div className="pt-6 border-t border-stone-100 flex gap-4">
                      <button onClick={() => onApprove(p.id)} className="flex-1 flex items-center justify-center gap-3 bg-emerald-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-950 transition-all"><CheckCircle2 className="w-5 h-5" /> Verify & Integrate</button>
                      <button onClick={() => onReject(p.id)} className="px-8 py-4 bg-white text-stone-400 border border-stone-200 rounded-2xl font-bold hover:text-red-600 transition-all hover:bg-red-50"><XCircle className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100">
              <h4 className="text-xl font-serif font-bold mb-2 flex items-center gap-2 text-emerald-950">
                <Phone className="w-5 h-5 text-emerald-600" /> Admin Node
              </h4>
              <p className="text-xs text-stone-500 mb-6">Receiving WhatsApp bridge entries at:</p>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">+</span>
                  <input 
                    className="w-full pl-8 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-lg font-bold text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={adminWhatsApp}
                    onChange={(e) => onUpdateAdminWhatsApp(normalizePhone(e.target.value))}
                    placeholder="2348000000000"
                  />
                </div>
                {isLikelyVirtualSim(adminWhatsApp) && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Virtual SIM Detected</span>
                  </div>
                )}
                <button className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-950 transition-all">
                  <RefreshCw className="w-4 h-4" /> Save Configuration
                </button>
              </div>
            </div>

            <div className="bg-emerald-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <h4 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" /> Certify Number
              </h4>
              <form onSubmit={handleAddCollab} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-white/40 ml-1">Collaborator Name</label>
                  <input 
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-bold placeholder:text-white/20 outline-none focus:bg-white/20 transition-all"
                    placeholder="Alhaji Sanusi"
                    value={newCollabName}
                    onChange={e => setNewCollabName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-white/40 ml-1">WhatsApp Number (inc. code)</label>
                  <input 
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-bold placeholder:text-white/20 outline-none focus:bg-white/20 transition-all"
                    placeholder="e.g. 234803..."
                    value={newCollabPhone}
                    onChange={e => setNewCollabPhone(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-amber-600 transition-all">
                  <UserPlus className="w-4 h-4" /> Grant Bridge Access
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-stone-100">
            <h4 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3 text-stone-800">
              <ShieldCheck className="w-6 h-6 text-emerald-600" /> Authorized Contributors
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifiedCollaborators.map(c => (
                <div key={c.id} className="flex items-center justify-between p-5 bg-stone-50 border border-stone-100 rounded-3xl group transition-all hover:border-emerald-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-stone-200 shadow-sm">
                      <User className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">{c.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          {displayPhone(c.phone)}
                        </p>
                        {isLikelyVirtualSim(c.phone) && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black rounded uppercase">Virtual</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRevoke(c.id)}
                    className="p-3 text-stone-300 hover:text-red-500 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Revoke Certification"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {certifiedCollaborators.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-30">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-serif italic">No certified contributors on record.</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100">
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                <strong>Admin Protocol:</strong> Only certified numbers can initiate the WhatsApp bridge. 
                Virtual SIMs are fully supported; ensure you enter the complete international prefix (e.g., 1 for USA, 44 for UK).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
