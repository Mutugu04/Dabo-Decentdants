
import React, { useMemo } from 'react';
import { FamilyMember } from '../types';
import { Crown, User, ChevronRight } from 'lucide-react';

interface Props {
  members: FamilyMember[];
  onMemberSelect: (member: FamilyMember) => void;
}

const GenerationView: React.FC<Props> = ({ members, onMemberSelect }) => {
  const generations = useMemo(() => {
    const genMap: { [key: number]: FamilyMember[] } = {};
    const depthMap: { [key: string]: number } = {};

    const findDepth = (id: string): number => {
      if (depthMap[id] !== undefined) return depthMap[id];
      const m = members.find(x => x.id === id);
      if (!m || !m.parentId) return 0;
      const d = findDepth(m.parentId) + 1;
      depthMap[id] = d;
      return d;
    };

    members.forEach(m => {
      const d = findDepth(m.id);
      if (!genMap[d]) genMap[d] = [];
      genMap[d].push(m);
    });

    return Object.entries(genMap).sort(([a], [b]) => parseInt(a) - parseInt(b));
  }, [members]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-10 text-center">
        <h2 className="text-5xl font-serif font-bold text-stone-900">Dynasty Generations</h2>
        <p className="text-stone-500 mt-4 text-lg">A chronological breakdown of successive generations in the Dabo Lineage.</p>
      </div>

      <div className="space-y-20 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-200 -z-10" />
        
        {generations.map(([gen, list]) => (
          <div key={gen} className="relative">
            <div className="flex justify-center mb-8">
              <div className="bg-emerald-900 text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-xl">
                Generation {parseInt(gen) + 1}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {list.map(m => (
                <button
                  key={m.id}
                  onClick={() => onMemberSelect(m)}
                  className="group relative bg-white p-5 rounded-[2.5rem] shadow-md hover:shadow-2xl transition-all border border-stone-100 hover:-translate-y-2 flex flex-col items-center text-center"
                >
                  <div className="relative mb-4">
                    <img 
                      src={m.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`} 
                      className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-lg ring-1 ring-stone-100"
                    />
                    {m.isRoyal && (
                      <div className="absolute -bottom-2 -right-2 bg-amber-500 p-1.5 rounded-xl shadow-lg border-2 border-white">
                        <Crown className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 leading-tight mb-1">{m.name}</h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{m.birthDate || 'Unknown Date'}</p>
                  
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-black text-emerald-800 uppercase">
                    View Record <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerationView;
