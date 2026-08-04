'use client';
import React from 'react';
import { useData, useUI, haptic } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { FullSheet, CatIcon, Toggle, cx, SectionTitle } from '@/components/ui';
import { tr } from '@/lib/i18n';
export default function AddButtons() {
  const { categories, settings, setSettings } = useData();
  const { pop } = useUI();
  const cfg = settings.addBtn;
  const set = (p: Partial<typeof cfg>) => {
    const next = { ...cfg, ...p };
    if (!next.scan && next.main === 'scan') next.main = 'manual';
    if (!next.voice && next.main === 'voice') next.main = 'manual';
    setSettings({ addBtn: next });
  };
  const acts: { id: 'scan' | 'manual' | 'voice'; icon: string }[] = [];
  if (cfg.scan) acts.push({ id: 'scan', icon: 'scan' });
  acts.push({ id: 'manual', icon: 'plus' });
  if (cfg.voice) acts.push({ id: 'voice', icon: 'mic' });
  const main = acts.find((a) => a.id === cfg.main) ?? acts[Math.floor(acts.length / 2)];
  const sides = acts.filter((a) => a !== main);
  const order = sides.length === 2 ? [sides[0], main, sides[1]] : sides.length === 1 ? [sides[0], main] : [main];
  return (
    <FullSheet>
      <div className="flex items-center gap-3 px-4 pt-2">
        <button onClick={pop} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="back" s={20} /></button>
        <span className="text-[18px] font-bold">{tr('addButtons')}</span>
      </div>
      <div className="flex justify-center items-center gap-4 pt-10 pb-8">
        {order.map((a) => (
          <div key={a.id} className={cx('rounded-full bg-txt text-black flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,.5)]', a.id === main.id ? 'w-20 h-20' : 'w-14 h-14')}>
            <Icon n={a.icon} s={a.id === main.id ? 28 : 20} w={2} />
          </div>
        ))}
      </div>
      <div className="px-4 space-y-6 overflow-auto pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="glass rounded-2xl divide-y divide-white/5">
          <div className="flex items-center gap-3 px-4 py-3.5"><Icon n="scan" s={19} c="text-mut" /><span className="flex-1 text-[16px] font-semibold">{tr('showScan')}</span><Toggle on={cfg.scan} onChange={(v) => set({ scan: v })} /></div>
          <div className="flex items-center gap-3 px-4 py-3.5"><Icon n="mic" s={19} c="text-mut" /><span className="flex-1 text-[16px] font-semibold">{tr('showVoice')}</span><Toggle on={cfg.voice} onChange={(v) => set({ voice: v })} /></div>
        </div>
        <div>
          <SectionTitle>{tr('mainAction')}</SectionTitle>
          <div className="glass rounded-2xl divide-y divide-white/5 mt-2">
            {([['scan', 'scan', tr('scan')], ['voice', 'mic', tr('voiceBtn')], ['manual', 'plus', tr('manual')]] as const)
              .filter(([id]) => id === 'manual' || (id === 'scan' ? cfg.scan : cfg.voice))
              .map(([id, icon, label]) => (
                <button key={id} onClick={() => { haptic(6); set({ main: id as any }); }} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5">
                  <Icon n={icon} s={19} c="text-mut" /><span className="flex-1 text-left text-[16px] font-semibold">{label}</span>
                  {main.id === id && <Icon n="check" s={18} w={2.4} />}
                </button>
              ))}
          </div>
        </div>
        <QuickCats />
      </div>
    </FullSheet>
  );
}
function QuickCats() {
  const { categories, settings, setSettings } = useData();
  const [type, setType] = React.useState<'income' | 'expense'>('expense');
  const list = categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order);
  const filter = settings.quickFilter ?? list.map((c) => c.id);
  const toggle = (id: string) => setSettings({ quickFilter: filter.includes(id) ? filter.filter((x) => x !== id) : [...filter, id] });
  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionTitle>{tr('categories')}</SectionTitle>
        <div className="flex items-center bg-card rounded-full p-1 mr-1">
          {(['expense', 'income'] as const).map((v) => (
            <button key={v} onClick={() => setType(v)} className="h-8 px-3 rounded-full text-[13px] font-bold"
              style={{ color: type === v ? (v === 'income' ? 'var(--inc)' : 'var(--exp)') : 'var(--mut)', background: type === v ? 'rgba(255,255,255,.08)' : 'transparent' }}>{tr(v)}</button>
          ))}
        </div>
      </div>
      <div className="glass rounded-2xl divide-y divide-white/5 mt-2">
        {list.map((c) => (
          <button key={c.id} onClick={() => toggle(c.id)} className="w-full flex items-center gap-3 px-4 py-3 active:bg-white/5">
            <CatIcon icon={c.icon} color={c.color} s={38} is={18} />
            <span className="flex-1 text-left text-[15px] font-semibold">{c.name}</span>
            <span className={cx('w-7 h-7 rounded-full flex items-center justify-center', filter.includes(c.id) ? 'bg-inc text-black' : 'bg-white/10 text-mut')}><Icon n="check" s={14} w={2.6} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}