import { LateRecord } from '../types';
import { parseCSV } from '../utils/csvParser';

// Helper to normalize keys and find matches
const findKey = (obj: any, candidates: string[]) => {
  if (!obj) return undefined;
  const keys = Object.keys(obj);
  return keys.find(key => candidates.some(c => key.toLowerCase().includes(c)));
};

// Robust Date Parser (Handling ISO, YYYY-MM-DD, DD/MM/YYYY)
const parseDate = (dateStr: string): Date => {
    let dateObj = new Date(dateStr);
    
    // If standard parsing fails or results in Invalid Date
    if (isNaN(dateObj.getTime())) {
        try {
            // Try separating by / or - or space
            // Take the first part (date part) if there is time included
            const cleanDateStr = dateStr.trim().split(' ')[0]; 
            const parts = cleanDateStr.split(/[\/\-]/);
            
            if (parts.length === 3) {
                const p1 = parseInt(parts[0]);
                const p2 = parseInt(parts[1]);
                const p3 = parseInt(parts[2]);
                
                // Heuristic: If first part > 1900, assume YYYY-MM-DD
                if (p1 > 1900) {
                    // YYYY-MM-DD -> new Date(Year, MonthIndex, Day)
                    dateObj = new Date(p1, p2 - 1, p3);
                } else {
                    // Assume DD-MM-YYYY -> new Date(Year, MonthIndex, Day)
                    // p1=Day, p2=Month, p3=Year
                    const year = p3 < 100 ? 2000 + p3 : p3;
                    dateObj = new Date(year, p2 - 1, p1);
                }
            }
        } catch (e) {
            console.warn("Date parsing fallback failed for:", dateStr);
        }
    }

    // Add time info if available in original string and not captured above
    if (!isNaN(dateObj.getTime()) && dateStr.includes(':')) {
        const timePart = dateStr.trim().split(' ')[1];
        if (timePart) {
            const timeParts = timePart.split(':');
            if (timeParts.length >= 2) {
                dateObj.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
            }
        }
    }

    // Final fallback to now if still invalid
    if (isNaN(dateObj.getTime())) {
        return new Date(); 
    }
    
    return dateObj;
};

const mapRowToRecord = (row: any, index: number, isArrayMode: boolean, headers: string[] = []): LateRecord | null => {
   let dateStr, studentId, studentName, className, reason;

   if (isArrayMode) {
       // Array Logic (CSV or JSON Array of Arrays)
       // We need headers to know which index is which
       if (headers.length === 0) return null;

       const getIndex = (keys: string[]) => headers.findIndex(h => keys.some(k => String(h).toLowerCase().includes(k)));
       
       const idxTimestamp = getIndex(['timestamp', 'tarikh', 'masa', 'date', 'waktu']);
       const idxID = getIndex(['id', 'no', 'matrik']);
       const idxName = getIndex(['name', 'nama', 'murid', 'pelajar']);
       const idxClass = getIndex(['class', 'kelas', 'tingkatan']);
       const idxReason = getIndex(['reason', 'sebab', 'punca', 'alas']);

       // Validasi minimum: Mesti ada nama atau ID
       if (idxName === -1 && idxID === -1) return null;

       dateStr = idxTimestamp !== -1 ? row[idxTimestamp] : '';
       studentId = idxID !== -1 ? row[idxID] : `S-${1000 + index}`;
       studentName = idxName !== -1 ? row[idxName] : 'Unknown';
       className = idxClass !== -1 ? row[idxClass] : 'Umum';
       reason = idxReason !== -1 ? row[idxReason] : 'Tiada Rekod';

   } else {
       // Object Logic (JSON Object)
       const keyTimestamp = findKey(row, ['timestamp', 'tarikh', 'masa', 'date', 'waktu']);
       const keyID = findKey(row, ['id', 'no', 'matrik']);
       const keyName = findKey(row, ['name', 'nama', 'murid', 'pelajar']);
       const keyClass = findKey(row, ['class', 'kelas', 'tingkatan']);
       const keyReason = findKey(row, ['reason', 'sebab', 'punca', 'alas']);

       if (!keyName && !keyID) return null;

       dateStr = keyTimestamp ? row[keyTimestamp] : '';
       studentId = keyID ? row[keyID] : `S-${1000 + index}`;
       studentName = keyName ? row[keyName] : 'Unknown';
       className = keyClass ? row[keyClass] : 'Umum';
       reason = keyReason ? row[keyReason] : 'Tiada Rekod';
   }

   // Cleanup strings
   studentName = String(studentName || 'Unknown').trim().toUpperCase();
   className = String(className || '-').trim().toUpperCase();
   dateStr = String(dateStr || new Date().toISOString());

   const date = parseDate(dateStr);

   // Calculate Lateness (Base 7:30 AM)
   const schoolStartMinutes = 7 * 60 + 30; // 7:30 AM
   const arrivalMinutes = date.getHours() * 60 + date.getMinutes();
   let minutesLate = Math.max(0, arrivalMinutes - schoolStartMinutes);

   return {
       id: `REC-${index}`,
       studentId: String(studentId),
       studentName,
       className,
       timestamp: date.toISOString(),
       reason: String(reason),
       minutesLate
   };
};

