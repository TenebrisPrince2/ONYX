'use client';
import React, { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useData, useUI, haptic } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { CURRENCIES } from '@/lib/meta';
import { FullSheet, Row, SectionTitle, cx, BottomSheet, Toggle } from '@/components/ui';
import { tr } from '@/lib/i18n';
import { mapCsv, downloadFile, parseCsv } from '@/lib/csv';
function Picker({ open, onClose, value, onChange, options }: any) {
  return (
    <AnimatePresence>{open && (
      <BottomSheet onClose={onClose}>
        <div className="p-4 pt-2 space-y-1 max-h-[60dvh] overflow-auto">
          {options.map((o: any) => (
            <button key={o.v} onClick={() => { onChange(o.v); onClose(); }} className={cx('w-full flex items-center gap-3 p-3 rounded-2xl', value === o.v ? 'bg-white/12' : 'card active:bg-white/8')}>
              <span className="flex-1 text-left text-[15px] font-semibold">{o.label}</span>
              {value === o.v && <Icon n="check" s={18} c="text-inc" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    )}</AnimatePresence>
  );
}
export default function Settings() {
  const data = useData(); const { pop, push, showToast } = useUI();
  const s = data.settings;
  const [pick, setPick] = useState<null | 'cur' | 'rem'>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const WD = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const res = mapCsv(String(r.result), data);
      if (!res || !res.ops.length) { showToast(tr('importErr')); return; }
      data.importBatch(res.ops, res.newAccs, res.newCats);
      showToast(`${tr('imported')}: ${res.ops.length}`);
    };
    r.readAsText(f); e.target.value = '';
  };
  const exportCsv = () => {
    const acc = (id: string) => data.accounts.find((a) => a.id === id)?.name ?? '';
    const cat = (id?: string | null) => (id ? data.categories.find((c) => c.id === id)?.name ?? '' : '');
    const rows = [['date','type','account','category','amount','currency','note'],
      ...data.operations.map((o) => [o.date.slice(0, 10), o.type, acc(o.accountId), cat(o.categoryId), String(o.amount), o.currency ?? s.currency, (o.note ?? '').replace(/"/g, '""')])];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    downloadFile(`balance-${new Date().toISOString().slice(0, 10)}.csv`, new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    showToast(tr('copied'));
  };
  return (
    <FullSheet>
      <div className="flex items-center gap-3 px-4 pt-2">
        <button onClick={pop} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="back" s={20} /></button>
        <span className="text-[18px] font-bold">{tr('settings')}</span>
      </div>
      <div className="overflow-auto pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="px-4 pt-5">
          <div className="glass rounded-3xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(48,209,88,.15)', color: 'var(--inc)' }}><Icon n="wallet" s={24} /></div>
            <div className="flex-1">
              <div className="text-[16px] font-bold">Баланс</div>
              <div className="text-[12px] text-mut">{data.operations.length} {tr('opsTotal')} · {tr('localOnly')}</div>
            </div>
          </div>
        </div>
        <SectionTitle>{tr('main')}</SectionTitle>
        <div className="px-4"><div className="glass rounded-2xl divide-y divide-white/5">
          <Row icon="palette" iconBg="#bf5af2" label={tr('categories')} onClick={() => push('categories')} />
          <Row icon="drop" iconBg="#0a84ff" label={tr('defCurrency')} value={s.currency} onClick={() => setPick('cur')} />
          <Row icon="bell" iconBg="#ffd60a" label={tr('reminders')} value={s.reminderEnabled ? `${s.reminderTime}${s.reminderDays.length ? ' · ' + s.reminderDays.length : ''}` : '—'} onClick={() => setPick('rem')} />
        </div></div>
        <SectionTitle>{tr('personal')}</SectionTitle>
        <div className="px-4"><div className="glass rounded-2xl">
          <Row icon="dots" iconBg="#30d158" label={tr('addButtons')} onClick={() => push('addButtons')} />
        </div></div>
        <SectionTitle>{tr('importExport')}</SectionTitle>
        <div className="px-4"><div className="glass rounded-2xl divide-y divide-white/5">
          <Row icon="upload" iconBg="#64d2ff" label={tr('importCsv')} onClick={() => fileRef.current?.click()} />
          <Row icon="download" iconBg="#64d2ff" label={tr('exportCsv')} onClick={exportCsv} />
        </div></div>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onImport} />
      </div>
      <Picker open={pick === 'cur'} onClose={() => setPick(null)} value={s.currency} onChange={(v: string) => data.setSettings({ currency: v })}
        options={Object.keys(CURRENCIES).map((c) => ({ v: c, label: `${CURRENCIES[c].name} (${CURRENCIES[c].sym})` }))} />
      <AnimatePresence>{pick === 'rem' && (
        <BottomSheet onClose={() => setPick(null)}>
          <div className="p-5 pt-3 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,214,10,.15)', color: '#ffd60a' }}><Icon n="bell" s={22} /></div>
              <div className="flex-1">
                <div className="text-[16px] font-bold">{tr('reminders')}</div>
                <div className="text-[12px] text-mut">{s.reminderEnabled ? tr('reminderOn') : tr('reminderHint')}</div>
              </div>
              <Toggle on={s.reminderEnabled} onChange={(v) => data.setSettings({ reminderEnabled: v })} />
            </div>
            {s.reminderEnabled && (<>
              <div className="glass rounded-2xl p-4 flex items-center justify-between">
                <span className="text-[15px] font-semibold text-mut">{tr('time')}</span>
                <input type="time" value={s.reminderTime} onChange={(e) => data.setSettings({ reminderTime: e.target.value })}
                  className="bg-transparent outline-none text-[28px] font-extrabold tabular-nums [color-scheme:dark]" />
              </div>
              <div className="flex justify-between px-1">
                {WD.map((d, i) => {
                  const on = s.reminderDays.includes(i);
                  return (
                    <button key={d} onClick={() => { haptic(5); data.setSettings({ reminderDays: on ? s.reminderDays.filter((x) => x !== i) : [...s.reminderDays, i].sort() }); }}
                      className={cx('w-10 h-10 rounded-full text-[13px] font-bold flex items-center justify-center transition-all', on ? 'text-black scale-105' : 'card text-mut')}
                      style={on ? { background: 'var(--inc)' } : undefined}>{d}</button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                {[[tr('everyDay'), [0,1,2,3,4,5,6]], [tr('weekdays'), [1,2,3,4,5]], [tr('weekends'), [0,6]]].map(([l, days]: any) => {
                  const active = JSON.stringify([...s.reminderDays].sort()) === JSON.stringify([...days].sort());
                  return (
                    <button key={l} onClick={() => data.setSettings({ reminderDays: days })}
                      className={cx('flex-1 h-10 rounded-full text-[13px] font-bold transition-colors', active ? 'bg-inc text-black' : 'card text-mut')}>{l}</button>
                  );
                })}
              </div>
            </>)}
          </div>
        </BottomSheet>
      )}</AnimatePresence>
    </FullSheet>
  );
}