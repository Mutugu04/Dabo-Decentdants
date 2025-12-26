
import React, { useState, useMemo } from 'react';
import { FamilyMember } from '../types';
import { X, Search, Users, ChevronRight, Network, ArrowRightLeft, Info, ArrowUpDown } from 'lucide-react';

interface Props {
  members: FamilyMember[];
  memberA: FamilyMember | null;
  onClose: () => void;
  onSelectA: (m: FamilyMember) => void;
}

type SortType = 'name' | 'birthDate' | 'royal';

const RelationshipTool: React.FC<Props> = ({ members, memberA, onClose, onSelectA }) => {
  const [memberB, setMemberB] = useState<FamilyMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('name');

  const filteredMembers = useMemo(() => {
    const result = members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nickName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'birthDate') {
        const dateA = a.birthDate || '9999';
        const dateB = b.birthDate || '9999';
        return dateA.localeCompare(dateB);
      } else if (sortBy === 'royal') {
        return (b.isRoyal ? 1 : 0) - (a.isRoyal ? 1 : 0);
      }
      return 0;
    });

    return result.slice(0, 10);
  }, [members, searchTerm, sortBy]);

  // Genealogical Algorithm
  const findRelationship = (a: FamilyMember, b: FamilyMember) => {
    if (a.id === b.id) return "Same Person";

    const getPathToRoot = (m: FamilyMember): string[] => {
      const path: string[] = [m.id];
      let current = m;
      while (current.parentId || current.motherId) {
        // Simple heuristic: follow father first, then mother
        const parentId = current.parentId || current.motherId;
        const parent = members.find(p => p.id === parentId);
        if (parent && !path.includes(parent.id)) {
          path.push(parent.id);
          current = parent;
        } else break;
      }
      return path;
    };

    const pathA = getPathToRoot(a);
    const pathB = getPathToRoot(b);

    let lcaId: string | null = null;
    let distA = -1;
    let distB = -1;

    for (let i = 0; i < pathA.length; i++) {
      const idxB = pathB.indexOf(pathA[i]);
      if (idxB !== -1) {
        lcaId = pathA[i];
        distA = i;
        distB = idxB;
        break;
      }
    }

    if (!lcaId) return "No direct biological connection found in this archive.";

    const lca = members.find(m => m.id === lcaId);

    // Human-friendly relationship mapping
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // Case 1: Member A is an ancestor of Member B
    if (distA === 0) {
      if (distB === 1) return `Parent (A is B's Parent)`;
      if (distB === 2) return `Grandparent (A is B's Grandparent)`;
      if (distB === 3) return `Great-Grandparent (A is B's Great-Grandparent)`;
      return `${getOrdinal(distB - 2)} Great-Grandparent`;
    }

    // Case 2: Member B is an ancestor of Member A
    if (distB === 0) {
      if (distA === 1) return `Child (A is B's Child)`;
      if (distA === 2) return `Grandchild (A is B's Grandchild)`;
      if (distA === 3) return `Great-Grandchild (A is B's Great-Grandchild)`;
      return `${getOrdinal(distA - 2)} Great-Grandchild`;
    }

    // Case 3: Collateral relatives
    if (distA === 1 && distB === 1) return "Siblings";
    
    // Uncles/Aunts and Nephews/Nieces
    if (distA === 1 && distB === 2) return "Uncle/Aunt (A is B's Uncle/Aunt)";
    if (distA === 2 && distB === 1) return "Nephew/Niece (A is B's Nephew/Niece)";
    if (distA === 1 && distB === 3) return "Great-Uncle/Aunt (A is B's Great-Uncle/Aunt)";
    if (distA === 3 && distB === 1) return "Great-Nephew/Niece (A is B's Great-Nephew/Niece)";

    // Cousins
    const degree = Math.min(distA, distB) - 1;
    const removed = Math.abs(distA - distB);
    
    let baseCousin = "";
    if (degree === 1) baseCousin = "First Cousin";
    else if (degree === 2) baseCousin = "Second Cousin";
    else if (degree === 3) baseCousin = "Third Cousin";
    else baseCousin = `${getOrdinal(degree)} Cousin`;

    const removedStr = removed > 0 ? ` ${removed} time${removed > 1 ? 's' : ''} removed` : "";
    
    return `${baseCousin}${removedStr} via common ancestor ${lca?.name}`;
  };

  const relationship = memberA && memberB ? findRelationship(memberA, memberB) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-emerald-900 p-8 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-serif font-bold">Kinship Explorer</h2>
              <p className="text-white/60 text-sm mt-1">Determine the blood connection between dynasty branches</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-6 bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 overflow-hidden bg-white/20">
                {memberA ? <img src={memberA.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Users className="w-6 h-6" /></div>}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider truncate w-24 text-center">{memberA?.name || 'Select Member'}</span>
            </div>
            
            <div className="p-3 bg-amber-500 rounded-full shadow-lg animate-pulse">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-400 overflow-hidden bg-white/20">
                {memberB ? <img src={memberB.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Users className="w-6 h-6" /></div>}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider truncate w-24 text-center">{memberB?.name || 'Search Below'}</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {!memberB ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input 
                    autoFocus
                    className="w-full pl-12 pr-4 py-4 bg-stone-100 border-none rounded-2xl text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Type name to find relative..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-2xl border border-stone-100">
                  <ArrowUpDown className="w-4 h-4 text-stone-400 ml-2" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="bg-transparent text-xs font-bold text-stone-600 outline-none pr-4 cursor-pointer"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="birthDate">Sort by Date</option>
                    <option value="royal">Sort by Status</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredMembers.map(m => (
                  <button 
                    key={m.id}
                    disabled={m.id === memberA?.id}
                    onClick={() => setMemberB(m)}
                    className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-100 transition-all text-left disabled:opacity-30"
                  >
                    <img src={m.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`} className="w-10 h-10 rounded-full border border-white shadow-sm" />
                    <div>
                      <p className="text-sm font-bold text-stone-800">{m.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-stone-400 truncate w-20">{m.title || 'Family Member'}</p>
                        {m.isRoyal && <span className="w-1 h-1 bg-amber-500 rounded-full" />}
                        {m.birthDate && <span className="text-[9px] text-stone-300">{m.birthDate}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100 text-center">
                <p className="text-[10px] font-black uppercase text-stone-400 tracking-[0.3em] mb-4">Calculated Relationship</p>
                <h4 className="text-2xl font-serif font-bold text-emerald-950 mb-2 leading-tight">
                  {relationship}
                </h4>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase">
                  <Info className="w-3 h-3" /> Archive Verified
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setMemberB(null)}
                  className="flex-1 py-4 px-6 bg-stone-100 text-stone-600 font-bold rounded-2xl hover:bg-stone-200 transition-colors"
                >
                  Change Relative
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 px-6 bg-emerald-900 text-white font-bold rounded-2xl hover:bg-emerald-950 transition-colors shadow-lg"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelationshipTool;
