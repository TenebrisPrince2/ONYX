'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData, useUI, haptic } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { accountBalance, money } from '@/lib/calc';
import { FullSheet, CatIcon, cx, SPRING } from '@/components/ui';
import { tr } from '@/lib/i18n';

export default function Accounts() {
  const { accounts, operations, settings, sortAccounts } = useData();
  const { pop, push, scope, setScope } = useUI();
  const [menu, setMenu] = useState(false);
  const total = accounts.filter((a) => !a.hidden).reduce((s, a) => s + accountBalance(a.id, operations), 0);
  const pick = (id: string) => { haptic(10); setScope(id); pop(); };
  return (
    <FullSheet>
      <div className="flex items-center justify-between px-4 pt-2">
        <button onClick={pop} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="close" s={20} /></button>
        <span className="text-[18px] font-bold">{tr('accounts')}</span>
        <div className="flex gap-2">
          <button onClick={() => push('accountForm')} className="w-11 h-11 rounded-full card flex items-center justify-center active:scale-90 transition-transform"><Icon n="plus" s={20} /></button>
          <div className="relative">
            <button onClick={() => setMenu(!menu)} className="w-11 h-11 rounded-full card flex items-center justify-center"><Icon n="sort" s={18} /></button>
            {menu && (<>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <motion.div initial={{ opacity: 0, scale: .92, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={SPRING}
                className="absolute right-0 top-12 z-20 w-52 glass-strong rounded-2xl overflow-hidden py-1">
                {[['balance', tr('sortByBalance')], ['name', tr('sortByName')], ['custom', tr('sortCustom')]].map(([v, l]) => (
                  <button key={v} onClick={() => { sortAccounts(v as any, (id) => accountBalance(id, operations)); setMenu(false); }}
                    className="w-full text-left px-4 py-3 text-[15px] font-semibold active:bg-white/5">{l}</button>
                ))}
              </motion.div>
            </>)}
          </div>
        </div>
      </div>
      <div className="px-4 pt-5 space-y-2 overflow-auto pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <button onClick={() => pick('all')} className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 card active:bg-white/8"
          style={scope === 'all' ? { borderColor: 'rgba(48,209,88,.5)' } : undefined}>
          <CatIcon icon="coins" color="#30d158" s={42} is={20} />
          <span className="flex-1 text-left text-[16px] font-bold">{tr('allAccounts')}</span>
          <span className="text-[15px] font-bold tabular-nums">{money(total, settings.currency)}</span>
          {scope === 'all' && <Icon n="check" s={18} c="text-inc" />}
        </button>
        {accounts.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: Math.min(i * .03, .18) }}
            className="flex items-center gap-2 rounded-2xl pl-3 pr-2 py-2.5 card"
            style={scope === a.id ? { borderColor: a.color + '77' } : undefined}>
            <button onClick={() => pick(a.id)} className="flex items-center gap-3 flex-1 text-left min-w-0">
              <CatIcon icon={a.icon} color={a.color} s={42} is={20} />
              <span className="flex-1 min-w-0">
                <span className="block text-[16px] font-semibold truncate">{a.name}</span>
                {a.hidden && <span className="block text-[12px] text-mut">скрыт из обзора</span>}
              </span>
              <span className="text-[15px] font-bold tabular-nums">{money(accountBalance(a.id, operations), a.currency)}</span>
              {scope === a.id && <Icon n="check" s={18} c="text-inc" />}
            </button>
            <button onClick={() => push('accountForm', { id: a.id })} className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center shrink-0 active:scale-90 transition-transform"><Icon n="pencil" s={15} /></button>
          </motion.div>
        ))}
      </div>
    </FullSheet>
  );
}