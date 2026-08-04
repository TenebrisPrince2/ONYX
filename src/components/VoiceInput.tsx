'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData, useUI, haptic } from '@/lib/store';
import { Icon } from '@/lib/icons';
import { BottomSheet, BigButton, CatIcon, SPRING } from '@/components/ui';
import { tr } from '@/lib/i18n';
import { money, evalExpr } from '@/lib/calc';
import { CURRENCIES } from '@/lib/meta';

interface VoiceResult {
  text: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'adjust';
  categoryId: string | null;
  accountId: string;
  currency: string;
  note: string;
}

export function VoiceInputSheet({ onClose }: { onClose: () => void }) {
  const data = useData();
  const { push, showToast } = useUI();
  const [phase, setPhase] = useState<'listening' | 'processing' | 'result'>('listening');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>();

  const startListening = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      showToast('Голосовой ввод не поддерживается');
      onClose();
      return;
    }

    const rec = new SR();
    rec.lang = 'ru-RU';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setPhase('listening');
      startVolumeMonitoring();
    };

    rec.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      processVoiceInput(transcript);
    };

    rec.onerror = (e: any) => {
      stopVolumeMonitoring();
      setPhase('listening');
      if (e.error === 'no-speech') {
        showToast('Речь не обнаружена');
      } else if (e.error === 'not-allowed') {
        showToast('Доступ к микрофону запрещён');
        onClose();
      }
    };

    rec.onend = () => {
      stopVolumeMonitoring();
      if (phase === 'listening') {
        setPhase('processing');
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const startVolumeMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const updateVolume = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(Math.min(1, avg / 128));
        rafRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.warn('Volume monitoring failed:', e);
    }
  };

  const stopVolumeMonitoring = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setVolume(0);
  };

  const processVoiceInput = (text: string) => {
    setPhase('processing');
    
    // Extract amount using regex - supports various formats
    const amountMatch = text.match(/(\d+[.,]\d+|\d+)\s?(?:руб(?:лей)?|₽|rub|byr|byn|бел|долл(?:ар)?|\$|eur|€)/i);
    let amount = 0;
    let currency = data.settings.currency;
    
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(',', '.'));
      const currText = amountMatch[0].toLowerCase();
      if (currText.includes('руб') || currText.includes('₽')) currency = 'RUB';
      else if (currText.includes('byn') || currText.includes('бел')) currency = 'BYN';
      else if (currText.includes('долл') || currText.includes('$')) currency = 'USD';
      else if (currText.includes('eur') || currText.includes('€')) currency = 'EUR';
    } else {
      // Try to find just numbers
      const numMatch = text.match(/\d+/g);
      if (numMatch) {
        // Take the last number as amount
        amount = parseInt(numMatch[numMatch.length - 1]);
      }
    }

    // Determine type (income vs expense)
    const lower = text.toLowerCase();
    let type: 'income' | 'expense' = 'expense';
    if (lower.includes('получил') || lower.includes('заработал') || lower.includes('доход') || 
        lower.includes('пришло') || lower.includes('перевели') || lower.includes('зарплата')) {
      type = 'income';
    }

    // Find best matching category using semantic analysis
    let categoryId: string | null = null;
    const cats = data.categories.filter((c) => c.type === type);
    
    // Keyword mappings for semantic matching
    const keywordMap: Record<string, string[]> = {
      'products': ['магазин', 'продукт', 'еда', 'купил', 'кушать', 'шарага', 'столовая', 'перекус'],
      'transport': ['такси', 'транспорт', 'метро', 'автобус', 'бензин', 'заправка', 'uber', 'bolt'],
      'cafe': ['кафе', 'ресторан', 'кофе', 'ужин', 'обед', 'завтрак', 'пицца', 'суши'],
      'shopping': ['одежда', 'обувь', 'техника', 'маркетплейс', 'wildberries', 'ozon'],
      'entertainment': ['кино', 'фильм', 'подписка', 'нетфликс', 'spotify', 'музыка', 'игра'],
      'health': ['аптека', 'лекарство', 'врач', 'медицина', 'здоровье'],
      'home': ['дом', 'квартира', 'аренда', 'коммуналка', 'ремонт'],
      'salary': ['зарплата', 'премия', 'бонус', 'доход'],
      'gift': ['подарок', 'деньги', 'перевод'],
    };

    let bestScore = 0;
    for (const cat of cats) {
      let score = 0;
      const catLower = cat.name.toLowerCase();
      
      // Direct match
      if (lower.includes(catLower)) score += 10;
      
      // Keyword match
      for (const [key, keywords] of Object.entries(keywordMap)) {
        if (catLower.includes(key) || key.includes(catLower)) {
          for (const kw of keywords) {
            if (lower.includes(kw)) score += 5;
          }
        }
      }
      
      // Check category icon/name hints
      const iconHints: Record<string, string[]> = {
        'cart': ['магазин', 'продукт', 'купил'],
        'food': ['еда', 'кушать', 'шарага', 'столовая'],
        'car': ['такси', 'транспорт', 'бензин'],
        'coffee': ['кафе', 'кофе', 'ресторан'],
      };
      if (iconHints[cat.icon]) {
        for (const hint of iconHints[cat.icon]) {
          if (lower.includes(hint)) score += 3;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        categoryId = cat.id;
      }
    }

    // Select account
    const accountId = data.accounts[0]?.id ?? '';
    
    setResult({
      text,
      amount,
      type,
      categoryId,
      accountId,
      currency,
      note: text,
    });
    
    setTimeout(() => {
      setPhase('result');
      haptic(8);
    }, 800);
  };

  useEffect(() => {
    startListening();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopVolumeMonitoring();
    };
  }, []);

  const handleConfirm = () => {
    if (!result) return;
    haptic(12);
    data.addOperation({
      type: result.type,
      amount: result.amount,
      accountId: result.accountId,
      toAccountId: null,
      categoryId: result.categoryId,
      note: result.note,
      date: new Date().toISOString(),
      currency: result.currency,
      img: null,
    });
    showToast(tr('saved'));
    onClose();
  };

  const handleEdit = () => {
    if (!result) return;
    push('add', {
      voiceData: {
        type: result.type,
        amount: String(result.amount).replace('.', ','),
        accountId: result.accountId,
        categoryId: result.categoryId,
        note: result.note,
        currency: result.currency,
      },
    });
    onClose();
  };

  return (
    <BottomSheet onClose={onClose}>
      <div className="p-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <AnimatePresence mode="wait">
          {phase === 'listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={SPRING}
              className="flex flex-col items-center py-8"
            >
              {/* Animated microphone with glow */}
              <div className="relative mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full bg-inc/30 blur-xl"
                  animate={{
                    scale: [1, 1.4 + volume * 0.6, 1],
                    opacity: [0.3, 0.6 + volume * 0.3, 0.3],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-inc/40 to-inc/20 flex items-center justify-center backdrop-blur-sm border border-inc/30"
                  animate={{
                    scale: [1, 1.08 + volume * 0.2, 1],
                  }}
                  transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Icon n="mic" s={36} c="text-inc" />
                </motion.div>
              </div>
              
              {/* Volume bars visualization */}
              <div className="flex items-center gap-1 h-12 mb-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 rounded-full bg-inc/60"
                    animate={{
                      height: [8, 16 + Math.random() * volume * 32, 8],
                    }}
                    transition={{
                      duration: 0.15,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              
              <div className="text-[17px] font-semibold text-mut">{tr('saySomething')}</div>
              <button
                onClick={() => {
                  if (recognitionRef.current) recognitionRef.current.stop();
                  setPhase('processing');
                }}
                className="mt-6 px-6 py-3 rounded-full card text-[15px] font-semibold active:scale-95 transition-transform"
              >
                Завершить
              </button>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING}
              className="flex flex-col items-center py-12"
            >
              <div className="relative mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full bg-txt/20 blur-lg"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center relative z-10">
                  <Icon n="spark" s={32} c="text-txt" />
                </div>
              </div>
              <div className="text-[17px] font-semibold">{tr('processingVoice')}</div>
            </motion.div>
          )}

          {phase === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={SPRING}
              className="space-y-4"
            >
              {/* Recognized text */}
              <div className="card rounded-2xl p-4">
                <div className="text-[12px] font-semibold text-mut mb-1">{tr('voiceDetected')}</div>
                <div className="text-[15px] leading-snug">&laquo;{result.text}&raquo;</div>
              </div>

              {/* Operation preview card */}
              <div className="glass rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-mut">{tr('type')}</span>
                  <span className={`text-[15px] font-bold ${result.type === 'income' ? 'text-inc' : 'text-exp'}`}>
                    {result.type === 'income' ? '+' : '-'}{money(result.amount, result.currency)}
                  </span>
                </div>
                
                {result.categoryId && (
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold text-mut w-20">{tr('suggestedCategory')}</span>
                    {(() => {
                      const cat = data.categories.find((c) => c.id === result.categoryId);
                      return cat ? (
                        <div className="flex items-center gap-2">
                          <CatIcon icon={cat.icon} color={cat.color} s={28} is={14} />
                          <span className="text-[15px] font-semibold">{cat.name}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-mut w-20">{tr('account')}</span>
                  {(() => {
                    const acc = data.accounts.find((a) => a.id === result.accountId);
                    return acc ? (
                      <div className="flex items-center gap-2">
                        <CatIcon icon={acc.icon} color={acc.color} s={28} is={14} />
                        <span className="text-[15px] font-semibold">{acc.name}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <BigButton onClick={handleEdit}>{tr('changeOperation')}</BigButton>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  className="h-14 rounded-2xl bg-txt text-black text-[17px] font-bold flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,.12)]"
                >
                  <Icon n="check" s={20} />
                  {tr('confirmOperation')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BottomSheet>
  );
}
