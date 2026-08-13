import type { Locale } from '../types';

import en from './locales/en.json';
import ta from './locales/ta.json';
import hi from './locales/hi.json';
import bho from './locales/bho.json';
import or from './locales/or.json';
import bn from './locales/bn.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import mr from './locales/mr.json';
import as from './locales/as.json';

type Dictionary = Record<string, string>;

export const dictionaries: Record<Locale, Dictionary> = {
  en: en as Dictionary,
  ta: ta as Dictionary,
  hi: hi as Dictionary,
  bho: bho as Dictionary,
  or: or as Dictionary,
  bn: bn as Dictionary,
  te: te as Dictionary,
  kn: kn as Dictionary,
  mr: mr as Dictionary,
  as: as as Dictionary,
};

export interface LocaleMeta {
  code: Locale;
  /** The language name in its own script. Never a transliteration. */
  nativeName: string;
  /** Font family that carries the script. */
  fontFamily: string;
  /** BCP 47 tag handed to the Web Speech API. */
  speechTag: string;
  dir: 'ltr' | 'rtl';
}

/**
 * Bhojpuri is written in Devanagari and browsers do not ship a Bhojpuri voice.
 * The Hindi voice reads the Devanagari text closely enough to be useful on a
 * shop floor, so it is used rather than hiding the speaker.
 */
export const localeMeta: LocaleMeta[] = [
  { code: 'ta', nativeName: 'தமிழ்', fontFamily: "'Noto Sans Tamil'", speechTag: 'ta-IN', dir: 'ltr' },
  { code: 'en', nativeName: 'English', fontFamily: 'Inter', speechTag: 'en-IN', dir: 'ltr' },
  { code: 'hi', nativeName: 'हिन्दी', fontFamily: "'Noto Sans Devanagari'", speechTag: 'hi-IN', dir: 'ltr' },
  { code: 'bho', nativeName: 'भोजपुरी', fontFamily: "'Noto Sans Devanagari'", speechTag: 'hi-IN', dir: 'ltr' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', fontFamily: "'Noto Sans Oriya'", speechTag: 'or-IN', dir: 'ltr' },
  { code: 'bn', nativeName: 'বাংলা', fontFamily: "'Noto Sans Bengali'", speechTag: 'bn-IN', dir: 'ltr' },
  { code: 'te', nativeName: 'తెలుగు', fontFamily: "'Noto Sans Telugu'", speechTag: 'te-IN', dir: 'ltr' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', fontFamily: "'Noto Sans Kannada'", speechTag: 'kn-IN', dir: 'ltr' },
  { code: 'mr', nativeName: 'मराठी', fontFamily: "'Noto Sans Devanagari'", speechTag: 'mr-IN', dir: 'ltr' },
  { code: 'as', nativeName: 'অসমীয়া', fontFamily: "'Noto Sans Bengali'", speechTag: 'as-IN', dir: 'ltr' },
];

export const localeMetaByCode: Record<Locale, LocaleMeta> = localeMeta.reduce(
  (acc, m) => {
    acc[m.code] = m;
    return acc;
  },
  {} as Record<Locale, LocaleMeta>,
);

const warned = new Set<string>();

export type TranslateParams = Record<string, string | number>;

/**
 * Flat, dot namespaced lookup. A missing key falls back to English and warns
 * once, so a gap shows up in the console during a build rather than as an empty
 * button on a shop floor.
 */
export function translate(locale: Locale, key: string, params?: TranslateParams): string {
  const dict = dictionaries[locale] ?? dictionaries.en;
  let value = dict[key];

  if (value === undefined) {
    const warnKey = `${locale}:${key}`;
    if (!warned.has(warnKey)) {
      warned.add(warnKey);
      // eslint-disable-next-line no-console
      console.warn(`[i18n] missing key "${key}" for locale "${locale}", falling back to English`);
    }
    value = dictionaries.en[key];
  }

  if (value === undefined) {
    const warnKey = `en:${key}`;
    if (!warned.has(warnKey)) {
      warned.add(warnKey);
      // eslint-disable-next-line no-console
      console.warn(`[i18n] key "${key}" is missing from English as well`);
    }
    return key;
  }

  if (!params) return value;
  return Object.keys(params).reduce(
    (acc, name) => acc.split(`{${name}}`).join(String(params[name])),
    value,
  );
}

/** Keys present in English but absent from a locale. Used by the review file. */
export function missingKeys(locale: Locale): string[] {
  const base = Object.keys(dictionaries.en);
  const dict = dictionaries[locale];
  return base.filter((k) => dict[k] === undefined);
}
