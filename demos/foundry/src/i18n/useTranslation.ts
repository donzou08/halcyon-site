import { useCallback, useEffect } from 'react';

import { useStore } from '../store/useStore';
import { localeMetaByCode, translate, type TranslateParams } from './index';
import type { Locale } from '../types';

export interface Translation {
  t: (key: string, params?: TranslateParams) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  fontFamily: string;
  speechTag: string;
  dir: 'ltr' | 'rtl';
}

export function useTranslation(): Translation {
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);
  const meta = localeMetaByCode[locale] ?? localeMetaByCode.en;

  const t = useCallback(
    (key: string, params?: TranslateParams) => translate(locale, key, params),
    [locale],
  );

  return { t, locale, setLocale, fontFamily: meta.fontFamily, speechTag: meta.speechTag, dir: meta.dir };
}

/**
 * Sets lang and dir on the root element and swaps the font stack when the
 * locale changes. Only the worker application drives this, since the owner
 * application and the landing page are in English.
 */
export function useDocumentLocale(locale: Locale, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const meta = localeMetaByCode[locale] ?? localeMetaByCode.en;
    const root = document.documentElement;
    const previousLang = root.lang;
    const previousDir = root.dir;

    root.lang = locale;
    root.dir = meta.dir;

    return () => {
      root.lang = previousLang;
      root.dir = previousDir;
    };
  }, [locale, enabled]);
}

/** True when the browser can speak the given tag. */
export function hasVoiceFor(tag: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return false;
  const base = tag.split('-')[0];
  return voices.some((v) => v.lang === tag || v.lang.replace('_', '-').split('-')[0] === base);
}

/** Reads a line aloud. Fails silently, which is the point of it. */
export function speak(text: string, tag: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = tag;
    utterance.rate = 0.92;
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang === tag);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  } catch {
    /* No voice available. The speaker is hidden rather than showing an error. */
  }
}