export const fetchSheetData = async (scriptId: string): Promise<LateRecord[]> => {
    const url = `https://script.google.com/macros/s/${scriptId}/exec`;
    
    try {
        const response = await fetch(url);
        
        // Check for HTML response (Auth wall)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            throw new Error("AUTH_REQUIRED: Link memerlukan akses login (mungkin isu akaun DELIMA/Organisasi).");
        }

        if (!response.ok) throw new Error('Gagal menghubungi Apps Script.');
        
        const textData = await response.text();
        let dataToProcess: any[] = [];
        let isArrayMode = false;
        let headers: string[] = [];

        try {
            // Try parsing as JSON first
            const json = JSON.parse(textData);
            
            if (Array.isArray(json)) {
                dataToProcess = json;
            } else if (json.data && Array.isArray(json.data)) {
                dataToProcess = json.data;
            } else if (json.records && Array.isArray(json.records)) {
                dataToProcess = json.records;
            } else {
                 // Single object or unknown structure
                 if (typeof json === 'object' && json !== null) dataToProcess = [json];
            }

            // CRITICAL FIX: Check if JSON is actually an Array of Arrays (Rows from Sheets)
            // Example: [["Timestamp", "Name"], ["2023-01-01", "Ali"]]
            if (dataToProcess.length > 0 && Array.isArray(dataToProcess[0])) {
                isArrayMode = true;
                // Assume Row 0 is Headers
                headers = dataToProcess[0].map((h: any) => String(h));
                dataToProcess = dataToProcess.slice(1); // Remove header row
            }

        } catch (e) {
            // JSON parse failed, assume Raw CSV Text
            console.log("JSON parse failed, switching to CSV parser");
            const rows = parseCSV(textData);
            if (rows.length > 1) {
                isArrayMode = true;
                headers = rows[0]; // First row is header
                dataToProcess = rows.slice(1); // Rest are data
            }
        }

        if (dataToProcess.length === 0) {
            return [];
        }

        const records = dataToProcess
            .map((row, index) => mapRowToRecord(row, index, isArrayMode, headers))
            .filter((r): r is LateRecord => r !== null);
        
        // --- LOGIK PENAPISAN PENDUA (DEDUPLICATION) ---
        // Kita gunakan Set untuk menyimpan kombinasi "Nama + Tarikh" yang telah dijumpai.
        // Jika scan kali kedua berlaku pada hari yang sama, ia akan diabaikan.
        const seen = new Set<string>();
        const uniqueRecords: LateRecord[] = [];

        for (const record of records) {
            // Dapatkan tarikh sahaja (YYYY-MM-DD), abaikan masa (HH:MM)
            const dateObj = new Date(record.timestamp);
            const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
            
            // Kunci unik: nama_murid + tarikh
            const uniqueKey = `${record.studentName.trim().toLowerCase()}_${dateKey}`;

            if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                uniqueRecords.push(record);
            }
        }

        // Susun rekod: Paling baru di atas (Descending)
        return uniqueRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    } catch (error: any) {
        console.error("Fetch Error:", error);
        throw new Error(error.message || "Ralat membaca data.");
    }
}