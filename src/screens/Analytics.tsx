'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { subMonths, isSameMonth, parseISO, differenceInCalendarDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useData, useUI, haptic } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { dailySeries, monthRange, money, fmtNum, nice } from '@/lib/calc';
import { FullSheet, CatIcon, cx } from '@/components/ui';
import { tr } from '@/lib/i18n';
import type { Operation } from '@/lib/types';

const inR = (op: Operation, s: Date, e: Date) => { const d = parseISO(op.date); return d >= s && d <= e; };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Analytics() {
  const { operations, categories, settings } = useData();
  const { pop, scope } = useUI();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [kind, setKind] = useState<'line' | 'donut'>('line');
  const [anchor, setAnchor] = useState(new Date());
  const [selDay, setSelDay] = useState<number | null>(null);
  const [focusCat, setFocusCat] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [compare, setCompare] = useState(false);

  const { s, e } = monthRange(anchor);
  const cur = settings.currency;
  const isCur = isSameMonth(anchor, new Date());
  const days = differenceInCalendarDays(e, s) + 1;

  const catFilter = (op: Operation) => {
    if (op.type !== type) return false;
    if (focusCat) return op.categoryId === focusCat;
    return !excluded.includes(op.categoryId ?? '__none');
  };
  const series = useMemo(() => dailySeries(operations, s, e, scope, type, catFilter), [operations, anchor, scope, type, focusCat, excluded]);
  const prevSeries = useMemo(() => { const p = monthRange(subMonths(anchor, 1)); return dailySeries(operations, p.s, p.e, scope, type, catFilter); }, [operations, anchor, scope, type, focusCat, excluded]);
  const total = series.reduce((a, b) => a + b, 0);
  const avg = total / days;
  const color = type === 'expense' ? 'var(--exp)' : 'var(--inc)';

  const breakdown = useMemo(() => {
    const m = new Map<string, number>();
    for (const op of operations) {
      if (!inR(op, s, e) || op.type !== type) continue;
      if (scope !== 'all' && op.accountId !== scope && op.toAccountId !== scope) continue;
      const k = op.categoryId ?? '__none';
      if (excluded.includes(k)) continue;
      m.set(k, (m.get(k) || 0) + op.amount);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [operations, anchor, scope, type, excluded]);
  const shownTotal = focusCat ? breakdown.find(([k]) => k === focusCat)?.[1] ?? 0 : breakdown.reduce((a, [, v]) => a + v, 0);

  return (
    <FullSheet>
      <div className="flex items-center justify-between px-4 pt-2">
        <button onClick={pop} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="close" s={20} /></button>
        <span className="text-[18px] font-bold">Аналитика</span>
        <button onClick={() => { haptic(); setKind(kind === 'line' ? 'donut' : 'line'); }} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n={kind === 'line' ? 'pie' : 'chart'} s={20} /></button>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4 px-4 flex-wrap">
        <div className="flex items-center glass rounded-full p-1">
          <button onClick={() => { haptic(); setType('income'); setFocusCat(null); }} className="h-9 px-4 rounded-full text-[15px] font-bold transition-all"
            style={{ color: type === 'income' ? 'var(--inc)' : 'var(--mut)', background: type === 'income' ? 'rgba(48,209,88,.14)' : 'transparent' }}>
            <span className="flex items-center gap-1.5"><Icon n="arrowDL" s={15} />{type === 'income' ? tr('income') : ''}</span>
          </button>
          <button onClick={() => { haptic(); setType('expense'); setFocusCat(null); }} className="h-9 px-4 rounded-full text-[15px] font-bold transition-all"
            style={{ color: type === 'expense' ? 'var(--exp)' : 'var(--mut)', background: type === 'expense' ? 'rgba(255,69,58,.14)' : 'transparent' }}>
            <span className="flex items-center gap-1.5"><Icon n="arrowUR" s={15} />{type === 'expense' ? tr('expense') : ''}</span>
          </button>
        </div>
        {kind === 'line' && (
          <button onClick={() => setCompare(!compare)} className={cx('w-11 h-11 rounded-full flex items-center justify-center transition-colors', compare ? 'bg-white/15' : 'card text-mut')}><Icon n="swap" s={18} /></button>
        )}
        <PeriodNav anchor={anchor} setAnchor={setAnchor} isCur={isCur} />
      </div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-mut text-[15px]">{tr('noData')}</div>
      ) : kind === 'line' ? (
        <>
          <LineChart series={series} prev={compare ? prevSeries : null} color={color} avg={avg} sel={selDay} setSel={setSelDay} />
          <div className="flex items-center justify-center gap-2 pb-3 text-[17px] font-bold" style={{ color }}>
            <Icon n={type === 'expense' ? 'arrowUR' : 'arrowDL'} s={16} />
            {money(selDay != null ? series[selDay] ?? 0 : 0, cur)}
          </div>
        </>
      ) : (
        <Donut breakdown={breakdown} cats={categories} total={shownTotal} cur={cur} />
      )}

      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] space-y-2 overflow-auto">
        <div className="flex items-center glass rounded-2xl px-4 py-4">
          <span className="flex-1 text-[16px] font-bold">{tr('allCategories')}</span>
          <span className="text-[16px] font-bold tabular-nums">{money(shownTotal, cur)}</span>
        </div>
        {breakdown.map(([k, v]) => {
          const cat = categories.find((c) => c.id === k);
          const active = focusCat === k;
          return (
            <div key={k} onClick={() => { haptic(5); setFocusCat(active ? null : k); }}
              className={cx('flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors', active ? '' : 'card active:bg-white/8')}
              style={active ? { background: (cat?.color ?? '#8b9097') + '2b' } : undefined}>
              <CatIcon icon={cat?.icon ?? 'slash'} color={cat?.color ?? '#8b9097'} s={40} is={19} />
              <span className="flex-1 text-[15px] font-bold" style={active ? { color: cat?.color } : undefined}>{cat?.name ?? tr('noCategory')}</span>
              <span className="text-[15px] font-bold tabular-nums">{money(v, cur)}</span>
              <button onClick={(ev) => { ev.stopPropagation(); setExcluded(excluded.includes(k) ? excluded.filter((x) => x !== k) : [...excluded, k]); }}
                className={cx('w-8 h-8 rounded-full flex items-center justify-center transition-colors', excluded.includes(k) ? 'bg-white/10 text-mut' : 'bg-txt text-black')}>
                <Icon n="check" s={15} w={2.4} />
              </button>
            </div>
          );
        })}
      </div>
    </FullSheet>
  );
}

