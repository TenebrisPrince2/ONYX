'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useData, useUI, haptic } from '@/lib/store';
import { money } from '@/lib/calc';
import { CatIcon, cx } from '@/components/ui';
import { Icon } from '@/lib/icons';
import { tr } from '@/lib/i18n';

export function OpRow({ id }: { id: string }) {
  const { operations, categories, accounts, settings } = useData();
  const push = useUI((s) => s.push);
  const op = operations.find((o) => o.id === id)!;
  const cat = categories.find((c) => c.id === op.categoryId);
  const acc = accounts.find((a) => a.id === op.accountId);
  const toAcc = accounts.find((a) => a.id === op.toAccountId);
  const cur = op.currency ?? acc?.currency ?? settings.currency;
  const title = op.type === 'transfer' ? `${tr('transfer')}${toAcc ? ` → ${toAcc.name}` : ''}` : op.type === 'adjust' ? tr('adjust') : cat?.name ?? tr('noCategory');
  const icon = op.type === 'transfer' ? 'swap' : op.type === 'adjust' ? 'plusminus' : cat?.icon ?? 'slash';
  const color = op.type === 'transfer' || op.type === 'adjust' ? acc?.color ?? '#9ca3af' : cat?.color ?? '#9ca3af';
  return (
    <motion.button whileTap={{ scale: 0.975 }} onClick={() => { haptic(); push('add', { opId: op.id }); }}
      className="w-full flex items-center gap-3 card rounded-2xl p-3 text-left active:bg-white/5 transition-colors">
      <span className="relative shrink-0">
        <CatIcon icon={icon} color={color} s={42} is={20} />
        {op.img && <span className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-black border border-white/20 flex items-center justify-center"><Icon n="camera" s={11} /></span>}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[16px] font-semibold truncate">{title}</span>
        {op.note && <span className="block text-[13px] text-mut truncate">{op.note}</span>}
      </span>
      <span className={cx('text-[16px] font-bold tabular-nums', op.type === 'income' ? 'text-inc' : op.type === 'expense' ? 'text-txt' : 'text-mut')}>
        {op.type === 'income' ? '+' : op.type === 'expense' ? '-' : op.type === 'adjust' ? (op.amount >= 0 ? '+' : '-') : '→'}{money(Math.abs(op.amount), cur)}
      </span>
    </motion.button>
  );
}