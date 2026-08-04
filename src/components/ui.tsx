'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { clsx } from 'clsx';
import { Icon } from '@/lib/icons';
import { useUI, haptic } from '@/lib/store';
import { fmtNum } from '@/lib/calc';

export const cx = clsx;
export const SPRING = { type: 'spring', stiffness: 380, damping: 34 } as const;
export const Grabber = () => <div className="w-9 h-[5px] rounded-full bg-white/20 mx-auto mt-2.5 mb-1 shrink-0" />;

/** ripple без ререндеров */
function useRipple() {
  return (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const d = Math.max(r.width, r.height);
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.width = s.style.height = d + 'px';
    s.style.left = e.clientX - r.left - d / 2 + 'px';
    s.style.top = e.clientY - r.top - d / 2 + 'px';
    el.appendChild(s);
    s.addEventListener('animationend', () => s.remove(), { once: true });
  };
}

export function FullSheet({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="fixed inset-0 z-40 bg-bg text-txt flex flex-col overflow-hidden"
      initial={{ y: '14%', opacity: 0, scale: .985 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: '10%', opacity: 0, scale: .99 }}
      transition={SPRING} style={{ willChange: 'transform,opacity' }}>
      <div className="pt-[env(safe-area-inset-top)]" />
      <Grabber />
      {children}
    </motion.div>
  );
}
export function BottomSheet({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div className="absolute inset-0 bg-black/65" style={{ backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="relative w-full max-w-md glass-strong rounded-t-[28px] pb-[env(safe-area-inset-bottom)]"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={SPRING}
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: .6 }}
        onDragEnd={(_, i) => { if (i.offset.y > 110 || i.velocity.y > 500) onClose?.(); }} style={{ willChange: 'transform' }}>
        <Grabber />{children}
      </motion.div>
    </motion.div>
  );
}
export function IconBtn({ icon, onClick, s = 20, className }: any) {
  const rip = useRipple();
  return (
    <motion.button whileTap={{ scale: 0.86 }} onPointerDown={rip} onClick={() => { haptic(); onClick?.(); }}
      className={cx('ripple-host w-11 h-11 rounded-full card flex items-center justify-center shrink-0', className)}>
      <Icon n={icon} s={s} />
    </motion.button>
  );
}
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => { haptic(); onChange(!on); }} aria-pressed={on}
      className={cx('relative w-[51px] h-[31px] rounded-full shrink-0 transition-colors duration-300', on ? 'bg-inc' : 'bg-white/15')}>
      <span className={cx('absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,.35)] transition-transform duration-300', on && 'translate-x-[20px]')} />
    </button>
  );
}
export function Row({ icon, iconBg, label, value, onClick, right, dim }: any) {
  const rip = useRipple();
  return (
    <button onPointerDown={rip} onClick={onClick}
      className={cx('ripple-host w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/5', dim && 'opacity-50')}>
      {icon && <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: (iconBg || '#8b9097') + '26', color: iconBg || '#aaa' }}><Icon n={icon} s={19} /></span>}
      <span className="flex-1 text-[16px] font-semibold leading-tight">{label}</span>
      {value != null && <span className="text-[15px] text-mut font-medium">{value}</span>}
      {right}
    </button>
  );
}
export const SectionTitle = ({ children }: any) => <div className="px-5 pt-6 pb-2 text-[13px] font-semibold text-mut tracking-wide uppercase">{children}</div>;
export function BigButton({ children, onClick, disabled, danger }: any) {
  const rip = useRipple();
  return (
    <motion.button whileTap={{ scale: 0.97 }} onPointerDown={rip} disabled={disabled} onClick={onClick}
      className={cx('ripple-host w-full h-14 rounded-2xl text-[17px] font-bold flex items-center justify-center gap-2 transition-opacity',
        danger ? 'bg-dang/15 text-dang' : 'bg-txt text-black shadow-[0_10px_30px_rgba(255,255,255,.12)] disabled:opacity-40')}>
      {children}
    </motion.button>
  );
}
export function CatIcon({ icon, color, s = 40, is = 20 }: any) {
  return <span className="rounded-2xl flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]" style={{ width: s, height: s, background: `linear-gradient(145deg, ${color}33, ${color}1f)`, color }}><Icon n={icon} s={is} /></span>;
}
/** плавное число */
export function Num({ value, f }: { value: number; f: (v: number) => string }) {
  const mv = useMotionValue(value);
  const sp = useSpring(mv, { stiffness: 220, damping: 28 });
  const [txt, setTxt] = useState(f(value));
  useEffect(() => mv.set(value), [value]);
  useEffect(() => sp.on('change', (v) => setTxt(f(v))), []);
  return <span className="tabular-nums">{txt}</span>;
}
export const fmtMoneyNum = (v: number, cur: string) => `${fmtNum(Math.round(v * 100) / 100)} ${cur}`;
/** FAB: центрирование на обёртке — сбить невозможно */
export function FAB({ onClick }: { onClick: () => void }) {
  const rip = useRipple();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center pb-[calc(env(safe-area-inset-bottom)+22px)]">
      <motion.button whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.04 }} onPointerDown={rip} onClick={() => { haptic(12); onClick(); }}
        className="ripple-host pointer-events-auto w-[76px] h-[76px] rounded-full bg-txt text-black flex items-center justify-center
        shadow-[0_16px_40px_rgba(0,0,0,.6),0_4px_14px_rgba(255,255,255,.15),inset_0_-2px_6px_rgba(0,0,0,.15)]">
        <Icon n="plus" s={28} w={2.2} />
      </motion.button>
    </div>
  );
}
export function Toast() {
  const toast = useUI((s) => s.toast);
  return (
    <div className="fixed top-[calc(env(safe-area-inset-top)+12px)] left-0 right-0 z-[70] flex justify-center pointer-events-none px-4">
      {toast && <motion.div initial={{ y: -48, opacity: 0, scale: .9 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={SPRING}
        className="px-4 py-2.5 rounded-full glass-strong text-[14px] font-semibold">{toast}</motion.div>}
    </div>
  );
}
export function Confirm({ text, hint, onYes, onNo }: any) {
  return (
    <BottomSheet onClose={onNo}>
      <div className="p-5 pt-3 space-y-4">
        <div className="text-[17px] font-bold">{text}</div>
        {hint && <div className="text-[14px] text-mut -mt-2">{hint}</div>}
        <div className="grid grid-cols-2 gap-3">
          <BigButton onClick={onNo}>Отмена</BigButton>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onYes} className="h-14 rounded-2xl bg-dang text-white text-[16px] font-bold shadow-[0_10px_30px_rgba(255,69,58,.35)]">Удалить</motion.button>
        </div>
      </div>
    </BottomSheet>
  );
}