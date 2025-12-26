
import React, { useState, useMemo } from 'react';
import { FamilyMember } from '../types';
import { Search, UserCircle, Network, Info } from 'lucide-react';

interface Props {
  members: FamilyMember[];
  onMemberSelect: (member: FamilyMember) => void;
}

const RelationshipMap: React.FC<Props> = ({ members, onMemberSelect }) => {
  const [focalMember, setFocalMember] = useState<FamilyMember | null>(members[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const calculateRelationship = (a: FamilyMember, b: FamilyMember) => {
    if (a.id === b.id) return "Subject (Self)";

    const getPathToRoot = (m: FamilyMember): string[] => {
      const path: string[] = [m.id];
      let current = m;
      while (current.parentId) {
        const parent = members.find(p => p.id === current.parentId);
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

    if (!lcaId) return "Linked via Maternal Root";

    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    if (distA === 0) {
      if (distB === 1) return `Parent`;
      if (distB === 2) return `Grandparent`;
      return `${getOrdinal(distB - 2)} Great-Grandparent`;
    }
    if (distB === 0) {
      if (distA === 1) return `Child`;
      if (distA === 2) return `Grandchild`;
      return `${getOrdinal(distA - 2)} Great-Grandchild`;
    }
    if (distA === 1 && distB === 1) return "Sibling";
    
    const degree = Math.min(distA, distB) - 1;
    const removed = Math.abs(distA - distB);
    let base = degree === 1 ? "1st Cousin" : degree === 2 ? "2nd Cousin" : `${getOrdinal(degree)} Cousin`;
    return removed > 0 ? `${base} (${removed}x removed)` : base;
  };

  const relationshipList = useMemo(() => {
    if (!focalMember) return [];
    return members
      .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(m => ({
        member: m,
        rel: calculateRelationship(focalMember, m)
      }));
  }, [focalMember, searchTerm, members]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="text-center">
        <h2 className="text-5xl font-serif font-bold text-stone-900">Kinship Network</h2>
        <p className="text-stone-500 mt-4 text-lg">Map how every member of the Dabo registry is interconnected.</p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-stone-100 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
          <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest ml-4">Select Focal Ancestor</label>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5" />
            <select 
              className="w-full pl-16 pr-8 py-5 bg-stone-50 border border-stone-100 rounded-[2rem] text-lg font-serif font-bold outline-none focus:ring-4 focus:ring-emerald-50 transition-all appearance-none"
              value={focalMember?.id}
              onChange={(e) => setFocalMember(members.find(m => m.id === e.target.value) || null)}
            >
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        
        <div className="shrink-0 flex items-center gap-6 px-10 py-6 bg-emerald-900 rounded-[3rem] text-white shadow-2xl shadow-emerald-900/20">
          <img src={focalMember?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${focalMember?.id}`} className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20" />
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-300 tracking-[0.2em] mb-1">Mapping Network For</p>
            <h3 className="text-2xl font-serif font-bold leading-tight">{focalMember?.name}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relationshipList.map(({ member, rel }) => (
          <button
            key={member.id}
            onClick={() => onMemberSelect(member)}
            className={`p-6 rounded-[2.5rem] border transition-all text-left flex items-center gap-5 group ${member.id === focalMember?.id ? 'bg-amber-50 border-amber-200' : 'bg-white border-stone-100 hover:border-emerald-200 hover:shadow-xl'}`}
          >
            <img src={member.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-stone-800 group-hover:text-emerald-900 transition-colors">{member.name}</h4>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${member.id === focalMember?.id ? 'text-amber-600' : 'text-stone-400'}`}>{rel}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelationshipMap;
