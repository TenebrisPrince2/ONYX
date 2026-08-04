'use client';
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useData, useUI, haptic } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { PALETTE, CURRENCIES } from '@/lib/meta';
import { FullSheet, BigButton, cx, Confirm, BottomSheet, Toggle } from '@/components/ui';
import { tr } from '@/lib/i18n';
import { IconPicker } from './CategoryForm';
const isLight = (hex: string) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8 & 255) * 587) + (n & 255) * 114) / 255000 > 0.65; };
export function Palette({ value, onChange, colors }: { value: string; onChange: (c: string) => void; colors?: string[] }) {
  const list = colors ?? PALETTE;
  return (
    <div className="grid grid-cols-7 gap-2">
      {list.map((c) => (
        <button key={c} onClick={() => { haptic(5); onChange(c); }}
          className={cx('aspect-square rounded-[10px] flex items-center justify-center transition-all', value === c ? 'ring-2 ring-white scale-105' : 'active:scale-90')}
          style={{ background: c }}>
          {value === c && <Icon n="check" s={14} w={2.8} c={isLight(c) ? 'text-black' : 'text-white'} />}
        </button>
      ))}
    </div>
  );
}
export default function AccountForm({ params }: { params?: { id?: string } }) {
  const data = useData(); const { pop } = useUI();
  const editing = params?.id ? data.accounts.find((a) => a.id === params.id) : undefined;
  const [name, setName] = useState(editing?.name ?? '');
  const [icon, setIcon] = useState(editing?.icon ?? 'wallet');
  const [color, setColor] = useState(editing?.color ?? PALETTE[17]);
  const [start, setStart] = useState(String(editing?.start ?? 0));
  const [currency, setCurrency] = useState(editing?.currency ?? data.settings.currency);
  const [hidden, setHidden] = useState(editing?.hidden ?? false);
  const [curOpen, setCurOpen] = useState(false);
  const [del, setDel] = useState(false);
  const save = () => {
    const payload = { name: name.trim() || tr('wallet'), icon, color, currency, start: parseFloat(start.replace(',', '.')) || 0, hidden, order: editing?.order ?? 0 };
    if (editing) data.updateAccount(editing.id, payload); else data.addAccount(payload);
    pop();
  };
  return (
    <FullSheet>
      <div className="flex items-center justify-between px-4 pt-2">
        <button onClick={pop} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="close" s={20} /></button>
        <span className="text-[18px] font-bold">{editing ? tr('editAccount') : tr('newAccount')}</span>
        <div className="w-11" />
      </div>
      <div className="px-4 pt-6 space-y-5 overflow-auto pb-4">
        <div className="flex items-center gap-3 card rounded-2xl px-4 h-14">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '26', color }}><Icon n={icon} s={19} /></span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('accountName')} className="flex-1 bg-transparent outline-none text-[16px] font-semibold placeholder:text-mut" />
        </div>
        <Palette value={color} onChange={setColor} />
        <IconPicker value={icon} onChange={setIcon} />
        <div className="card rounded-2xl overflow-hidden divide-y divide-white/5">
          <div className="flex items-center px-4 py-4 gap-3">
            <Icon n="bank" s={18} c="text-mut" /><span className="flex-1 text-[16px] font-semibold">{tr('startBalance')}</span>
            <input value={start} onChange={(e) => setStart(e.target.value)} inputMode="decimal" className="w-28 text-right bg-transparent outline-none text-[16px] font-bold tabular-nums" />
          </div>
          <button onClick={() => setCurOpen(true)} className="w-full flex items-center px-4 py-4 gap-3">
            <span className="text-[16px] font-bold text-mut w-[18px] text-center">{CURRENCIES[currency]?.sym}</span>
            <span className="flex-1 text-left text-[16px] font-semibold">{tr('currency')}</span>
            <span className="text-[15px] text-mut font-medium">{currency}</span>
          </button>
        </div>
        <div className="flex items-center gap-3 card rounded-2xl px-4 py-4">
          <div className="flex-1"><div className="text-[16px] font-semibold">{tr('hideFromOverview')}</div><div className="text-[12px] text-mut leading-snug pt-0.5">{tr('hideHint')}</div></div>
          <Toggle on={hidden} onChange={setHidden} />
        </div>
        {editing && data.accounts.length > 1 && (
          <button onClick={() => setDel(true)} className="w-full text-dang font-bold text-[15px] py-2">{tr('delete')}</button>
        )}
      </div>
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+16px)]"><BigButton onClick={save}>{tr('save')}</BigButton></div>
      <AnimatePresence>
        {curOpen && (
          <BottomSheet onClose={() => setCurOpen(false)}>
            <div className="p-4 pt-2 space-y-1">
              {Object.entries(CURRENCIES).map(([code, c]) => (
                <button key={code} onClick={() => { setCurrency(code); setCurOpen(false); }} className={cx('w-full flex items-center gap-3 p-3 rounded-2xl', currency === code ? 'bg-card2' : 'bg-card')}>
                  <span className="w-10 text-center text-[18px] font-bold">{c.sym}</span>
                  <span className="flex-1 text-left text-[15px] font-semibold">{c.name}</span>
                  <span className="text-mut text-[14px]">{code}</span>
                </button>
              ))}
            </div>
          </BottomSheet>
        )}
        {del && editing && <Confirm text={tr('delete')} hint={tr('deleteAccQ')} onNo={() => setDel(false)} onYes={() => { data.deleteAccount(editing.id); setDel(false); pop(); }} />}
      </AnimatePresence>
    </FullSheet>
  );
}