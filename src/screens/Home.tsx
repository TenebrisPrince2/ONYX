'use client';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { format, parseISO, isSameDay, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useData, useUI, haptic } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { PERIODS, periodRange, periodIE, scopeOps, accountBalance, money } from '@/lib/calc';
import { cx, CatIcon, Num, BottomSheet, BigButton, SPRING } from '@/components/ui';
import { tr } from '@/lib/i18n';
import { OpRow } from './Ops';
import { InsightsBody } from './Insights';
import { VoiceInputSheet } from '@/components/VoiceInput';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export default function Home() {
  const { accounts, operations, settings, setSettings } = useData();
  const { push, scope } = useUI();
  const [period, setPeriod] = useState('month'); // Default to this month instead of 'all'
  const [menu, setMenu] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const scopeAcc = accounts.find((a) => a.id === scope);
  const { s, e } = useMemo(() => periodRange(period, operations, settings.customPeriods), [period, operations, settings.customPeriods]);
  const ops = useMemo(() => scopeOps(operations, scope).filter((o) => { const d = parseISO(o.date); return d >= s && d <= e; }), [operations, scope, s, e]);
  const { inc, exp } = periodIE(operations, s, e, scope);
  const totalAll = scope === 'all'
    ? accounts.filter((a) => !a.hidden).reduce((t, a) => t + accountBalance(a.id, operations), 0)
    : accountBalance(scope, operations);
  const big = period === 'all' ? totalAll : inc - exp;
  const cur = scopeAcc?.currency ?? settings.currency;
  const custom = settings.customPeriods.find((c) => c.id === period);
  const label = period === 'all' ? tr('pAll') : custom?.label ?? tr(PERIODS.find((p) => p.id === period)?.key ?? 'pAll');
  const groups = useMemo(() => {
    const m = new Map<string, typeof ops>();
    [...ops].sort((a, b) => b.date.localeCompare(a.date)).forEach((o) => { const k = o.date.slice(0, 10); if (!m.has(k)) m.set(k, []); m.get(k)!.push(o); });
    return [...m.entries()];
  }, [ops]);
  const dayNet = (list: typeof ops) => list.reduce((t, o) => t + (o.type === 'income' ? o.amount : o.type === 'expense' ? -o.amount : 0), 0);
  return (
    <div className="min-h-dvh pb-40">
      {/* шапка */}
      <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button onClick={() => push('accounts')} className="flex items-center gap-2.5 glass rounded-full pl-2 pr-4 h-12 active:scale-95 transition-transform">
          <CatIcon icon={scopeAcc?.icon ?? 'coins'} color={scopeAcc?.color ?? '#30d158'} s={34} is={16} />
          <span className="text-left leading-tight">
            <span className="block text-[15px] font-bold">{scopeAcc?.name ?? tr('allAccounts')}</span>
            <span className="block text-[12px] text-mut font-semibold tabular-nums">{money(totalAll, cur)}</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center glass rounded-full px-1">
            <button onClick={() => push('search')} className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform"><Icon n="search" s={20} /></button>
            <button onClick={() => push('analytics')} className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform"><Icon n="pie" s={20} /></button>
          </div>
          <button onClick={() => push('accounts')} className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-90 transition-transform"><Icon n="coins" s={20} /></button>
          <button onClick={() => push('settings')} className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-90 transition-transform"><Icon n="gear" s={20} /></button>
        </div>
      </div>
      {/* период */}
      <div className="flex items-center justify-center gap-2 pt-7 relative z-40">
        <span className="text-[15px] font-semibold text-mut">{tr('balanceFor')}</span>
        <div className="relative">
          <button onClick={() => setMenu(!menu)} className="h-10 px-4 rounded-2xl card text-[15px] font-bold active:scale-95 transition-transform">{label}</button>
          <AnimatePresence>
            {menu && (<>
              <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
              <motion.div initial={{ opacity: 0, scale: .94, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96, y: -6 }} transition={SPRING}
                className="absolute left-1/2 -translate-x-1/2 top-12 z-50 w-64 glass-strong rounded-2xl overflow-hidden py-1 max-h-[70dvh] overflow-y-auto no-scrollbar">
                {PERIODS.map((p) => (
                  <button key={p.id} onClick={() => { haptic(6); setPeriod(p.id); setMenu(false); }} className="w-full flex items-center px-5 h-12 text-[16px] font-semibold active:bg-white/5 border-b border-white/5 last:border-0">
                    <span className="flex-1 text-left">{tr(p.key)}</span>
                    {period === p.id && <Icon n="check" s={18} w={2.4} />}
                  </button>
                ))}
                <div className="px-5 pt-3 pb-1 text-[13px] font-semibold text-mut">{tr('pCustom')}</div>
                {settings.customPeriods.map((c) => (
                  <div key={c.id} className="flex items-center border-b border-white/5">
                    <button onClick={() => { setPeriod(c.id); setMenu(false); }} className="flex-1 flex items-center px-5 h-12 text-[16px] font-semibold active:bg-white/5">
                      <span className="flex-1 text-left truncate">{c.label}</span>{period === c.id && <Icon n="check" s={18} w={2.4} />}
                    </button>
                    <button onClick={() => { setSettings({ customPeriods: settings.customPeriods.filter((x) => x.id !== c.id) }); if (period === c.id) setPeriod('all'); }} className="px-3 text-mut"><Icon n="close" s={14} /></button>
                  </div>
                ))}
                <button onClick={() => { setMenu(false); setCustomOpen(true); }} className="w-full flex items-center px-5 h-12 text-[16px] font-semibold active:bg-white/5">
                  <span className="flex-1 text-left">{tr('pAdd')}</span><Icon n="plus" s={18} />
                </button>
              </motion.div>
            </>)}
          </AnimatePresence>
        </div>
      </div>
      {/* герой */}
      <div className="text-center pt-4 text-[56px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">
        <Num value={big} f={(v) => money(Math.round(v * 100) / 100, cur)} />
      </div>
      <div className="flex items-center justify-center gap-5 pt-4">
        <span className="flex items-center gap-2 text-[17px] font-bold text-inc"><span className="w-6 h-6 rounded-full bg-inc/20 flex items-center justify-center"><Icon n="arrowDL" s={13} w={2.4} /></span>{money(inc, cur)}</span>
        <span className="flex items-center gap-2 text-[17px] font-bold"><span className="w-6 h-6 rounded-full bg-exp/20 text-exp flex items-center justify-center"><Icon n="arrowUR" s={13} w={2.4} /></span>{money(exp, cur)}</span>
      </div>
      <InsightsHandle />
      {/* операции */}
      <div className="px-4 pt-5 space-y-2">
        {!ops.length && (
          <div className="text-center pt-16 space-y-2">
            <div className="text-[17px] font-bold">{tr('noOps')}</div>
            <div className="text-[14px] text-mut px-10 leading-6">{tr('noOpsHint')}</div>
          </div>
        )}
        {groups.map(([k, list]) => {
          const d = parseISO(k);
          const net = dayNet(list);
          const suffix = isSameDay(d, new Date()) ? ` - ${tr('today')}` : isSameDay(d, subDays(new Date(), 1)) ? ` - ${tr('yesterday')}` : '';
          return (
            <React.Fragment key={k}>
              <div className="flex items-center justify-between px-1 pt-3 pb-1">
                <span className="text-[13px] font-semibold text-mut">{cap(format(d, 'EEE, d MMMM', { locale: ru }))}{suffix}</span>
                <span className={cx('text-[13px] font-bold tabular-nums', net > 0 ? 'text-inc' : 'text-mut')}>{net > 0 ? '+' : ''}{money(net, cur)}</span>
              </div>
              {list.map((o) => <OpRow key={o.id} id={o.id} />)}
            </React.Fragment>
          );
        })}
      </div>
      <FabCluster onVoice={() => setVoiceOpen(true)} />
      <AnimatePresence>
        {customOpen && <CustomPeriodSheet onClose={() => setCustomOpen(false)} onSaved={(id) => setPeriod(id)} />}
        {voiceOpen && <VoiceInputSheet onClose={() => setVoiceOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
function CustomPeriodSheet({ onClose, onSaved }: any) {
  const { settings, setSettings } = useData();
  const [from, setFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const save = () => {
    const id = 'c' + Date.now();
    const label = `${format(parseISO(from), 'd.MM.yy')} – ${format(parseISO(to), 'd.MM.yy')}`;
    setSettings({ customPeriods: [...settings.customPeriods, { id, label, s: from, e: to }] });
    onSaved(id); onClose();
  };
  return (
    <BottomSheet onClose={onClose}>
      <div className="p-5 pt-3 space-y-4">
        <div className="text-[17px] font-bold">{tr('pCustom')}</div>
        <div className="grid grid-cols-2 gap-3">
          {[[tr('from'), from, setFrom], [tr('to'), to, setTo]].map(([l, v, set]: any) => (
            <label key={l} className="card rounded-2xl p-3 space-y-1">
              <span className="text-[12px] font-semibold text-mut">{l}</span>
              <input type="date" value={v} onChange={(e) => set(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-bold [color-scheme:dark]" />
            </label>
          ))}
        </div>
        <BigButton onClick={save} disabled={parseISO(from) > parseISO(to)}>{tr('save')}</BigButton>
      </div>
    </BottomSheet>
  );
}
/* ─── Инсайты: ручка-панель (п.12) ─── */
function InsightsHandle() {
  const ref = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<'idle' | 'live' | 'open'>('idle');
  const [top, setTop] = useState(0);
  const p = useMotionValue(0);
  const scale = useTransform(p, [0, 1], [1, 1.1]);
  const glow = useTransform(p, [0, 1], [0, .7]);
  const panelTop = useTransform(p, [0, 1], [top + 24, 0]);
  const radius = useTransform(p, [0, 1], [32, 0]);
  const dim = useTransform(p, [0, 1], [0, .65]);
  const grab = () => { if (phase === 'idle' && ref.current) { setTop(ref.current.getBoundingClientRect().top); setPhase('live'); } };
  const commit = (vel: number) => {
    if (p.get() > 0.4 || vel > 500) { haptic(12); setPhase('open'); animate(p, 1, { type: 'spring', stiffness: 240, damping: 30 }); }
    else animate(p, 0, { type: 'spring', stiffness: 300, damping: 30 }).on('complete', () => setPhase('idle'));
  };
  const close = () => { setPhase('live'); animate(p, 0, { type: 'spring', stiffness: 240, damping: 32 }).on('complete', () => setPhase('idle')); };
  const tap = () => {
    if (phase !== 'idle') return;
    if (ref.current) setTop(ref.current.getBoundingClientRect().top);
    setPhase('open'); haptic(10);
    animate(p, 1, { type: 'spring', stiffness: 200, damping: 26 });
  };
  return (<>
    <div className="flex justify-center pt-5">
      <motion.button ref={ref} style={{ scale }} whileTap={{ scale: .95 }} onClick={tap}
        drag={phase !== 'open' ? 'y' : false} dragConstraints={{ top: 0, bottom: 300 }} dragElastic={0.9} dragMomentum={false}
        onDragStart={grab}
        onDrag={(_, i) => { if (phase === 'live') p.set(Math.min(1, Math.max(0, i.offset.y / 240))); }}
        onDragEnd={(_, i) => { if (phase === 'live') commit(i.velocity.y); }}
        className="relative flex items-center gap-2 h-11 px-5 rounded-2xl card text-[15px] font-semibold">
        <motion.span style={{ opacity: glow }} className="absolute -inset-1 rounded-2xl bg-inc/25 blur-lg pointer-events-none" />
        <Icon n="spark" s={16} c="text-inc" />{tr('insights')}
      </motion.button>
    </div>
    {phase !== 'idle' && (
      <div className="fixed inset-0 z-50">
        <motion.div className="absolute inset-0 bg-black" style={{ opacity: dim }} onClick={close} />
        <motion.div className="absolute inset-x-0 bottom-0 glass-strong overflow-hidden flex flex-col" style={{ top: panelTop, borderRadius: radius }}>
          <motion.div className="shrink-0 pt-2.5 pb-1 flex flex-col items-center cursor-grab"
            drag={phase === 'open' ? 'y' : false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: .5, bottom: 0 }}
            onDragEnd={(_, i) => { if (i.offset.y < -60 || i.velocity.y < -400) close(); }}>
            <div className="w-9 h-[5px] rounded-full bg-white/20" />
            <div className="flex items-center gap-2 pt-2 pb-1 text-[15px] font-bold"><Icon n="spark" s={16} c="text-inc" />{tr('insights')}</div>
          </motion.div>
          {phase === 'open' && <div className="flex-1 overflow-y-auto no-scrollbar"><InsightsBody /></div>}
        </motion.div>
      </div>
    )}
  </>);
}
/* ─── FAB-кластер ─── */
function FabCluster({ onVoice }: { onVoice?: () => void }) {
  const { settings } = useData();
  const push = useUI((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);
  const cfg = settings.addBtn;
  const go = (id: string) => {
    haptic(10);
    if (id === 'manual') push('add');
    else if (id === 'voice') onVoice?.();
    else fileRef.current?.click();
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    readImg(f, (img) => push('add', { img }));
    e.target.value = '';
  };
  const acts: { id: string; icon: string }[] = [];
  if (cfg.scan) acts.push({ id: 'scan', icon: 'scan' });
  acts.push({ id: 'manual', icon: 'plus' });
  if (cfg.voice) acts.push({ id: 'voice', icon: 'mic' });
  const main = acts.find((a) => a.id === cfg.main) ?? acts[Math.floor(acts.length / 2)];
  const sides = acts.filter((a) => a !== main);
  const order = sides.length === 2 ? [sides[0], main, sides[1]] : sides.length === 1 ? [sides[0], main] : [main];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center items-center gap-4 pb-[calc(env(safe-area-inset-bottom)+22px)]">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
      {order.map((a) => (
        <motion.button key={a.id} whileTap={{ scale: 0.86 }} onClick={() => go(a.id)}
          className={cx('pointer-events-auto rounded-full bg-txt text-black flex items-center justify-center shadow-[0_16px_40px_rgba(0,0,0,.6),inset_0_-2px_6px_rgba(0,0,0,.15)]',
            a.id === main.id ? 'w-20 h-20' : 'w-14 h-14')}>
          <Icon n={a.icon} s={a.id === main.id ? 30 : 22} w={2} />
        </motion.button>
      ))}
    </div>
  );
}
function readImg(f: File, cb: (s: string) => void) {
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 900 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', 0.72));
    };
    img.src = String(r.result);
  };
  r.readAsDataURL(f);
}