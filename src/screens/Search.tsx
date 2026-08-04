'use client';
import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useData, useUI } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { FullSheet } from '@/components/ui';
import { tr } from '@/lib/i18n';
import { OpRow } from './Ops';

export default function Search() {
  const { operations, categories, accounts } = useData();
  const { pop } = useUI();
  const [q, setQ] = useState('');
  const res = useMemo(() => {
    const ql = q.trim().toLowerCase(); if (!ql) return [];
    return operations.filter((o) => {
      const cat = categories.find((c) => c.id === o.categoryId)?.name ?? '';
      const acc = accounts.find((a) => a.id === o.accountId)?.name ?? '';
      return (o.note + ' ' + cat + ' ' + acc + ' ' + o.amount).toLowerCase().includes(ql);
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [q, operations, categories, accounts]);
  return (
    <FullSheet>
      <div className="flex items-center gap-3 px-4 pt-2">
        <button onClick={pop} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="back" s={20} /></button>
        <div className="flex-1 flex items-center gap-2 glass rounded-full px-4 h-11">
          <Icon n="search" s={18} c="text-mut" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('searchPh')} className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-mut" />
        </div>
      </div>
      <div className="px-4 pt-4 space-y-2 overflow-auto pb-[calc(env(safe-area-inset-bottom)+24px)]">
        {!q && <div className="text-mut text-[15px] text-center pt-16">{tr('searchPh')}</div>}
        {q && res.length === 0 && <div className="text-mut text-[15px] text-center pt-16">{tr('nothingFound')}</div>}
        {res.map((o) => (
          <div key={o.id}>
            <div className="text-[12px] text-mut px-1 pb-1 capitalize">{format(parseISO(o.date), 'd MMMM yyyy', { locale: ru })}</div>
            <OpRow id={o.id} />
          </div>
        ))}
      </div>
    </FullSheet>
  );
}