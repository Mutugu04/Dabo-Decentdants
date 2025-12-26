
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface TitleRecord {
  title: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface MarriageRecord {
  spouseName: string;
  spouseId?: string; // If linking to existing member
  date?: string;
  place?: string;
}

export interface FamilyMember {
  id: string;
  firstName: string;
  middleName?: string;
  familyName: string;
  nickName?: string;
  name: string; // Display name
  gender: Gender;
  isRoyal: boolean;
  
  // Historical context and lineage properties
  title?: string;
  reignStart?: string;
  reignEnd?: string;
  spouseIds?: string[];
  
  // Vitals
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  
  // Historical Metadata
  bio?: string;
  photoUrl?: string;
  titleRecords?: TitleRecord[];
  marriageRecords?: MarriageRecord[];
  
  // Tree Linkage
  parentId?: string; // Father (primary lineage)
  motherId?: string; // Mother
  childrenIds?: string[];
  tags?: string[];
}

export interface SubmissionProposal {
  id: string;
  submitter: {
    name: string;
    email: string;
    phone?: string; // Added phone for WhatsApp verification
  };
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  data: Omit<FamilyMember, 'id'>;
}

export interface CertifiedCollaborator {
  id: string;
  name: string;
  phone: string;
  certifiedAt: number;
}
