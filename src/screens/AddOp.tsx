'use client';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useData, useUI, haptic } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { evalExpr, money, accountBalance, fmtNum } from '@/lib/calc';
import { CURRENCIES } from '@/lib/meta';
import { FullSheet, BottomSheet, CatIcon, cx, BigButton, Confirm, SPRING } from '@/components/ui';
import { tr } from '@/lib/i18n';
const STEP = 76;
/** Center Category Picker — нативное карусельное колесо */
export function CenterPicker({ items, value, onChange }: { items: { id: string; icon: string; color: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const kids = useRef<(HTMLDivElement | null)[]>([]);
  const centerId = useRef(value);
  const snapT = useRef<any>(null);
  const paint = () => {
    const el = ref.current; if (!el) return;
    const c = el.scrollLeft + el.clientWidth / 2;
    let best = '', bd = 1e9;
    kids.current.forEach((k, i) => {
      if (!k) return;
      const kc = k.offsetLeft + k.offsetWidth / 2;
      const d = Math.abs(kc - c) / STEP;
      k.style.transform = `scale(${Math.max(0.7, 1.24 - d * 0.26)})`;
      k.style.opacity = String(Math.max(0.28, 1 - d * 0.42));
      const l = k.lastElementChild as HTMLElement; if (l) l.style.opacity = String(Math.max(0, 1 - d * 1.5));
      if (Math.abs(kc - c) < bd) { bd = Math.abs(kc - c); best = items[i]?.id; }
    });
    if (best && best !== centerId.current) { centerId.current = best; haptic(6); }
  };
  const snap = () => {
    const el = ref.current; if (!el) return;
    const idx = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / STEP)));
    el.scrollTo({ left: idx * STEP, behavior: 'smooth' });
    onChange(items[idx]?.id ?? value);
  };
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const idx = Math.max(0, items.findIndex((i) => i.id === value));
    el.scrollLeft = idx * STEP; centerId.current = value;
    requestAnimationFrame(paint);
  }, [items.map((i) => i.id).join('|')]);
  const onScroll = () => { requestAnimationFrame(paint); clearTimeout(snapT.current); snapT.current = setTimeout(snap, 140); };
  return (
    <div ref={ref} onScroll={onScroll} className="flex gap-3 overflow-x-auto no-scrollbar py-3"
      style={{ paddingInline: 'calc(50% - 32px)', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
      {items.map((it, i) => (
        <div key={it.id} ref={(el) => (kids.current[i] = el)} className="shrink-0 w-16 flex flex-col items-center gap-1.5 will-change-transform" style={{ scrollSnapAlign: 'center' }}>
          <span className="rounded-[20px] flex items-center justify-center w-14 h-14 shadow-[inset_0_1px_0_rgba(255,255,255,.1)]" style={{ background: `linear-gradient(150deg, ${it.color}3d, ${it.color}1f)`, color: it.color }}>
            <Icon n={it.icon} s={24} />
          </span>
          <span className="text-[11px] font-bold text-center leading-tight max-w-[72px] truncate" style={{ color: it.color }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
export default function AddOp({ params }: { params?: { opId?: string; voice?: boolean; img?: string } }) {
  const data = useData(); const { pop, push, showToast } = useUI();
  const editing = params?.opId ? data.operations.find((o) => o.id === params.opId) : undefined;
  const [type, setType] = useState<'income' | 'expense' | 'transfer' | 'adjust'>(editing?.type ?? 'expense');
  const [expr, setExpr] = useState(editing ? String(editing.amount).replace('.', ',') : '');
  const [accId, setAccId] = useState(editing?.accountId ?? data.accounts[0]?.id);
  const [toAccId, setToAccId] = useState(editing?.toAccountId ?? data.accounts[1]?.id ?? data.accounts[0]?.id);
  const [catId, setCatId] = useState<string | null>(editing?.categoryId ?? null);
  const [note, setNote] = useState(editing?.note ?? '');
  const [img, setImg] = useState<string | null>(editing?.img ?? params?.img ?? null);
  // валюта операции: переключается одним тапом (п.4)
  const [cur, setCur] = useState(editing?.currency ?? data.accounts.find((a) => a.id === (editing?.accountId ?? data.accounts[0]?.id))?.currency ?? data.settings.currency);
  const [date, setDate] = useState(editing ? parseISO(editing.date) : new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [del, setDel] = useState(false);
  const [pickAcc, setPickAcc] = useState<null | 'from' | 'to'>(null);
  const [listening, setListening] = useState(false);
  const acc = data.accounts.find((a) => a.id === accId);
  const amount = evalExpr(expr);
  const isEdit = !!editing;
  const cats = useMemo(() => data.categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense')).sort((a, b) => a.order - b.order), [data.categories, type]);
  const quick = data.settings.quickFilter ? cats.filter((c) => data.settings.quickFilter!.includes(c.id)) : cats;
  const pickerItems = [{ id: '__none', icon: 'slash', color: '#8b9097', label: tr('noCategory') }, ...quick.map((c) => ({ id: c.id, icon: c.icon, color: c.color, label: c.name }))];
  const pickerValue = catId ?? '__none';
  const save = () => {
    haptic(12);
    if (type === 'adjust') {
      const curBal = accountBalance(accId, data.operations.filter((o) => o.id !== editing?.id));
      const base = { type, amount: Math.round((amount - curBal) * 100) / 100, accountId: accId, toAccountId: null, categoryId: null, note: note || tr('adjust'), date: date.toISOString(), currency: cur, img } as any;
      isEdit ? data.updateOperation(editing!.id, base) : data.addOperation(base);
    } else if (type === 'transfer') {
      if (!accId || !toAccId || accId === toAccId || amount <= 0) return;
      const base = { type, amount, accountId: accId, toAccountId: toAccId, categoryId: null, note, date: date.toISOString(), currency: cur, img } as any;
      isEdit ? data.updateOperation(editing!.id, base) : data.addOperation(base);
    } else {
      if (amount <= 0) return;
      const base = { type, amount, accountId: accId, categoryId: pickerValue === '__none' ? null : pickerValue, note, date: date.toISOString(), toAccountId: null, currency: cur, img } as any;
      isEdit ? data.updateOperation(editing!.id, base) : data.addOperation(base);
    }
    pop();
  };
  const voice = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR(); rec.lang = 'ru-RU'; rec.interimResults = false; setListening(true);
    rec.onresult = (e: any) => {
      const text: string = e.results[0][0].transcript;
      const m = text.match(/\d+(?:[.,]\d+)?/); if (m) setExpr(m[0]);
      const low = text.toLowerCase();
      const cat = data.categories.find((c) => low.includes(c.name.toLowerCase()));
      if (cat) { setCatId(cat.id); setType(cat.type); }
      setNote(text); showToast(tr('recognized'));
    };
    rec.onend = () => setListening(false); rec.onerror = () => setListening(false);
    rec.start();
  };
  // автозапуск голоса, если пришли с кнопки «Голос»
  useEffect(() => { if (params?.voice) { const t = setTimeout(voice, 500); return () => clearTimeout(t); } }, []);
  const dateLabel = startOfDay(date).getTime() === startOfDay(new Date()).getTime() ? tr('today') : format(date, 'd MMMM', { locale: ru });
  return (
    <FullSheet>
      <div className="flex items-center justify-between px-4 pt-2">
        <button onClick={pop} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="close" s={20} /></button>
        <div className="flex items-center glass rounded-full p-1">
          {(['income', 'expense'] as const).map((v) => (
            <button key={v} onClick={() => { haptic(); setType(v); }} className="relative h-9 px-4 rounded-full text-[15px] font-bold"
              style={{ color: type === v ? (v === 'income' ? 'var(--inc)' : 'var(--exp)') : 'var(--mut)', background: type === v ? (v === 'income' ? 'rgba(48,209,88,.14)' : 'rgba(255,69,58,.14)') : 'transparent', transition: 'all .25s' }}>
              <span className="flex items-center gap-1.5"><Icon n={v === 'income' ? 'arrowDL' : 'arrowUR'} s={15} />{tr(v)}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <button onClick={() => setMenu(!menu)} className="w-11 h-11 rounded-full card flex items-center justify-center"><Icon n="dots" s={20} w={3} /></button>
          {menu && (<>
            <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
            <motion.div initial={{ opacity: 0, scale: .92, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={SPRING}
              className="absolute right-0 top-12 z-20 w-56 glass-strong rounded-2xl overflow-hidden py-1">
              {[{ l: tr('transfer'), i: 'swap', v: 'transfer' }, { l: tr('adjust'), i: 'plusminus', v: 'adjust' }, { l: tr('voice'), i: 'mic', fn: voice }, ...(isEdit ? [{ l: tr('delete'), i: 'trash', fn: () => setDel(true), danger: true }] : [])].map((it: any) => (
                <button key={it.l} onClick={() => { setMenu(false); it.fn ? it.fn() : setType(it.v); }}
                  className={cx('w-full flex items-center gap-3 px-4 py-3 text-[15px] font-semibold active:bg-white/5', it.danger && 'text-dang')}>
                  <Icon n={it.i} s={18} />{it.l}
                </button>
              ))}
            </motion.div>
          </>)}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 min-h-[120px]">
        <div className={cx('text-[56px] font-extrabold tabular-nums tracking-[-0.03em] text-center break-all transition-colors', !expr && 'text-white/25')}>
          {fmtNum(amount)} {CURRENCIES[cur]?.sym ?? cur}
        </div>
      </div>
      {listening && <div className="text-center text-mut text-[14px] pb-2 animate-pulse">{tr('listening')}</div>}
      {type === 'adjust' && <div className="text-center text-mut text-[13px] pb-2 px-8">{tr('newBalance')}: {money(amount, cur)}</div>}
      <div className="px-4 pb-2 flex items-center gap-2">
        <button onClick={() => setPickAcc('from')} className="flex items-center gap-2 glass rounded-full pl-1.5 pr-3.5 h-11 active:scale-95 transition-transform">
          <CatIcon icon={acc?.icon ?? 'wallet'} color={acc?.color ?? '#8b9097'} s={32} is={16} />
          <span className="text-[14px] font-bold max-w-24 truncate">{acc?.name}</span>
        </button>
        {type === 'transfer' && (<>
          <Icon n="chevR" s={16} c="text-mut" />
          <button onClick={() => setPickAcc('to')} className="flex items-center gap-2 glass rounded-full pl-1.5 pr-3.5 h-11 active:scale-95 transition-transform">
            <CatIcon icon={data.accounts.find((a) => a.id === toAccId)?.icon ?? 'wallet'} color={data.accounts.find((a) => a.id === toAccId)?.color ?? '#8b9097'} s={32} is={16} />
            <span className="text-[14px] font-bold max-w-24 truncate">{data.accounts.find((a) => a.id === toAccId)?.name}</span>
          </button>
        </>)}
        <div className="flex-1" />
        <button onClick={() => setDateOpen(true)} className="flex items-center gap-2 glass rounded-full px-3.5 h-11 text-[15px] font-semibold active:scale-95 transition-transform">
          <Icon n="calendar" s={17} />{dateLabel}
        </button>
        {/* валюта: один тап — переключение BYN ↔ RUB */}
        <button onClick={() => { haptic(6); setCur((c) => (c === 'BYN' ? 'RUB' : 'BYN')); }}
          className="glass rounded-full px-3.5 h-11 flex items-center text-[14px] font-bold active:scale-90 transition-transform">
          {CURRENCIES[cur]?.sym ?? cur}
        </button>
      </div>
      <div className="px-4 pb-2">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={tr('note')}
          className="w-full glass rounded-2xl h-12 px-4 text-[15px] outline-none placeholder:text-mut focus:border-white/20" />
      </div>
      {img && (
        <div className="px-4 pb-2 flex items-center gap-2">
          <img src={img} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
          <span className="flex-1 text-[13px] text-mut">{tr('receipt')}</span>
          <button onClick={() => setImg(null)} className="w-9 h-9 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="close" s={14} /></button>
        </div>
      )}
      {(type === 'income' || type === 'expense') && (
        <div className="px-2 pb-2 relative">
          <CenterPicker items={pickerItems} value={pickerValue} onChange={(id) => setCatId(id === '__none' ? null : id)} />
          <button onClick={() => push('categoryForm', { type })} className="absolute right-3 top-2 w-9 h-9 rounded-full card flex items-center justify-center text-mut active:scale-90 transition-transform"><Icon n="plus" s={16} /></button>
        </div>
      )}
      <div className="px-3 pb-2">
        <div className="grid grid-cols-4 gap-1.5">
          {['1','2','3'].map((d) => <Key key={d} l={d} onClick={() => setExpr(expr + d)} />)}
          <Key l="+" op onClick={() => setExpr(expr + '+')} />
          {['4','5','6'].map((d) => <Key key={d} l={d} onClick={() => setExpr(expr + d)} />)}
          <Key l="−" op onClick={() => setExpr(expr + '−')} />
          {['7','8','9'].map((d) => <Key key={d} l={d} onClick={() => setExpr(expr + d)} />)}
          <Key l="×" op onClick={() => setExpr(expr + '×')} />
          <Key l="," onClick={() => setExpr(expr.includes(',') ? expr : expr + ',')} />
          <Key l="0" onClick={() => setExpr(expr + '0')} />
          <Key icon="backspace" onClick={() => setExpr(expr.slice(0, -1))} />
          <Key l="÷" op onClick={() => setExpr(expr + '÷')} />
        </div>
      </div>
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <BigButton disabled={type === 'transfer' ? accId === toAccId || amount <= 0 : amount <= 0} onClick={save}>{tr('save')}</BigButton>
      </div>
      <AnimatePresence>
        {dateOpen && <DateTimeSheet date={date} onConfirm={(d) => { setDate(d); setDateOpen(false); }} onClose={() => setDateOpen(false)} />}
        {pickAcc && <AccPick current={pickAcc === 'to' ? toAccId : accId}
          onPick={(id) => { if (pickAcc === 'to') setToAccId(id); else { setAccId(id); setCur(data.accounts.find((a) => a.id === id)?.currency ?? cur); } setPickAcc(null); }}
          onClose={() => setPickAcc(null)} />}
        {del && editing && <Confirm text={tr('deleteOp')} hint={tr('deleteOpQ')} onNo={() => setDel(false)} onYes={() => { data.deleteOperation(editing.id); setDel(false); pop(); }} />}
      </AnimatePresence>
    </FullSheet>
  );
}
function Key({ l, icon, op, onClick }: any) {
  return (
    <motion.button whileTap={{ scale: 0.88 }} onClick={onClick}
      className={cx('h-[58px] rounded-2xl text-[22px] font-bold flex items-center justify-center tabular-nums active:brightness-125', op ? 'bg-white/10 text-exp' : 'card')}>
      {icon ? <Icon n={icon} s={22} /> : l}
    </motion.button>
  );
}
export function DateTimeSheet({ date, onConfirm, onClose }: { date: Date; onConfirm: (d: Date) => void; onClose: () => void }) {
  const [month, setMonth] = useState(new Date(date.getFullYear(), date.getMonth(), 1));
  const [day, setDay] = useState(date.getDate());
  const [time, setTime] = useState(format(date, 'HH:mm'));
  const lead = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <BottomSheet onClose={onClose}>
      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2">
        <div className="flex items-center justify-between pb-3">
          <div className="text-[17px] font-bold capitalize">{format(month, 'LLLL yyyy', { locale: ru })}</div>
          <div className="flex gap-2">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="w-10 h-10 rounded-full card flex items-center justify-center"><Icon n="back" s={18} /></button>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="w-10 h-10 rounded-full card flex items-center justify-center"><Icon n="chevR" s={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 pb-1">{['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'].map((d) => <div key={d} className="text-center text-[12px] font-bold text-mut py-1">{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: lead }).map((_, i) => <div key={'e' + i} />)}
          {Array.from({ length: dim }, (_, i) => i + 1).map((d) => (
            <button key={d} onClick={() => { setDay(d); haptic(4); }} className="flex items-center justify-center h-11">
              <span className={cx('w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-semibold tabular-nums transition-all', day === d ? 'bg-txt text-black shadow-[0_6px_18px_rgba(255,255,255,.25)]' : 'active:bg-white/10')}>{d}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4">
          <span className="text-[16px] font-bold">{tr('time')}</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="card rounded-xl px-3 py-2 text-[16px] font-bold outline-none [color-scheme:dark]" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-5">
          <BigButton onClick={onClose}>{tr('cancel')}</BigButton>
          <BigButton onClick={() => { const [h, m] = time.split(':').map(Number); onConfirm(new Date(month.getFullYear(), month.getMonth(), day, h, m)); }}>{tr('confirm')}</BigButton>
        </div>
      </div>
    </BottomSheet>
  );
}
function AccPick({ current, onPick, onClose }: any) {
  const { accounts, operations } = useData();
  return (
    <BottomSheet onClose={onClose}>
      <div className="p-4 pt-2 space-y-2 max-h-[60dvh] overflow-auto">
        {accounts.map((a: any) => (
          <button key={a.id} onClick={() => onPick(a.id)} className={cx('w-full flex items-center gap-3 p-3 rounded-2xl transition-colors', current === a.id ? 'bg-white/12' : 'card active:bg-white/8')}>
            <CatIcon icon={a.icon} color={a.color} s={38} is={18} />
            <span className="flex-1 text-left text-[16px] font-semibold">{a.name}</span>
            <span className="text-[14px] text-mut tabular-nums">{money(accountBalance(a.id, operations), a.currency)}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}