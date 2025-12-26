
import { FamilyMember, Gender } from './types';

export const INITIAL_FAMILY_DATA: FamilyMember[] = [
  {
    id: 'dabo-1',
    firstName: 'Ibrahim',
    familyName: 'Dabo',
    name: 'Ibrahim Dabo',
    nickName: 'Dabo Bin-Mahmud',
    title: 'Sarkin Kano (Emir of Kano)',
    gender: Gender.MALE,
    birthDate: '1790',
    deathDate: '1846',
    reignStart: '1819',
    reignEnd: '1846',
    bio: 'The founder of the Dabo dynasty and the second Fulani Emir of Kano. Known for his piety and establishing the foundation of the current Kano Emirate.',
    isRoyal: true,
    photoUrl: 'https://picsum.photos/seed/dabo1/200/200'
  },
  {
    id: 'usman-1',
    firstName: 'Usman',
    familyName: 'Dabo',
    name: 'Usman I',
    nickName: 'Ma-je-Ringim',
    title: 'Sarkin Kano',
    gender: Gender.MALE,
    parentId: 'dabo-1',
    reignStart: '1846',
    reignEnd: '1855',
    isRoyal: true,
    photoUrl: 'https://picsum.photos/seed/usman/200/200'
  },
  {
    id: 'abdullahi-1',
    firstName: 'Abdullahi',
    familyName: 'Dabo',
    name: 'Abdullahi Majekarofi',
    nickName: 'Abdu Sarkin Kano',
    title: 'Sarkin Kano',
    gender: Gender.MALE,
    parentId: 'dabo-1',
    reignStart: '1855',
    reignEnd: '1883',
    isRoyal: true,
    photoUrl: 'https://picsum.photos/seed/abdullahi/200/200'
  },
  {
    id: 'ado-bayero-1',
    firstName: 'Ado',
    familyName: 'Bayero',
    name: 'Ado Bayero',
    nickName: 'Mai Kano',
    title: 'Alhaji Dr. Ado Bayero, CFR',
    gender: Gender.MALE,
    birthDate: '1930',
    deathDate: '2014',
    parentId: 'abdullahi-1',
    reignStart: '1963',
    reignEnd: '2014',
    bio: 'One of Nigeria\'s most prominent traditional rulers, serving as the Emir of Kano for 51 years.',
    isRoyal: true,
    photoUrl: 'https://picsum.photos/seed/adobayero/200/200'
  },
  {
    id: 'sanusi-ii-1',
    firstName: 'Muhammadu',
    middleName: 'Sanusi',
    familyName: 'Dabo',
    name: 'Muhammadu Sanusi II',
    nickName: 'Khalifa',
    title: 'Khalifa Sanusi II',
    gender: Gender.MALE,
    parentId: 'ado-bayero-1',
    reignStart: '2014',
    reignEnd: '2020',
    isRoyal: true,
    photoUrl: 'https://picsum.photos/seed/sanusi2/200/200'
  }
];
