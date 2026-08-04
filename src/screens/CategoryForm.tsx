'use client';
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useData, useUI, haptic } from '@/lib/store';
import { Icon, ICON_SECTIONS } from '@/lib/icons';
import { PALETTE, EXP_RAMP, INC_RAMP } from '@/lib/meta';
import { FullSheet, BigButton, cx, Confirm, BottomSheet } from '@/components/ui';
import { tr } from '@/lib/i18n';
import { Palette } from './AccountForm';
export function IconPicker({ value, onChange }: { value: string; onChange: (i: string) => void }) {
  return (
    <div className="card rounded-2xl p-3 h-[264px] overflow-y-auto no-scrollbar space-y-4">
      {ICON_SECTIONS.map((sec) => (
        <div key={sec.title}>
          <div className="text-[12px] font-bold text-mut mb-2">{sec.title}</div>
          <div className="grid grid-cols-6 gap-2">
            {sec.icons.map((ic) => (
              <button key={ic} onClick={() => { haptic(4); onChange(ic); }}
                className={cx('aspect-square rounded-xl flex items-center justify-center transition-colors', value === ic ? 'bg-white/20' : 'bg-white/5 active:bg-white/10')}>
                <Icon n={ic} s={18} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
export default function CategoryForm({ params }: { params?: { id?: string; type?: 'income' | 'expense' } }) {
  const data = useData(); const { pop } = useUI();
  const editing = params?.id ? data.categories.find((c) => c.id === params.id) : undefined;
  const [type, setType] = useState<'income' | 'expense'>(editing?.type ?? params?.type ?? 'expense');
  const [name, setName] = useState(editing?.name ?? '');
  const [icon, setIcon] = useState(editing?.icon ?? 'star');
  const [color, setColor] = useState(editing?.color ?? PALETTE[7]);
  const [parentId, setParentId] = useState<string | null>(editing?.parentId ?? null);
  const [parentOpen, setParentOpen] = useState(false);
  const [del, setDel] = useState(false);
  const parents = data.categories.filter((c) => c.type === type && c.parentId === null && c.id !== editing?.id);
  const parent = data.categories.find((c) => c.id === parentId);
  const save = () => {
    const payload = { name: name.trim() || tr('noCategory'), icon, color, type, parentId, order: editing?.order ?? 0 };
    if (editing) data.updateCategory(editing.id, payload); else data.addCategory(payload);
    pop();
  };
  return (
    <FullSheet>
      <div className="flex items-center justify-between px-4 pt-2">
        <button onClick={pop} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="close" s={20} /></button>
        <span className="text-[18px] font-bold">{editing ? tr('editCategory') : tr('newCategory')}</span>
        <div className="w-11" />
      </div>
      <div className="px-4 pt-6 space-y-5 overflow-auto pb-4">
        <button onClick={() => setParentOpen(true)} className="w-full border border-dashed border-white/20 rounded-2xl h-12 text-[15px] font-semibold text-mut flex items-center justify-center gap-2">
          <Icon n="plus" s={16} />{parent ? parent.name : tr('parentCategory')}
        </button>
        <div className="flex items-center gap-3 card rounded-2xl px-4 h-14">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '26', color }}><Icon n={icon} s={19} /></span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('name')} className="flex-1 bg-transparent outline-none text-[16px] font-semibold placeholder:text-mut" />
        </div>
        <div className="flex justify-center">
          <div className="flex items-center bg-card rounded-full p-1">
            {(['income', 'expense'] as const).map((v) => (
              <button key={v} onClick={() => { setType(v); setParentId(null); }} className="relative h-9 px-4 rounded-full flex items-center gap-1.5 text-[15px] font-bold"
                style={{ color: type === v ? (v === 'income' ? 'var(--inc)' : 'var(--exp)') : 'var(--mut)' }}>
                {type === v && <span className="absolute inset-0 rounded-full" style={{ background: (v === 'income' ? 'var(--inc)' : 'var(--exp)') + '26' }} />}
                <span className="relative flex items-center gap-1.5"><Icon n={v === 'income' ? 'arrowDL' : 'arrowUR'} s={15} />{tr(v)}</span>
              </button>
            ))}
          </div>
        </div>
        <Palette value={color} onChange={setColor} colors={type === 'expense' ? EXP_RAMP : INC_RAMP} />
        <IconPicker value={icon} onChange={setIcon} />
        {editing && <button onClick={() => setDel(true)} className="w-full text-dang font-bold text-[15px] py-2">{tr('delete')}</button>}
      </div>
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+16px)]"><BigButton onClick={save}>{tr('save')}</BigButton></div>
      <AnimatePresence>
        {parentOpen && (
          <BottomSheet onClose={() => setParentOpen(false)}>
            <div className="p-4 pt-2 space-y-2 max-h-[60dvh] overflow-auto">
              <button onClick={() => { setParentId(null); setParentOpen(false); }} className="w-full text-left p-3 rounded-2xl bg-card text-[15px] font-semibold text-mut">— {tr('parentCategory')}</button>
              {parents.map((p) => (
                <button key={p.id} onClick={() => { setParentId(p.id); setParentOpen(false); }} className={cx('w-full flex items-center gap-3 p-3 rounded-2xl', parentId === p.id ? 'bg-card2' : 'bg-card')}>
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: p.color + '26', color: p.color }}><Icon n={p.icon} s={18} /></span>
                  <span className="flex-1 text-left text-[15px] font-semibold">{p.name}</span>
                </button>
              ))}
            </div>
          </BottomSheet>
        )}
        {del && editing && <Confirm text={tr('delete')} hint={tr('deleteCatQ')} onNo={() => setDel(false)} onYes={() => { data.deleteCategory(editing.id); setDel(false); pop(); }} />}
      </AnimatePresence>
    </FullSheet>
  );
}