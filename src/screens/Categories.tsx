'use client';
import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import { useData, useUI } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { FullSheet, CatIcon, cx } from '@/components/ui';
import { dict } from '@/lib/i18n';

export default function Categories() {
  const { categories, reorderCategories } = useData();
  const { pop, push } = useUI();
  const t = dict(useData.getState().settings.locale);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const list = categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order);

  return (
    <FullSheet>
      <div className="flex items-center justify-between px-4 pt-2">
        <button onClick={pop} className="w-11 h-11 rounded-full bg-card flex items-center justify-center"><Icon n="close" s={20} /></button>
        <span className="text-[18px] font-bold">{t('categories')}</span>
        <button onClick={() => push('categoryForm', { type })} className="w-11 h-11 rounded-full bg-card flex items-center justify-center"><Icon n="plus" s={20} /></button>
      </div>
      <div className="flex justify-center pt-4">
        <div className="flex items-center bg-card rounded-full p-1">
          {(['income', 'expense'] as const).map((v) => (
            <button key={v} onClick={() => setType(v)} className="relative h-9 px-4 rounded-full flex items-center gap-1.5 text-[15px] font-bold"
              style={{ color: type === v ? (v === 'income' ? 'var(--inc)' : 'var(--exp)') : 'var(--mut)' }}>
              {type === v && <span className="absolute inset-0 rounded-full" style={{ background: (v === 'income' ? 'var(--inc)' : 'var(--exp)') + '26' }} />}
              <span className="relative flex items-center gap-1.5"><Icon n={v === 'income' ? 'arrowDL' : 'arrowUR'} s={15} />{t(v)}</span>
            </button>
          ))}
        </div>
      </div>
      <Reorder.Group axis="y" values={list.map((c) => c.id)} onReorder={(ids) => reorderCategories(type, ids)} className="px-4 pt-5 space-y-2 pb-[calc(env(safe-area-inset-bottom)+24px)] overflow-auto">
        {list.map((c) => (
          <Reorder.Item key={c.id} value={c.id} whileDrag={{ scale: 1.04 }} className="flex items-center gap-3 bg-card rounded-2xl px-3 py-2.5 cursor-grab active:cursor-grabbing">
            <button onClick={() => push('categoryForm', { id: c.id })} className="flex items-center gap-3 flex-1 text-left">
              <CatIcon icon={c.icon} color={c.color} s={42} is={20} />
              <span className="text-[16px] font-semibold">{c.name}</span>
            </button>
            <Icon n="grip" s={18} c="text-mut" />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </FullSheet>
  );
}