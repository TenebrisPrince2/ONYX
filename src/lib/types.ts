export type ID = string;
export type OpType = 'income' | 'expense' | 'transfer' | 'adjust';
export interface Account { id: ID; name: string; color: string; icon: string; currency: string; start: number; hidden: boolean; order: number }
export interface Category { id: ID; name: string; color: string; icon: string; type: 'income' | 'expense'; parentId: ID | null; order: number }
export interface Operation { id: ID; type: OpType; amount: number; currency: string; accountId: ID; toAccountId?: ID | null; categoryId?: ID | null; note: string; img?: string | null; date: string; createdAt: number }
export interface CustomPeriod { id: ID; label: string; s: string; e: string }
export interface Settings {
  currency: string; reminderEnabled: boolean; reminderTime: string; reminderDays: number[];
  addBtn: { scan: boolean; voice: boolean; main: 'manual' | 'scan' | 'voice' };
  customPeriods: CustomPeriod[]; quickFilter: ID[] | null;
}