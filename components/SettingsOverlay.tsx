
import React from 'react';
import { X, Check, Keyboard, Info, Crown, Users, GitBranch, Layers, Network } from 'lucide-react';

interface Settings {
  showNicknames: boolean;
  highlightRoyal: boolean;
  showMaternalLinks: boolean;
  compactMode: boolean;
}

interface Props {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  onClose: () => void;
  onViewChange?: (view: 'tree' | 'generations' | 'relationships') => void;
}

const SettingsOverlay: React.FC<Props> = ({ settings, onUpdateSettings, onClose, onViewChange }) => {
  const toggle = (key: keyof Settings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end md:p-4 pointer-events-none">
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm pointer-events-auto" 
        onClick={onClose}
      />
      
      <div className="relative w-full md:w-[450px] h-full md:h-auto md:max-h-[95vh] bg-white md:rounded-[3rem] shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-stone-100">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <h3 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-3">
            <Info className="w-6 h-6 text-emerald-800" />
            Archive Settings
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Quick Navigation */}
          <section>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">Archive Insights</h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Interactive Lineage Tree', icon: GitBranch, view: 'tree' },
                { label: 'Dynasty Generations', icon: Layers, view: 'generations' },
                { label: 'Kinship Connection Map', icon: Network, view: 'relationships' },
              ].map((btn) => (
                <button
                  key={btn.view}
                  onClick={() => { onViewChange?.(btn.view as any); onClose(); }}
                  className="flex items-center gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all text-left"
                >
                  <div className="p-3 bg-white rounded-xl shadow-sm"><btn.icon className="w-5 h-5 text-emerald-800" /></div>
                  <span className="text-sm font-bold text-emerald-900">{btn.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Visualization Controls */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">Display Preferences</h4>
            <div className="space-y-2">
              {[
                { key: 'showNicknames', label: 'Display Nicknames (Inkiya)', icon: Info },
                { key: 'highlightRoyal', label: 'Highlight Royal Lineage', icon: Crown },
                { key: 'showMaternalLinks', label: 'Show Cross-Maternal Links', icon: Users },
                { key: 'compactMode', label: 'Compact Layout Optimization', icon: Keyboard },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggle(item.key as keyof Settings)}
                  className="w-full flex items-center justify-between p-5 bg-white border border-stone-100 rounded-2xl hover:border-emerald-300 transition-all group"
                >
                  <div className="flex items-center gap-4 text-stone-600 font-bold text-sm">
                    <item.icon className="w-5 h-5 text-stone-300 group-hover:text-emerald-800 transition-colors" />
                    {item.label}
                  </div>
                  <div className={`w-12 h-7 rounded-full transition-colors relative ${settings[item.key as keyof Settings] ? 'bg-emerald-600' : 'bg-stone-200'}`}>
                    <div className={`absolute top-1 bg-white w-5 h-5 rounded-full transition-all shadow-md ${settings[item.key as keyof Settings] ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Legend Section */}
          <section>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">Registry Legend</h4>
            <div className="space-y-3 bg-stone-50 p-6 rounded-[2rem] border border-stone-100">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-emerald-800 shadow-lg" />
                <span className="text-sm font-bold text-stone-700">Royal Dabo Lineage</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-amber-700 shadow-lg" />
                <span className="text-sm font-bold text-stone-700">Maternal Branch Connections</span>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 bg-stone-50 border-t border-stone-100">
          <button 
            onClick={onClose}
            className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-stone-900/10"
          >
            Save Archive Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
