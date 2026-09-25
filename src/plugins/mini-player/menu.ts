import { t } from '@/i18n';

import type { MiniPlayerPluginConfig } from './index';
import type { MenuContext } from '@/types/contexts';
import type { MenuItemConstructorOptions } from 'electron';

const backgroundOpacities = [
  { value: 1, key: 'solid' },
  { value: 0.75, key: 'seventy-five' },
  { value: 0.5, key: 'fifty' },
  { value: 0.25, key: 'twenty-five' },
  { value: 0.1, key: 'ten' },
];

const lyricsColors = [
  { code: '#ffffff', key: 'white' },
  { code: '#ffd700', key: 'gold' },
  { code: '#ffd54f', key: 'yellow' },
  { code: '#4dd0e1', key: 'cyan' },
  { code: '#64b5f6', key: 'light-blue' },
  { code: '#69f0ae', key: 'green' },
  { code: '#ff5252', key: 'red' },
  { code: '#f48fb1', key: 'pink' },
];

export const menu = async (
  ctx: MenuContext<MiniPlayerPluginConfig>,
): Promise<MenuItemConstructorOptions[]> => {
  const config = await ctx.getConfig();

  return [
    {
      label: t('plugins.mini-player.menu.visible.label'),
      toolTip: t('plugins.mini-player.menu.visible.tooltip'),
      type: 'checkbox',
      checked: config.visible,
      click(item) {
        ctx.setConfig({
          visible: item.checked,
        });
      },
    },
    {
      label: t('plugins.mini-player.menu.always-on-top.label'),
      toolTip: t('plugins.mini-player.menu.always-on-top.tooltip'),
      type: 'checkbox',
      checked: config.alwaysOnTop ?? true,
      click(item) {
        ctx.setConfig({
          alwaysOnTop: item.checked,
        });
      },
    },
    {
      label: t('plugins.mini-player.menu.hide-meta.label'),
      toolTip: t('plugins.mini-player.menu.hide-meta.tooltip'),
      type: 'checkbox',
      checked: config.hideMeta ?? false,
      click(item) {
        ctx.setConfig({
          hideMeta: item.checked,
        });
      },
    },
    {
      label: t('plugins.mini-player.menu.show-lyrics.label'),
      toolTip: t('plugins.mini-player.menu.show-lyrics.tooltip'),
      type: 'checkbox',
      checked: config.showLyricsArea ?? true,
      click(item) {
        ctx.setConfig({
          showLyricsArea: item.checked,
        });
      },
    },
    {
      label: t('plugins.mini-player.menu.bg-opacity.label'),
      toolTip: t('plugins.mini-player.menu.bg-opacity.tooltip'),
      type: 'submenu',
      submenu: backgroundOpacities.map(({ value, key }) => ({
        label: t(`plugins.mini-player.menu.bg-opacity.values.${key}`),
        type: 'radio',
        checked:
          Math.abs(
            value -
              Math.max(
                0.01,
                config.backgroundOpacity ?? (config.transparentBg ? 0.01 : 1),
              ),
          ) < 0.001,
        click() {
          ctx.setConfig({ backgroundOpacity: value });
        },
      })),
    },
    {
      label: t('plugins.mini-player.menu.lyrics-outline.label'),
      toolTip: t('plugins.mini-player.menu.lyrics-outline.tooltip'),
      type: 'checkbox',
      checked: config.lyricsOutline ?? false,
      click(item) {
        ctx.setConfig({
          lyricsOutline: item.checked,
        });
      },
    },
    {
      label: t('plugins.mini-player.menu.lyrics-emphasis.label'),
      toolTip: t('plugins.mini-player.menu.lyrics-emphasis.tooltip'),
      type: 'submenu',
      submenu: (
        [
          ['none', 'plugins.mini-player.menu.lyrics-emphasis.none'],
          ['subtle', 'plugins.mini-player.menu.lyrics-emphasis.subtle'],
          ['normal', 'plugins.mini-player.menu.lyrics-emphasis.normal'],
          ['strong', 'plugins.mini-player.menu.lyrics-emphasis.strong'],
        ] as const
      ).map(([value, key]) => ({
        label: t(key),
        type: 'radio',
        checked: (config.lyricsEmphasis ?? 'normal') === value,
        click() {
          ctx.setConfig({ lyricsEmphasis: value });
        },
      })),
    },
    {
      label: t('plugins.mini-player.menu.lyrics-color.label'),
      toolTip: t('plugins.mini-player.menu.lyrics-color.tooltip'),
      type: 'submenu',
      submenu: lyricsColors.map(({ code, key }) => ({
        label: t(`plugins.mini-player.menu.lyrics-color.colors.${key}`),
        type: 'radio',
        checked: (config.lyricsColor ?? '#ffffff') === code,
        click() {
          ctx.setConfig({ lyricsColor: code });
        },
      })),
    },
  ];
};
