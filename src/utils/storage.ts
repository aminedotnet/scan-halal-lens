import { ScanHistory } from '@/types/product';

const STORAGE_KEY = 'halal_scan_history';

export function saveToHistory(scan: ScanHistory): void {
  try {
    const history = getHistory();
    history.unshift(scan); // إضافة في البداية
    
    // حفظ آخر 50 فحص فقط
    const trimmedHistory = history.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

export function getHistory(): ScanHistory[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

export function deleteFromHistory(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting from history:', error);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}
