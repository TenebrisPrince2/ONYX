'use client';
import React, { useMemo, useState } from 'react';
import { subMonths, isSameMonth, parseISO, differenceInCalendarDays, format, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useData, useUI } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { monthRange, money, dailySeries } from '@/lib/calc';
import { CatIcon } from '@/components/ui';
import { tr } from '@/lib/i18n';
import { PeriodNav } from './Analytics';
function Card({ title, icon, iconColor, children, i }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 * i, type: 'spring', stiffness: 260, damping: 26 }}
      className="glass rounded-3xl p-4 flex flex-col min-h-[150px]">
      <div className="flex items-start justify-between">
        <span className="text-[14px] font-bold leading-tight max-w-[70%]">{title}</span>
        {icon && <CatIcon icon={icon} color={iconColor || '#8b9097'} s={30} is={16} />}
      </div>
      <div className="flex-1 flex flex-col items-center justify-end text-center pt-2">{children}</div>
    </motion.div>
  );
}
import { motion } from 'framer-motion';
function MiniChart({ a, b }: { a: number[]; b: number[] }) {
  const W = 340, H = 120, max = Math.max(1, ...a, ...b);
  const path = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${(i * W) / (arr.length - 1)},${H - (v / max) * (H - 10) - 5}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <path d={path(b)} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="2" />
      <path d={path(a)} fill="none" stroke="var(--exp)" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}
