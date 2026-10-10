export interface PostOffice {
  id: number;
  name: string;
  type: 'HO' | 'SO' | 'BO';
  pin: string;
  parentOffice: string;
}

export const KOTA_OFFICE_MASTER_LIST: PostOffice[] = [
  { id: 1, name: 'Aamli B.O', type: 'BO', pin: '325001', parentOffice: 'Kaithun S.O' },
  { id: 2, name: 'Aditya Nagar S.O', type: 'SO', pin: '326520', parentOffice: 'Aditya Nagar S.O' },
  { id: 3, name: 'Alod B.O', type: 'BO', pin: '326518', parentOffice: 'Chechat S.O' },
  { id: 4, name: 'Amarpura B.O', type: 'BO', pin: '325204', parentOffice: 'Sultanpur Kota S.O' },
  { id: 5, name: 'Anantpura BO', type: 'BO', pin: '303712', parentOffice: 'Not identified in directory' },
  { id: 42, name: 'Dadabari Kota S.O', type: 'SO', pin: '324009', parentOffice: 'Dadabari Kota S.O' },
  { id: 110, name: 'Kota H.O', type: 'HO', pin: '324001', parentOffice: 'Kota H.O; Kota Kutchery S.O; Nayapura Kota S.O; Subhash Marg Kota S.O' },
  // ... (Full list would be populated based on PDF data)
];
