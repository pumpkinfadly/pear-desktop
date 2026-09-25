import { t } from '@/i18n';

import { providerNames } from './providers';

import type { SyncedLyricsPluginConfig } from './types';
import type { MenuContext } from '@/types/contexts';
import type { MenuItemConstructorOptions } from 'electron';

const translationLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'zh-CN', name: '简体中文 (Chinese Simplified)' },
  { code: 'zh-TW', name: '繁體中文 (Chinese Traditional)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'id', name: 'Bahasa Indonesia (Indonesian)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
  { code: 'th', name: 'ไทย (Thai)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
];

export const menu = async (
  ctx: MenuContext<SyncedLyricsPluginConfig>,
): Promise<MenuItemConstructorOptions[]> => {
  const config = await ctx.getConfig();

  return [
    {
      label: t('plugins.synced-lyrics.menu.preferred-provider.label'),
      toolTip: t('plugins.synced-lyrics.menu.preferred-provider.tooltip'),
      type: 'submenu',
      submenu: [
        {
          label: t('plugins.synced-lyrics.menu.preferred-provider.none.label'),
          toolTip: t(
            'plugins.synced-lyrics.menu.preferred-provider.none.tooltip',
          ),
          type: 'radio',
          checked: config.preferredProvider === undefined,
          click() {
            ctx.setConfig({ preferredProvider: undefined });
          },
        },
        ...providerNames.map(
          (provider) =>
            ({
              label: provider,
              type: 'radio',
              checked: config.preferredProvider === provider,
              click() {
                ctx.setConfig({ preferredProvider: provider });
              },
            }) as const,
        ),
      ],
    },
    {
      label: t('plugins.synced-lyrics.menu.precise-timing.label'),
      toolTip: t('plugins.synced-lyrics.menu.precise-timing.tooltip'),
      type: 'checkbox',
      checked: config.preciseTiming,
      click(item) {
        ctx.setConfig({
          preciseTiming: item.checked,
        });
      },
    },
    {
      label: t('plugins.synced-lyrics.menu.line-effect.label'),
      toolTip: t('plugins.synced-lyrics.menu.line-effect.tooltip'),
      type: 'submenu',
      submenu: [
        {
          label: t(
            'plugins.synced-lyrics.menu.line-effect.submenu.fancy.label',
          ),
          toolTip: t(
            'plugins.synced-lyrics.menu.line-effect.submenu.fancy.tooltip',
          ),
          type: 'radio',
          checked: config.lineEffect === 'fancy',
          click() {
            ctx.setConfig({
              lineEffect: 'fancy',
            });
          },
        },
        {
          label: t(
            'plugins.synced-lyrics.menu.line-effect.submenu.scale.label',
          ),
          toolTip: t(
            'plugins.synced-lyrics.menu.line-effect.submenu.scale.tooltip',
          ),
          type: 'radio',
          checked: config.lineEffect === 'scale',
          click() {
            ctx.setConfig({
              lineEffect: 'scale',
            });
          },
        },
        {
          label: t(
            'plugins.synced-lyrics.menu.line-effect.submenu.offset.label',
          ),
          toolTip: t(
            'plugins.synced-lyrics.menu.line-effect.submenu.offset.tooltip',
          ),
          type: 'radio',
          checked: config.lineEffect === 'offset',
          click() {
            ctx.setConfig({
              lineEffect: 'offset',
            });
          },
        },
        {
          label: t(
            'plugins.synced-lyrics.menu.line-effect.submenu.focus.label',
          ),
          toolTip: t(
            'plugins.synced-lyrics.menu.line-effect.submenu.focus.tooltip',
          ),
          type: 'radio',
          checked: config.lineEffect === 'focus',
          click() {
            ctx.setConfig({
              lineEffect: 'focus',
            });
          },
        },
      ],
    },
    {
      label: t('plugins.synced-lyrics.menu.default-text-string.label'),
      toolTip: t('plugins.synced-lyrics.menu.default-text-string.tooltip'),
      type: 'submenu',
      submenu: [
        { label: '♪', value: '♪' },
        { label: '" "', value: ' ' },
        { label: '...', value: ['.', '..', '...'] },
        { label: '•••', value: ['•', '••', '•••'] },
        { label: '———', value: '———' },
      ].map(({ label, value }) => ({
        label,
        type: 'radio',
        checked:
          typeof value === 'string'
            ? config.defaultTextString === value
            : JSON.stringify(config.defaultTextString) ===
              JSON.stringify(value),
        click() {
          ctx.setConfig({ defaultTextString: value });
        },
      })),
    },
    {
      label: t('plugins.synced-lyrics.menu.romanization.label'),
      toolTip: t('plugins.synced-lyrics.menu.romanization.tooltip'),
      type: 'checkbox',
      checked: config.romanization,
      click(item) {
        ctx.setConfig({
          romanization: item.checked,
        });
      },
    },
    {
      label: t('plugins.synced-lyrics.menu.translation.label'),
      toolTip: t('plugins.synced-lyrics.menu.translation.tooltip'),
      type: 'checkbox',
      checked: config.translation,
      click(item) {
        ctx.setConfig({
          translation: item.checked,
        });
      },
    },
    {
      label: t('plugins.synced-lyrics.menu.translation-language.label'),
      toolTip: t('plugins.synced-lyrics.menu.translation-language.tooltip'),
      type: 'submenu',
      submenu: translationLanguages.map(({ code, name }) => ({
        label: name,
        type: 'radio',
        checked: (config.translationLanguage ?? 'en') === code,
        click() {
          ctx.setConfig({ translationLanguage: code });
        },
      })),
    },
    {
      label: t('plugins.synced-lyrics.menu.convert-chinese-character.label'),
      toolTip: t(
        'plugins.synced-lyrics.menu.convert-chinese-character.tooltip',
      ),
      type: 'submenu',
      submenu: [
        {
          label: t(
            'plugins.synced-lyrics.menu.convert-chinese-character.submenu.disabled.label',
          ),
          toolTip: t(
            'plugins.synced-lyrics.menu.convert-chinese-character.submenu.disabled.tooltip',
          ),
          type: 'radio',
          checked:
            config.convertChineseCharacter === 'disabled' ||
            config.convertChineseCharacter === undefined,
          click() {
            ctx.setConfig({
              convertChineseCharacter: 'disabled',
            });
          },
        },
        {
          label: t(
            'plugins.synced-lyrics.menu.convert-chinese-character.submenu.simplified-to-traditional.label',
          ),
          toolTip: t(
            'plugins.synced-lyrics.menu.convert-chinese-character.submenu.simplified-to-traditional.tooltip',
          ),
          type: 'radio',
          checked: config.convertChineseCharacter === 'simplifiedToTraditional',
          click() {
            ctx.setConfig({
              convertChineseCharacter: 'simplifiedToTraditional',
            });
          },
        },
        {
          label: t(
            'plugins.synced-lyrics.menu.convert-chinese-character.submenu.traditional-to-simplified.label',
          ),
          toolTip: t(
            'plugins.synced-lyrics.menu.convert-chinese-character.submenu.traditional-to-simplified.tooltip',
          ),
          type: 'radio',
          checked: config.convertChineseCharacter === 'traditionalToSimplified',
          click() {
            ctx.setConfig({
              convertChineseCharacter: 'traditionalToSimplified',
            });
          },
        },
      ],
    },
    {
      label: t('plugins.synced-lyrics.menu.show-time-codes.label'),
      toolTip: t('plugins.synced-lyrics.menu.show-time-codes.tooltip'),
      type: 'checkbox',
      checked: config.showTimeCodes,
      click(item) {
        ctx.setConfig({
          showTimeCodes: item.checked,
        });
      },
    },
    {
      label: t('plugins.synced-lyrics.menu.show-lyrics-even-if-inexact.label'),
      toolTip: t(
        'plugins.synced-lyrics.menu.show-lyrics-even-if-inexact.tooltip',
      ),
      type: 'checkbox',
      checked: config.showLyricsEvenIfInexact,
      click(item) {
        ctx.setConfig({
          showLyricsEvenIfInexact: item.checked,
        });
      },
    },
  ];
};
