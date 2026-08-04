import type { Account, Category, Settings } from './types';
export const PALETTE = ['#ffffff','#f5f5f7','#d1d1d6','#9ca3af','#6b7280','#ff375f','#ff453a','#ff6b1c','#ff9500','#ff9f0a','#ffd60a','#f2b300','#ffe066','#a2d729','#8ac926','#66bb6a','#30d158','#10b981','#0ac97a','#14b8a6','#06b6d4','#0ea5e9','#64d2ff','#0a84ff','#3b82f6','#5e5ce6','#8b5cf6','#a855f7','#bf5af2','#d946ef','#ec4899','#ff2d92','#f472b6','#a16207','#8d6e63','#b08968','#d7a86e'];
export const EXP_RAMP = ['#ff453a','#ff6b1c','#ff9500','#ff9f0a','#ffd60a','#f2b300','#a2d729','#8ac926','#a16207','#8d6e63','#9ca3af','#6b7280'];
export const INC_RAMP = ['#30d158','#10b981','#0ac97a','#14b8a6','#06b6d4','#0ea5e9','#64d2ff','#0a84ff','#3b82f6','#5e5ce6','#8b5cf6','#a855f7'];
export const CURRENCIES: Record<string, { sym: string; name: string }> = {
  BYN: { sym: 'Br', name: 'Белорусский рубль' }, RUB: { sym: '₽', name: 'Российский рубль' }
};
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
let o = 0; const nx = () => o++;
export const defaultAccounts = (): Account[] => [{ id: uid(), name: 'Кошелек', color: '#10b981', icon: 'wallet', currency: 'BYN', start: 0, hidden: false, order: nx() }];
export const defaultCategories = (): Category[] => [
  ['Продукты','#ff9500','basket','expense'], ['Кафе и рестораны','#ff375f','cutlery','expense'],
  ['Шоппинг','#ec4899','bag','expense'], ['Развлечения','#a855f7','ticket','expense'],
  ['Здоровье','#22c55e','heartPulse','expense'], ['Спорт','#3b82f6','dumbbell','expense'],
  ['Транспорт','#0ea5e9','car','expense'], ['Жилищные расходы','#9ca3af','home','expense'],
  ['Образование','#8b5cf6','cap','expense'], ['Путешествия','#06b6d4','plane','expense'],
  ['Подписки','#9ca3af','refresh','expense'], ['Красота и уход','#f472b6','scissors','expense'],
  ['Дети','#ffd60a','baby','expense'], ['Питомцы','#b08968','paw','expense'],
  ['Зарплата','#10b981','banknote','income'], ['Фриланс','#14b8a6','card','income'],
  ['Подарки','#ec4899','gift','income'], ['Инвестиции','#3b82f6','trend','income'],
  ['Прочее','#9ca3af','star','income']
].map(([name, color, icon, type]) => ({ id: uid(), name, color, icon, type: type as any, parentId: null, order: nx() }));
export const defaultSettings = (): Settings => ({
  currency: 'BYN', reminderEnabled: false, reminderTime: '20:00', reminderDays: [],
  addBtn: { scan: true, voice: true, main: 'manual' }, customPeriods: [], quickFilter: null
});