export function InsightsBody() {
  const { operations, categories, settings } = useData();
  const { scope } = useUI();
  const [anchor, setAnchor] = useState(new Date());
  const { s, e } = monthRange(anchor);
  const isCur = isSameMonth(anchor, new Date());
  const cur = settings.currency;
  const days = differenceInCalendarDays(e, s) + 1;
  const ops = useMemo(() => operations.filter((o) => { const d = parseISO(o.date); return d >= s && d <= e && (scope === 'all' || o.accountId === scope || o.toAccountId === scope); }), [operations, anchor, scope]);
  let inc = 0, exp = 0;
  const dayExp = Array(days).fill(0);
  const catCount = new Map<string, number>();
  for (const op of ops) {
    if (op.type === 'income') inc += op.amount;
    if (op.type === 'expense') { exp += op.amount; dayExp[differenceInCalendarDays(parseISO(op.date), s)] += op.amount; }
    if (op.categoryId) catCount.set(op.categoryId, (catCount.get(op.categoryId) || 0) + 1);
  }
  const net = inc - exp;
  const biggestExp = ops.filter((o) => o.type === 'expense').sort((a, b) => b.amount - a.amount)[0];
  const incOps = ops.filter((o) => o.type === 'income').sort((a, b) => b.amount - a.amount);
  const maxDay = Math.max(0, dayExp.indexOf(Math.max(...dayExp)));
  const maxDayDate = new Date(s.getFullYear(), s.getMonth(), s.getDate() + maxDay);
  let best = 0, bs = 0;
  for (let i = 0; i < days; i++) {
    if (dayExp[i] === 0) { let k = i; while (k > 0 && dayExp[k - 1] === 0) k--; if (i - k + 1 > best) { best = i - k + 1; bs = k; } }
  }
  const streakFrom = new Date(s.getFullYear(), s.getMonth(), s.getDate() + bs);
  const streakTo = new Date(s.getFullYear(), s.getMonth(), s.getDate() + bs + Math.max(0, best - 1));
  const weekendExp = dayExp.reduce((a: number, v: number, i: number) => { const d = new Date(s.getFullYear(), s.getMonth(), s.getDate() + i).getDay(); return a + (d === 0 || d === 6 ? v : 0); }, 0);
  const weekendPct = exp ? Math.round((weekendExp / exp) * 100) : 0;
  const top = [...catCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const topCat = categories.find((c) => c.id === top?.[0]);
  const avg = exp / days;
  const overspend = inc > 0 && exp > inc ? Math.round(((exp - inc) / inc) * 100) : null;
  const saved = inc > 0 && exp <= inc ? Math.round(((inc - exp) / inc) * 100) : null;
  const prev = monthRange(subMonths(anchor, 1));
  const curSeries = dailySeries(operations, s, e, scope, 'expense');
  const prevSeries = dailySeries(operations, prev.s, prev.e, scope, 'expense');
  const dayLabel = (d: Date) => isSameDay(d, new Date()) ? tr('today') : format(d, 'd MMMM', { locale: ru });
  const catOf = (id?: string | null) => categories.find((c) => c.id === id);
  return (
    <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <div className="flex justify-center pt-1 pb-2"><PeriodNav anchor={anchor} setAnchor={setAnchor} isCur={isCur} /></div>
      <div className="text-center pt-3 text-[44px] font-extrabold tracking-[-0.03em] tabular-nums">{money(net, cur)}</div>
      <div className="px-8 pt-3">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex">
          <div className="h-full" style={{ background: 'var(--exp)', width: `${exp + inc ? (exp / (exp + inc)) * 100 : 100}%` }} />
          <div className="h-full flex-1" style={{ background: 'var(--inc)' }} />
        </div>
        {overspend != null && <div className="text-center pt-2 text-[14px] font-semibold text-exp">{tr('overspendTxt').replace('{n}', String(overspend))}</div>}
        {saved != null && <div className="text-center pt-2 text-[14px] font-semibold text-inc">{tr('savedTxt').replace('{n}', String(saved))}</div>}
      </div>
      <div className="pt-5 space-y-3">
        <div className="glass rounded-3xl p-4">
          <MiniChart a={curSeries} b={prevSeries} />
          <div className="flex justify-center gap-6 pt-2 text-[14px] font-bold">
            <span className="text-exp">— {money(curSeries.reduce((x, y) => x + y, 0), cur)}</span>
            <span className="text-mut">— {money(prevSeries.reduce((x, y) => x + y, 0), cur)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card i={0} title={tr('avgDay')} icon="calendar"><div className="text-[24px] font-extrabold text-exp">{money(avg, cur)}</div></Card>
          <Card i={1} title={tr('biggestExp')}>
            {biggestExp ? (<>
              <CatIcon icon={catOf(biggestExp.categoryId)?.icon ?? 'slash'} color={catOf(biggestExp.categoryId)?.color ?? '#ff453a'} s={44} is={20} />
              <div className="text-[13px] font-semibold pt-2">{catOf(biggestExp.categoryId)?.name ?? tr('noCategory')}</div>
              <div className="text-[22px] font-extrabold text-exp">{money(biggestExp.amount, cur)}</div>
            </>) : <div className="text-mut">—</div>}
          </Card>
          <Card i={2} title={tr('biggestInc')}>
            {incOps[0] ? (<>
              <CatIcon icon={catOf(incOps[0].categoryId)?.icon ?? 'banknote'} color={catOf(incOps[0].categoryId)?.color ?? '#30d158'} s={44} is={20} />
              <div className="text-[13px] font-semibold pt-2">{catOf(incOps[0].categoryId)?.name ?? tr('income')}</div>
              <div className="text-[22px] font-extrabold text-inc">{money(incOps[0].amount, cur)}</div>
            </>) : <div className="text-mut">—</div>}
          </Card>
          <Card i={3} title={tr('expensiveDay')} icon="bag"><div className="text-[13px] text-mut font-medium">{dayLabel(maxDayDate)}</div><div className="text-[24px] font-extrabold text-exp">{money(dayExp[maxDay], cur)}</div></Card>
          <Card i={4} title={tr('noSpend')} icon="flame" iconColor="#ff453a"><div className="text-[12px] text-mut font-medium">{format(streakFrom, 'd MMMM', { locale: ru })} – {format(streakTo, 'd MMMM', { locale: ru })}</div><div className="text-[28px] font-extrabold">{best}</div></Card>
          <Card i={5} title={tr('weekend')} icon="umbrella"><div className="text-[12px] text-mut font-medium">{tr('weekendTxt').replace('{n}', String(weekendPct))}</div><div className="text-[28px] font-extrabold">{weekendPct}%</div></Card>
          <Card i={6} title={tr('opsCount')}><div className="text-[12px] text-mut font-medium">{tr('opsCountTxt')}</div><div className="text-[28px] font-extrabold">{ops.length}</div></Card>
          <Card i={7} title={tr('topCat')}>{topCat ? (<>
            <CatIcon icon={topCat.icon} color={topCat.color} s={40} is={19} />
            <div className="text-[13px] font-semibold pt-1">{topCat.name}</div>
            <div className="text-[28px] font-extrabold">{top![1]}</div>
          </>) : <div className="text-mut">—</div>}</Card>
        </div>
      </div>
    </div>
  );
}