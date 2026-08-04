// src/lib/calc.ts
import { startOfMonth, endOfMonth, differenceInCalendarDays, parseISO, startOfDay, endOfDay, startOfWeek, subDays } from 'date-fns';
import type { Operation } from './types';
import { CURRENCIES } from './meta';

export function evalExpr(s: string): number {
  const tokens = s.match(/\d+(?:[.,]\d+)?|[+−×÷]/g) || [];
  const vals: number[] = []; const ops: string[] = [];
  const push = (n: number) => {
    if (ops.length && (ops[ops.length - 1] === '×' || ops[ops.length - 1] === '÷')) {
      const op = ops.pop()!; const a = vals.pop() ?? 0; vals.push(op === '×' ? a * n : a / n);
    } else vals.push(n);
  };
  for (const t of tokens) {
    if (/[0-9.,]/.test(t[0])) push(parseFloat(t.replace(',', '.')));
    else if (t === '*') ops.push('×'); else if (t === '/') ops.push('÷'); else if (t === '-') ops.push('−'); else ops.push(t);
  }
  let sum = vals[0] ?? 0;
  for (let i = 1; i < vals.length; i++) sum += ops[i - 1] === '−' ? -vals[i] : vals[i];
  return isFinite(sum) ? Math.round(sum * 100) / 100 : 0;
}

export const fmtNum = (v: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(v);
export const money = (v: number, cur: string) => `${fmtNum(v)} ${CURRENCIES[cur]?.sym ?? cur}`;
export const monthRange = (a: Date) => ({ s: startOfMonth(a), e: endOfMonth(a) });
export const inRange = (op: Operation, s: Date, e: Date) => { const d = parseISO(op.date); return d >= s && d <= e; };

export function accountBalance(accId: string, ops: Operation[]): number {
  let b = 0;
  for (const op of ops) {
    if (op.type === 'income' && op.accountId === accId) b += op.amount;
    else if (op.type === 'expense' && op.accountId === accId) b -= op.amount;
    else if (op.type === 'transfer') { if (op.accountId === accId) b -= op.amount; if (op.toAccountId === accId) b += op.amount; }
    else if (op.type === 'adjust' && op.accountId === accId) b += op.amount;
  }
  return b;
}

export const scopeOps = (ops: Operation[], scope: string) => scope === 'all' ? ops : ops.filter((o) => o.accountId === scope || o.toAccountId === scope);

export function periodIE(ops: Operation[], s: Date, e: Date, scope: string) {
  let inc = 0, exp = 0;
  for (const op of scopeOps(ops, scope)) {
    if (!inRange(op, s, e)) continue;
    if (op.type === 'income') inc += op.amount;
    else if (op.type === 'expense') exp += op.amount;
  }
  return { inc, exp };
}

export function dailySeries(ops: Operation[], s: Date, e: Date, scope: string, type: 'income' | 'expense', filter?: (op: Operation) => boolean) {
  const days = differenceInCalendarDays(e, s) + 1;
  const arr = Array(days).fill(0);
  for (const op of scopeOps(ops, scope)) {
    if (!inRange(op, s, e) || op.type !== type || (filter && !filter(op))) continue;
    arr[differenceInCalendarDays(parseISO(op.date), s)] += op.amount;
  }
  return arr;
}

export const nice = (v: number) => (v <= 0 ? 0 : Math.ceil(v / 3) * 3 || 3);

export const PERIODS: { id: string; key: string }[] = [
  { id: 'day', key: 'pDay' }, { id: 'week', key: 'pWeek' }, { id: '2w', key: 'p2w' },
  { id: 'month', key: 'pMonth' }, { id: 'year', key: 'pYear' }, { id: '7d', key: 'p7' },
  { id: '30d', key: 'p30' }, { id: 'all', key: 'pAll' }
];

export function periodRange(id: string, ops: Operation[], customs: { id: string; s: string; e: string }[]) {
  const now = new Date(); const e = endOfDay(now);
  switch (id) {
    case 'day': return { s: startOfDay(now), e };
    case 'week': return { s: startOfWeek(now, { weekStartsOn: 1 }), e };
    case '2w': return { s: startOfDay(subDays(now, 13)), e };
    case 'month': return { s: startOfMonth(now), e };
    case 'year': return { s: new Date(now.getFullYear(), 0, 1), e };
    case '7d': return { s: startOfDay(subDays(now, 6)), e };
    case '30d': return { s: startOfDay(subDays(now, 29)), e };
    case 'all': { const f = ops.length ? parseISO([...ops].sort((a, b) => a.date.localeCompare(b.date))[0].date) : now; return { s: startOfDay(f), e }; }
    default: { const c = customs.find((c) => c.id === id); return c ? { s: startOfDay(parseISO(c.s)), e: endOfDay(parseISO(c.e)) } : { s: startOfMonth(now), e }; }
  }
}