export function PeriodNav({ anchor, setAnchor, isCur }: any) {
  const label = isSameMonth(anchor, new Date()) ? tr('thisMonth') : cap(format(anchor, 'LLLL', { locale: ru }));
  return (
    <div className="flex items-center glass rounded-full px-1 py-1">
      <button className="w-8 h-8 flex items-center justify-center active:opacity-60" onClick={() => setAnchor(subMonths(anchor, 1))}><Icon n="back" s={15} /></button>
      <span className="text-[14px] font-bold px-1 min-w-[96px] text-center">{label}</span>
      <button className="w-8 h-8 flex items-center justify-center disabled:opacity-30" disabled={isCur} onClick={() => setAnchor(subMonths(anchor, -1))}><Icon n="chevR" s={15} /></button>
    </div>
  );
}

function LineChart({ series, prev, color, avg, sel, setSel }: any) {
  const { settings } = useData();
  const W = 360, H = 190, PL = 34, PR = 10, PT = 14, PB = 26;
  const max = nice(Math.max(...series, ...(prev || [0]), 1));
  const n = series.length;
  const x = (i: number) => PL + (i * (W - PL - PR)) / (n - 1);
  const y = (v: number) => PT + (1 - v / max) * (H - PT - PB);
  const path = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const ref = React.useRef<SVGSVGElement>(null);
  const tap = (ev: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - PL) / (W - PL - PR)) * (n - 1));
    setSel(sel === i ? null : Math.max(0, Math.min(n - 1, i)));
  };
  return (
    <div className="px-3 pt-2">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full" onPointerDown={tap}>
        {[1, 2 / 3, 1 / 3].map((f, i) => (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y(max * f)} y2={y(max * f)} stroke="rgba(255,255,255,.12)" strokeDasharray="3 4" strokeWidth="1" />
            <text x={4} y={y(max * f) + 3} fill="var(--mut)" fontSize="9">{fmtNum(max * f)}</text>
          </g>
        ))}
        <line x1={PL} x2={W - PR} y1={y(avg)} y2={y(avg)} stroke={color} strokeOpacity=".5" strokeDasharray="4 4" strokeWidth="1" />
        <text x={W - PR} y={y(avg) - 3} fill={color} fontSize="9" textAnchor="end">{tr('avg')} {fmtNum(avg)}</text>
        {prev && <path d={path(prev)} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2" />}
        <motion.path d={path(series)} fill="none" stroke={color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }} />
        {sel != null && <circle cx={x(sel)} cy={y(series[sel])} r="5" fill={color} stroke="#000" strokeWidth="2" />}
        {Array.from({ length: n }, (_, i) => i).filter((i) => i % 2 === 0).map((i) => (
          <text key={i} x={x(i)} y={H - 8} fontSize="8.5" fill="var(--mut)" textAnchor="middle">{i + 1}</text>
        ))}
      </svg>
    </div>
  );
}

function Donut({ breakdown, cats, total, cur }: any) {
  const R = 84, C = 2 * Math.PI * R;
  let off = 0;
  return (
    <div className="flex-1 flex items-center justify-center relative py-2">
      <svg viewBox="0 0 220 220" className="w-[78vw] max-w-[320px]">
        {breakdown.map(([k, v]: any) => {
          const cat = cats.find((c: any) => c.id === k);
          const frac = total ? v / total : 0;
          const el = (
            <circle key={k} cx="110" cy="110" r={R} fill="none" stroke={cat?.color ?? '#8b9097'} strokeWidth="30"
              strokeDasharray={`${Math.max(frac * C - 3, 0.5)} ${C}`} strokeDashoffset={-off * C} transform="rotate(-90 110 110)" strokeLinecap="round" />
          );
          off += frac; return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[13px] text-mut font-semibold">{tr('total')}</span>
        <span className="text-[28px] font-extrabold tabular-nums">{money(total, cur)}</span>
      </div>
    </div>
  );
}