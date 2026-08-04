'use client';
import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Home from '@/screens/Home';
import AddOp from '@/screens/AddOp';
import Analytics from '@/screens/Analytics';
import Accounts from '@/screens/Accounts';
import AccountForm from '@/screens/AccountForm';
import Categories from '@/screens/Categories';
import CategoryForm from '@/screens/CategoryForm';
import Settings from '@/screens/Settings';
import Search from '@/screens/Search';
import AddButtons from '@/screens/AddButtons';
import { useData, useUI } from '@/lib/store';
import { Toast } from '@/components/ui';

export default function Page() {
  const stack = useUI((s) => s.stack);
  const settings = useData((s) => s.settings);

  useEffect(() => {
    if (!settings.reminderDays.length) return;
    const tick = () => {
      const now = new Date();
      const [h, m] = settings.reminderTime.split(':').map(Number);
      if (now.getHours() === h && now.getMinutes() === m && settings.reminderDays.includes(now.getDay())) {
        const key = 'rem-' + now.toDateString();
        if (localStorage.getItem(key)) return;
        localStorage.setItem(key, '1');
        useUI.getState().showToast('Не забудьте внести операции');
        if ('Notification' in window && Notification.permission === 'granted') new Notification('Баланс', { body: 'Время внести операции за сегодня' });
        else if ('Notification' in window && Notification.permission !== 'denied') Notification.requestPermission();
      }
    };
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [settings.reminderDays, settings.reminderTime]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
    }
  }, []);

  const render = (name: string, params: any) => {
    switch (name) {
      case 'add': return <AddOp params={params} />;
      case 'analytics': return <Analytics />;
      case 'accounts': return <Accounts />;
      case 'accountForm': return <AccountForm params={params} />;
      case 'categories': return <Categories />;
      case 'categoryForm': return <CategoryForm params={params} />;
      case 'settings': return <Settings />;
      case 'search': return <Search />;      
      case 'addButtons': return <AddButtons />;
      default: return null;
    }
  };

  return (
    <>
      <Home />
      <AnimatePresence>
        {stack.map((s) => <React.Fragment key={s.id}>{render(s.name, s.params)}</React.Fragment>)}
      </AnimatePresence>
      <Toast />
    </>
  );
}