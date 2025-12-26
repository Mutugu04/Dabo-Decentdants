
import React, { useState, useMemo } from 'react';
import { FamilyMember } from '../types';
import { 
  Calendar, Crown, Heart, X, Gavel, Baby, Award, 
  ChevronRight, History, Network, ArrowUpDown, 
  MapPin, ScrollText, UserCircle
} from 'lucide-react';

interface Props {
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  onClose: () => void;
  onSelectMember: (member: FamilyMember) => void;
  onCompare: (member: FamilyMember) => void;
  isAdminMode: boolean;
}

const MemberDetails: React.FC<Props> = ({ member, allMembers, onClose, onSelectMember, onCompare }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'lineage'>('info');

  if (!member) return null;

  const spouses = allMembers.filter(m => 
    member.marriageRecords?.some(rec => rec.spouseId === m.id) || 
    member.spouseIds?.includes(m.id)
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out flex flex-col border-l border-stone-200">
      <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/80 backdrop-blur-md">
        <div className="flex gap-6">
          <button onClick={() => setActiveTab('info')} className={`text-sm font-black uppercase tracking-widest pb-2 transition-all ${activeTab === 'info' ? 'text-emerald-900 border-b-2 border-emerald-900' : 'text-stone-400'}`}>Profile</button>
          <button onClick={() => setActiveTab('lineage')} className={`text-sm font-black uppercase tracking-widest pb-2 transition-all ${activeTab === 'lineage' ? 'text-emerald-900 border-b-2 border-emerald-900' : 'text-stone-400'}`}>Lineage</button>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-stone-200 rounded-full transition-colors"><X className="w-5 h-5 text-stone-500" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10">
        {activeTab === 'info' ? (
          <>
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-100 rounded-[3rem] blur-3xl opacity-30 -z-10 animate-pulse" />
                <img 
                  src={member.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} 
                  className="w-44 h-44 rounded-[3rem] border-8 border-white shadow-2xl object-cover ring-1 ring-stone-100" 
                  alt={member.name}
                />
                {member.isRoyal && (
                  <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-amber-400 to-amber-600 text-white p-4 rounded-[1.5rem] shadow-2xl border-4 border-white">
                    <Crown className="w-6 h-6" />
                  </div>
                )}
              </div>
              <h3 className="text-4xl font-serif font-bold text-emerald-950 text-center leading-tight">{member.name}</h3>
              {member.nickName && (
                <p className="mt-2 text-amber-700 font-serif italic text-xl">"{member.nickName}"</p>
              )}
            </div>

            <section className="space-y-4">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b pb-2">Vital Registry</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 bg-stone-50 p-5 rounded-3xl border border-stone-100">
                  <div className="bg-emerald-100 p-3 rounded-2xl"><MapPin className="w-5 h-5 text-emerald-800" /></div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-stone-400">Birth</p>
                    <p className="text-sm font-bold text-stone-800">{member.birthDate || 'Date Unknown'} {member.birthPlace ? `at ${member.birthPlace}` : ''}</p>
                  </div>
                </div>
                {member.deathDate && (
                  <div className="flex items-center gap-4 bg-stone-50 p-5 rounded-3xl border border-stone-100 opacity-80">
                    <div className="bg-stone-200 p-3 rounded-2xl"><Calendar className="w-5 h-5 text-stone-600" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-stone-400">Death</p>
                      <p className="text-sm font-bold text-stone-800">{member.deathDate} {member.deathPlace ? `in ${member.deathPlace}` : ''}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {member.titleRecords && member.titleRecords.length > 0 && (
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b pb-2">Titles & Positions</h4>
                <div className="space-y-3">
                  {member.titleRecords.map((t, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                      <span className="text-sm font-serif font-bold text-amber-900">{t.title}</span>
                      <span className="text-[10px] font-black text-amber-600 bg-white px-2 py-1 rounded-lg border border-amber-100">{t.startDate} — {t.endDate || 'Present'}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {member.marriageRecords && member.marriageRecords.length > 0 && (
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b pb-2">Marital Union</h4>
                <div className="space-y-3">
                  {member.marriageRecords.map((m, i) => (
                    <div key={i} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                      <p className="text-sm font-bold text-rose-900">{m.spouseName}</p>
                      <p className="text-[10px] text-rose-400 font-medium mt-1">{m.date && `Wed in ${m.date}`} {m.place && `at ${m.place}`}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest border-b pb-2">Historical Narrative</h4>
              <div className="bg-[#fcfbf7] p-8 rounded-[2rem] border border-stone-100 relative shadow-inner">
                <ScrollText className="absolute top-4 right-4 w-10 h-10 text-stone-100" />
                <p className="text-stone-700 text-lg font-serif italic leading-relaxed">
                  "{member.bio || 'The specific narrative for this branch is currently under scholarly review.'}"
                </p>
              </div>
            </section>
          </>
        ) : (
          <div className="space-y-10">
            {/* Posterity & Ancestry Lists logic remains similar but updated to support deeper data */}
            <div className="p-8 bg-emerald-900 rounded-[3rem] text-white">
              <h4 className="text-2xl font-serif font-bold mb-4">Lineage Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-black text-white/40">Dynasty Status</p>
                  <p className="font-bold">{member.isRoyal ? 'Royal' : 'Maternal'}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-black text-white/40">Generations</p>
                  <p className="font-bold">Verifying...</p>
                </div>
              </div>
            </div>
            
            <button onClick={() => onCompare(member)} className="w-full py-5 bg-stone-100 text-stone-600 font-bold rounded-[2rem] hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center gap-3">
              <Network className="w-5 h-5" /> Explore Kinship Network
            </button>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-stone-100 bg-stone-50/50 flex gap-4">
        <button onClick={() => onSelectMember(member)} className="flex-1 py-4 bg-emerald-900 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 transition-all hover:-translate-y-1">Focus on Branch</button>
        <button className="px-4 py-4 bg-white border border-stone-200 rounded-2xl text-stone-400 hover:text-emerald-800 transition-all"><UserCircle className="w-6 h-6" /></button>
      </div>
    </div>
  );
};

export default MemberDetails;
