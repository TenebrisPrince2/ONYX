import { parseISO, parse as fparse } from 'date-fns';
import type { Account, Category, Operation, Settings } from './types';
import { uid, PALETTE } from './meta';
export function parseCsv(text: string): string[][] {
  const firstLine = text.slice(0, text.indexOf('\n') >= 0 ? text.indexOf('\n') : text.length);
  const delim = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = []; let row: string[] = []; let cur = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === delim) { row.push(cur.trim()); cur = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur.trim()); cur = ''; if (row.some((c) => c !== '')) rows.push(row); row = []; }
    else cur += ch;
  }
  row.push(cur.trim()); if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}
export function parseAmount(s: string | undefined): number {
  if (!s) return 0;
  const clean = s.replace(/[^\d.,-]/g, '').replace(/.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const v = parseFloat(clean);
  return isFinite(v) ? Math.round(v * 100) / 100 : 0;
}
export function parseDateLoose(s: string | undefined): Date | null {
  if (!s) return null;
  const t = s.trim();
  for (const fmt of ['yyyy-MM-dd', 'dd.MM.yyyy', 'dd/MM/yyyy', 'd MMMM yyyy', 'yyyy/MM/dd', 'dd.MM.yy']) {
    const d = fparse(t, fmt, new Date());
    if (!isNaN(d.getTime())) return d;
  }
  const iso = parseISO(t);
  return isNaN(iso.getTime()) ? null : iso;
}
const CUR = (s?: string) => {
  if (!s) return null;
  const t = s.toLowerCase();
  if (/byn|бр|\bbr\b|бел/.test(t)) return 'BYN';
  if (/rub|руб|₽|рос/.test(t)) return 'RUB';
  return null;
};
export function mapCsv(text: string, ctx: { accounts: Account[]; categories: Category[]; settings: Settings }) {
  const rows = parseCsv(text); if (!rows.length) return null;
  const head = rows[0].map((h) => h.toLowerCase());
  const hasHeader = head.some((h) => /date|дата|amount|сумм|type|тип|categ|категор|account|счет|счёт|note|замет|curr|валют|sign|знак/.test(h));
  const idx = (re: RegExp) => head.findIndex((h) => re.test(h));
  const iDate = hasHeader ? idx(/date|дата/) : -1;
  const iAmount = hasHeader ? idx(/amount|сумм/) : -1;
  const iType = hasHeader ? idx(/type|тип|sign|знак|напр/) : -1;
  const iCat = hasHeader ? idx(/categ|категор/) : -1;
  const iAcc = hasHeader ? idx(/account|счет|счёт/) : -1;
  const iNote = hasHeader ? idx(/note|замет|comment|коммент|desc|опис/) : -1;
  const iCur = hasHeader ? idx(/curr|валют/) : -1;
  const body = hasHeader ? rows.slice(1) : rows;
  const accs = [...ctx.accounts]; const cats = [...ctx.categories];
  const ops: Operation[] = [];
  let colorI = 0;
  const findAcc = (name?: string) => {
    const n = (name ?? '').toLowerCase();
    let a = accs.find((x) => x.name.toLowerCase() === n);
    if (!a) { a = { id: uid(), name: name?.trim() || ctx.settings.currency === 'RUB' ? (name || 'Счёт') : (name || 'Счёт'), color: PALETTE[colorI++ % PALETTE.length], icon: 'wallet', currency: ctx.settings.currency, start: 0, hidden: false, order: accs.length }; a.name = name?.trim() || 'Счёт'; accs.push(a); }
    return a;
  };
  const findCat = (name: string, type: 'income' | 'expense') => {
    const n = name.toLowerCase();
    let c = cats.find((x) => x.name.toLowerCase() === n && x.type === type);
    if (!c) { c = { id: uid(), name: name.trim(), color: PALETTE[colorI++ % PALETTE.length], icon: type === 'income' ? 'banknote' : 'tag', type, parentId: null, order: cats.length }; cats.push(c); }
    return c;
  };
  for (const r of body) {
    let amount = iAmount >= 0 ? parseAmount(r[iAmount]) : 0;
    if (!amount) { const cell = r.find((c) => /^[-+]?[\d\s]+([.,]\d+)?$/.test(c?.trim() ?? '')); if (cell) amount = parseAmount(cell); }
    if (!amount) continue;
    const typeCell = iType >= 0 ? (r[iType] ?? '').toLowerCase() : '';
    let type: 'income' | 'expense' = 'expense';
    if (/income|доход|credit|приход|\+/.test(typeCell)) type = 'income';
    else if (/expense|расход|debit|трата|−|-/.test(typeCell)) type = 'expense';
    else if (iAmount >= 0 && /^[-−]/.test((r[iAmount] ?? '').trim())) type = 'expense';
    else if (iAmount >= 0 && /^[+]/.test((r[iAmount] ?? '').trim())) type = 'income';
    amount = Math.abs(amount);
    const date = parseDateLoose(iDate >= 0 ? r[iDate] : r[0]) ?? new Date();
    const cur = CUR(iCur >= 0 ? r[iCur] : undefined) ?? ctx.settings.currency;
    const acc = findAcc(iAcc >= 0 ? r[iAcc] : undefined);
    const catName = iCat >= 0 ? (r[iCat] ?? '').trim() : '';
    const op: Operation = {
      id: uid(), type, amount, currency: cur, accountId: acc.id,
      categoryId: catName ? findCat(catName, type).id : null,
      note: iNote >= 0 ? (r[iNote] ?? '') : '', date: date.toISOString(), createdAt: Date.now()
    };
    ops.push(op);
  }
  const newAccs = accs.filter((a) => !ctx.accounts.includes(a));
  const newCats = cats.filter((c) => !ctx.categories.includes(c));
  return { ops, newAccs, newCats };
}
export function downloadFile(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}