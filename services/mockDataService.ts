import { LateRecord, Student } from '../types';

const CLASS_NAMES = ['1 Alpha', '1 Beta', '2 Alpha', '2 Gamma', '3 Sigma', '3 Delta', '4 Omega', '4 Zeta', '5 Prime', '5 Nexus'];
const REASONS = ['Bangun Lewat', 'Masalah Pengangkutan', 'Kesesakan Lalu Lintas', 'Hujan Lebat', 'Sakit', 'Lain-lain'];
const NAMES_MALE = ['Adam', 'Haziq', 'Irfan', 'Daniel', 'Amirul', 'Hakim', 'Raju', 'Wei Hong', 'Zafri', 'Luqman'];
const NAMES_FEMALE = ['Sarah', 'Aina', 'Mei Ling', 'Priya', 'Nurul', 'Batrisyia', 'Qistina', 'Sofia', 'Wei Wei', 'Dayang'];

const generateRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const generateMockData = (count: number = 150): LateRecord[] => {
  const records: LateRecord[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.5;
    const nameList = isMale ? NAMES_MALE : NAMES_FEMALE;
    const firstName = nameList[Math.floor(Math.random() * nameList.length)];
    const lastName = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random Initial
    const name = `${firstName} ${lastName}.`;
    
    const className = CLASS_NAMES[Math.floor(Math.random() * CLASS_NAMES.length)];
    const date = generateRandomDate(thirtyDaysAgo, now);
    
    // Bias towards weekdays (0 = Sun, 6 = Sat in JS)
    // Let's just adjust slightly, if it's weekend push to Monday
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    if (date.getDay() === 6) date.setDate(date.getDate() + 2);

    // Set time between 7:30 AM and 9:00 AM
    date.setHours(7, 30 + Math.floor(Math.random() * 90), 0);
    
    // Minutes late (school starts 7:30)
    const arrivalMinutes = date.getHours() * 60 + date.getMinutes();
    const schoolStartMinutes = 7 * 60 + 30;
    const minutesLate = Math.max(0, arrivalMinutes - schoolStartMinutes);

    records.push({
      id: `REC-${Math.floor(Math.random() * 10000)}`,
      studentId: `S${1000 + i}`,
      studentName: name,
      className: className,
      timestamp: date.toISOString(),
      reason: REASONS[Math.floor(Math.random() * REASONS.length)],
      minutesLate: minutesLate
    });
  }
  
  // Sort by date descending
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const fetchLateRecords = async (): Promise<LateRecord[]> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockData(200));
    }, 800);
  });
};