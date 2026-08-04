import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account, Category, Operation, Settings } from './types';
import { defaultAccounts, defaultCategories, defaultSettings, uid } from './meta';
interface Data {
  accounts: Account[]; categories: Category[]; operations: Operation[]; settings: Settings;
  addAccount: (a: Omit<Account, 'id' | 'order'>) => void;
  updateAccount: (id: string, p: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  sortAccounts: (mode: 'balance' | 'name' | 'custom', bal: (id: string) => number) => void;
  addCategory: (c: Omit<Category, 'id' | 'order'>) => void;
  updateCategory: (id: string, p: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (type: 'income' | 'expense', ids: string[]) => void;
  addOperation: (o: Omit<Operation, 'id' | 'createdAt'>) => void;
  updateOperation: (id: string, p: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;
  setSettings: (p: Partial<Settings>) => void;
  importAll: (d: any) => boolean;
  importBatch: (ops: Operation[], accs: Account[], cats: Category[]) => void;
}
export const useData = create<Data>()(persist((set) => ({
  accounts: defaultAccounts(), categories: defaultCategories(), operations: [], settings: defaultSettings(),
  addAccount: (a) => set((s) => ({ accounts: [...s.accounts, { ...a, id: uid(), order: s.accounts.length }] })),
  updateAccount: (id, p) => set((s) => ({ accounts: s.accounts.map((a) => a.id === id ? { ...a, ...p } : a) })),
  deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id), operations: s.operations.filter((o) => o.accountId !== id && o.toAccountId !== id) })),
  sortAccounts: (mode, bal) => set((s) => ({ accounts: [...s.accounts].sort((a, b) => mode === 'name' ? a.name.localeCompare(b.name) : mode === 'balance' ? bal(b.id) - bal(a.id) : a.order - b.order).map((a, i) => ({ ...a, order: i })) })),
  addCategory: (c) => set((s) => ({ categories: [...s.categories, { ...c, id: uid(), order: s.categories.length }] })),
  updateCategory: (id, p) => set((s) => ({ categories: s.categories.map((c) => c.id === id ? { ...c, ...p } : c) })),
  deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id).map((c) => c.parentId === id ? { ...c, parentId: null } : c), operations: s.operations.map((o) => o.categoryId === id ? { ...o, categoryId: null } : o) })),
  reorderCategories: (type, ids) => set((s) => ({ categories: s.categories.map((c) => c.type === type ? { ...c, order: ids.indexOf(c.id) } : c) })),
  addOperation: (o) => set((s) => ({ operations: [...s.operations, { ...o, id: uid(), createdAt: Date.now() }] })),
  updateOperation: (id, p) => set((s) => ({ operations: s.operations.map((o) => o.id === id ? { ...o, ...p } : o) })),
  deleteOperation: (id) => set((s) => ({ operations: s.operations.filter((o) => o.id !== id) })),
  setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
  importAll: (d) => {
    if (!Array.isArray(d?.accounts) || !Array.isArray(d?.categories) || !Array.isArray(d?.operations)) return false;
    set({ accounts: d.accounts, categories: d.categories, operations: d.operations, settings: { ...defaultSettings(), ...(d.settings || {}) } });
    return true;
  },
  importBatch: (ops, accs, cats) => set((s) => ({
    accounts: [...s.accounts, ...accs], categories: [...s.categories, ...cats], operations: [...s.operations, ...ops]
  }))
}), { name: 'balance-data-v2' }));
export type ScreenName = 'accounts' | 'accountForm' | 'analytics' | 'settings' | 'categories' | 'categoryForm' | 'search' | 'addButtons' | 'add';
export interface Scr { id: string; name: ScreenName; params?: any }
interface UI { stack: Scr[]; scope: string; toast: string | null; push: (n: ScreenName, p?: any) => void; pop: () => void; setScope: (s: string) => void; showToast: (m: string) => void }
let sid = 0;
export const useUI = create<UI>((set) => ({
  stack: [], scope: 'all', toast: null,
  push: (n, p) => set((s) => ({ stack: [...s.stack, { id: 's' + ++sid, name: n, params: p }] })),
  pop: () => set((s) => ({ stack: s.stack.slice(0, -1) })),
  setScope: (v) => set({ scope: v }),
  showToast: (m) => { set({ toast: m }); setTimeout(() => set({ toast: null }), 2200); }
}));
export const haptic = (ms = 8) => { try { navigator.vibrate?.(ms); } catch {} };