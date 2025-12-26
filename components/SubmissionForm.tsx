
import React, { useState, useMemo } from 'react';
import { FamilyMember, Gender, TitleRecord, MarriageRecord, CertifiedCollaborator } from '../types';
import { 
  X, Camera, Fingerprint, MapPin, Calendar, 
  Award, Heart, BookOpen, Plus, Trash2, 
  UserPlus, Sparkles, ChevronRight, ChevronLeft,
  ShieldCheck, MessageCircle, CheckCircle2, ShieldAlert,
  Globe, Users
} from 'lucide-react';
import { getMemberBio } from '../services/geminiService';
import { normalizePhone, isLikelyVirtualSim, generateWhatsAppLink, displayPhone } from '../utils/phoneUtils';

interface Props {
  parentMember: FamilyMember | null;
  allMembers: FamilyMember[];
  isAdminMode?: boolean;
  certifiedCollaborators: CertifiedCollaborator[];
  adminWhatsApp: string;
  onSubmit: (proposal: any) => void;
  onCancel: () => void;
}

const SubmissionForm: React.FC<Props> = ({ 
  parentMember, allMembers, isAdminMode = false, 
  certifiedCollaborators, adminWhatsApp, onSubmit, onCancel 
}) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', familyName: 'Dabo', nickName: '',
    gender: parentMember?.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
    isRoyal: true,
    birthDate: '', birthPlace: '', deathDate: '', deathPlace: '',
    bio: '', photoUrl: '',
    parentId: parentMember?.id || '',
    motherId: '',
  });

  const [titleRecords, setTitleRecords] = useState<TitleRecord[]>([]);
  const [marriageRecords, setMarriageRecords] = useState<MarriageRecord[]>([]);
  const [submitter, setSubmitter] = useState({ 
    name: isAdminMode ? 'Archive Admin' : '', 
    email: isAdminMode ? 'admin@dabo-legacy.org' : '',
    phone: ''
  });

  const isCertified = useMemo(() => {
    if (isAdminMode) return true;
    const cleanPhone = normalizePhone(submitter.phone);
    return certifiedCollaborators.some(c => normalizePhone(c.phone) === cleanPhone);
  }, [submitter.phone, certifiedCollaborators, isAdminMode]);

  const isVirtual = useMemo(() => isLikelyVirtualSim(submitter.phone), [submitter.phone]);

  const addTitle = () => setTitleRecords([...titleRecords, { title: '', startDate: '', endDate: '' }]);
  const removeTitle = (index: number) => setTitleRecords(titleRecords.filter((_, i) => i !== index));
  const updateTitle = (index: number, field: keyof TitleRecord, value: any) => {
    const next = [...titleRecords];
    next[index] = { ...next[index], [field]: value };
    setTitleRecords(next);
  };

  const addMarriage = () => setMarriageRecords([...marriageRecords, { spouseName: '', date: '', place: '' }]);
  const removeMarriage = (index: number) => setMarriageRecords(marriageRecords.filter((_, i) => i !== index));
  const updateMarriage = (index: number, field: keyof MarriageRecord, value: any) => {
    const next = [...marriageRecords];
    next[index] = { ...next[index], [field]: value };
    setMarriageRecords(next);
  };

  const generateBio = async () => {
    if (!formData.firstName) return alert("Please enter at least a first name first.");
    setIsGenerating(true);
    const bio = await getMemberBio(formData.firstName, titleRecords[0]?.title);
    setFormData({ ...formData, bio: bio || '' });
    setIsGenerating(false);
  };

  const constructWAMessage = () => {
    const name = [formData.firstName, formData.middleName, formData.familyName].filter(Boolean).join(' ');
    let text = `👑 *DABO LEGACY ARCHIVE SUBMISSION*\n\n`;
    text += `*Full Name:* ${name}\n`;
    if (formData.nickName) text += `*Nickname:* "${formData.nickName}"\n`;
    text += `*Gender:* ${formData.gender}\n`;
    text += `*Royal Descent:* ${formData.isRoyal ? 'Yes' : 'No'}\n`;
    text += `*Birth:* ${formData.birthDate || 'Unknown'} (${formData.birthPlace || 'Location Unknown'})\n`;
    
    if (titleRecords.length > 0) {
      text += `\n*Titles:* \n${titleRecords.map(t => `• ${t.title} (${t.startDate || ''})`).join('\n')}\n`;
    }
    
    if (marriageRecords.length > 0) {
      text += `\n*Spouses:* \n${marriageRecords.map(m => `• ${m.spouseName}`).join('\n')}\n`;
    }

    text += `\n*Biography:* ${formData.bio}\n\n`;
    text += `--- \n*Verified Contributor:* ${submitter.name}\n*Phone:* ${displayPhone(submitter.phone)}`;
    
    return text;
  };

  const handleWASubmit = () => {
    if (!isCertified) {
      alert("Verification Required: Your number must be certified by the admin to use the WhatsApp bridge.");
      return;
    }
    const url = generateWhatsAppLink(adminWhatsApp, constructWAMessage());
    window.open(url, '_blank');
    handleSubmit();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = [formData.firstName, formData.middleName, formData.familyName].filter(Boolean).join(' ');
    onSubmit({
      submitter: { ...submitter, phone: normalizePhone(submitter.phone) },
      timestamp: Date.now(),
      status: isAdminMode ? 'approved' : 'pending',
      data: {
        ...formData,
        name,
        titleRecords,
        marriageRecords
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-[#fdfcf9] w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
        
        <div className={`${isAdminMode ? 'bg-amber-800' : 'bg-emerald-950'} p-8 text-white flex justify-between items-center transition-colors duration-500`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              {isAdminMode ? <ShieldCheck className="w-8 h-8 text-amber-200" /> : <UserPlus className="w-8 h-8 text-amber-400" />}
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold tracking-tight">
                {isAdminMode ? 'Direct Archive Entry' : 'Genealogical Proposal'}
              </h2>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className={`h-1 w-8 rounded-full transition-all ${step >= s ? (isAdminMode ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-white/10 rounded-full transition-all"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Fingerprint className="w-5 h-5 text-emerald-800" />
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Core Identity</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">First Name</label>
                    <input required className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl text-lg font-serif font-bold focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="e.g. Muhammadu" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Middle Name</label>
                    <input className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl text-lg font-serif font-bold focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} placeholder="Optional" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Family Name</label>
                    <input required className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl text-lg font-serif font-bold focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.familyName} onChange={e => setFormData({...formData, familyName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Inkiya (Nickname)</label>
                    <input className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl text-lg font-serif font-bold italic text-amber-700 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.nickName} onChange={e => setFormData({...formData, nickName: e.target.value})} placeholder="e.g. Sanusi" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl cursor-pointer" onClick={() => setFormData({...formData, isRoyal: !formData.isRoyal})}>
                    <input type="checkbox" checked={formData.isRoyal} readOnly className="w-5 h-5 rounded text-emerald-800" />
                    <label className="text-sm font-bold text-stone-700">Ibrahim Dabo Direct Descendant</label>
                  </div>
                  <select className="flex-1 px-4 py-4 bg-white border border-stone-200 rounded-2xl text-sm font-bold outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}>
                    {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-800" /><h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Birth Registry</h3></div>
                  <div className="space-y-4">
                    <input type="date" className="w-full px-5 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                    <input className="w-full px-5 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none" placeholder="City/Emirate" value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-stone-400" /><h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Legacy Registry</h3></div>
                  <div className="space-y-4">
                    <input type="date" className="w-full px-5 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none" value={formData.deathDate} onChange={e => setFormData({...formData, deathDate: e.target.value})} />
                    <input className="w-full px-5 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none" placeholder="Place of Rest" value={formData.deathPlace} onChange={e => setFormData({...formData, deathPlace: e.target.value})} />
                  </div>
                </div>
              </section>

              <section className="space-y-6 pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-600" /><h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Titles Held</h3></div>
                  <button type="button" onClick={addTitle} className="text-[10px] font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full hover:bg-amber-200 transition-colors">+ New Title Record</button>
                </div>
                <div className="space-y-3">
                  {titleRecords.map((t, i) => (
                    <div key={i} className="flex gap-2 items-center animate-in fade-in">
                      <input className="flex-[2] px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs" placeholder="e.g. Galadiman Kano" value={t.title} onChange={e => updateTitle(i, 'title', e.target.value)} />
                      <input className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs" placeholder="Year" value={t.startDate} onChange={e => updateTitle(i, 'startDate', e.target.value)} />
                      <button type="button" onClick={() => removeTitle(i)} className="p-2 text-stone-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /><h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Matrimonial Connections</h3></div>
                  <button type="button" onClick={addMarriage} className="text-[10px] font-bold bg-rose-100 text-rose-800 px-3 py-1 rounded-full hover:bg-rose-200 transition-colors">+ New Union</button>
                </div>
                <div className="space-y-4">
                  {marriageRecords.map((m, i) => (
                    <div key={i} className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex gap-3 items-center">
                      <input className="flex-1 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs" placeholder="Spouse Full Name" value={m.spouseName} onChange={e => updateMarriage(i, 'spouseName', e.target.value)} />
                      <input className="w-24 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs" placeholder="Year" value={m.date} onChange={e => updateMarriage(i, 'date', e.target.value)} />
                      <button type="button" onClick={() => removeMarriage(i)} className="p-2 text-stone-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-stone-400" /><h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Maternal & Paternal Branching</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Father (Paternal Link)</label>
                    <select className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm font-bold" value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})}>
                      <option value="">Unknown / External Branch</option>
                      {allMembers.filter(m => m.gender === Gender.MALE).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Mother (Maternal Link)</label>
                    <select className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm font-bold" value={formData.motherId} onChange={e => setFormData({...formData, motherId: e.target.value})}>
                      <option value="">Unknown / Maternal Root</option>
                      {allMembers.filter(m => m.gender === Gender.FEMALE).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <section className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-48 h-48 rounded-[2rem] border-2 border-dashed border-stone-300 flex items-center justify-center bg-white shrink-0 cursor-pointer hover:border-emerald-500 transition-all overflow-hidden">
                  <Camera className="w-12 h-12 text-stone-200" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-800" /><h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Biography & Legacy Narrative</h3></div>
                    <button type="button" onClick={generateBio} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-all disabled:opacity-50">
                      <Sparkles className="w-3 h-3" /> {isGenerating ? 'Archiving...' : 'Draft with Gemini AI'}
                    </button>
                  </div>
                  <textarea className="w-full px-5 py-4 bg-white border border-stone-200 rounded-3xl text-sm min-h-[150px] outline-none italic font-serif leading-relaxed shadow-inner" placeholder="Provide historical context for this branch..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                </div>
              </section>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <section className="bg-stone-100 p-8 rounded-[3rem] space-y-6 border border-stone-200">
                <div className="text-center">
                  <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest">Collaborator Verification</h3>
                  <p className="text-xs text-stone-400 mt-2">Enter your certified number to enable the secure WhatsApp bridge.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-stone-400 ml-2">Full Name</label>
                    <input required className="w-full px-5 py-3 bg-white border border-stone-200 rounded-xl text-sm font-bold" value={submitter.name} onChange={e => setSubmitter({...submitter, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-stone-400 ml-2">Email</label>
                    <input required type="email" className="w-full px-5 py-3 bg-white border border-stone-200 rounded-xl text-sm font-bold" value={submitter.email} onChange={e => setSubmitter({...submitter, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold uppercase text-stone-400 ml-2">WhatsApp Number (Certified Virtual or Local)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">+</span>
                      <input 
                        required 
                        className={`w-full pl-8 pr-5 py-4 bg-white border ${isCertified ? 'border-emerald-500' : 'border-stone-200'} rounded-xl text-lg font-bold tracking-wider outline-none transition-all`}
                        value={submitter.phone} 
                        onChange={e => setSubmitter({...submitter, phone: e.target.value})} 
                        placeholder="234..."
                      />
                    </div>
                    <div className="flex items-center px-4 bg-white rounded-xl border border-stone-200">
                      {isCertified ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in" />
                      ) : (
                        <ShieldAlert className="w-6 h-6 text-amber-300" />
                      )}
                    </div>
                  </div>
                  {isVirtual && (
                    <div className="flex items-center gap-2 mt-1 ml-2">
                      <Globe className="w-3 h-3 text-blue-500" />
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Virtual SIM detected & supported</span>
                    </div>
                  )}
                </div>

                {!isAdminMode && (
                  <div className={`p-6 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all ${isCertified ? 'bg-emerald-50 border-emerald-100' : 'bg-stone-50 border-stone-200'}`}>
                    {isCertified ? (
                      <p className="text-xs font-bold text-emerald-800">Your number is certified. The WhatsApp Bridge is now active for secure ancestral data submission.</p>
                    ) : (
                      <p className="text-[10px] font-medium text-stone-500 italic">Uncertified number. You may submit via standard repository review, but the WhatsApp bridge is disabled until admin certification.</p>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          <div className="mt-12 flex justify-between items-center pt-8 border-t border-stone-100">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 text-stone-500 font-bold hover:bg-stone-100 rounded-2xl transition-all"><ChevronLeft className="w-5 h-5" /> Previous</button>
            ) : (
              <button type="button" onClick={onCancel} className="px-6 py-3 text-stone-400 font-bold hover:text-stone-600">Dismiss Proposal</button>
            )}
            
            {step < 5 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-[2rem] font-bold shadow-xl shadow-emerald-100 transition-all hover:-translate-y-1">Continue <ChevronRight className="w-5 h-5" /></button>
            ) : (
              <div className="flex gap-4">
                {isCertified && !isAdminMode && (
                  <button 
                    type="button" 
                    onClick={handleWASubmit}
                    className="px-8 py-4 bg-[#25D366] text-white rounded-[2rem] font-bold shadow-xl flex items-center gap-2 transition-all hover:-translate-y-1"
                  >
                    <MessageCircle className="w-5 h-5" /> WhatsApp Bridge
                  </button>
                )}
                <button type="submit" className={`px-10 py-4 ${isAdminMode ? 'bg-amber-600 shadow-amber-100' : 'bg-emerald-900 shadow-emerald-100'} text-white rounded-[2rem] font-bold shadow-xl transition-all hover:-translate-y-1`}>
                  {isAdminMode ? 'Direct Commit' : 'Propose to Archive'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;
