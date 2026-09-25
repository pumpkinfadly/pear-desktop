import { createEffect, onCleanup, runWithOwner } from 'solid-js';

import { createRenderer } from '@/utils';
import { waitForElement } from '@/utils/wait-for-element';

import { disposeReactiveRoot, reactiveOwner } from './reactive-root';
import { config, setConfig, setCurrentTime } from './renderer';
import { currentLyrics, fetchLyrics } from './store';
import { romanize, selectors, tabStates, translateIfNeeded } from './utils';

import type { SyncedLyricsPluginConfig } from '../types';
import type { SongInfo } from '@/providers/song-info';
import type { RendererContext } from '@/types/contexts';
import type { MusicPlayer } from '@/types/music-player';

export let _ytAPI: MusicPlayer | null = null;
export let netFetch: (
  url: string,
  init?: RequestInit,
) => Promise<[number, string, Record<string, string>]>;

export const renderer = createRenderer<
  {
    observerCallback: MutationCallback;
    observer?: MutationObserver;
    videoDataChange: () => Promise<void>;
    updateTimestampInterval?: NodeJS.Timeout | string | number;
  },
  SyncedLyricsPluginConfig
>({
  onConfigChange(newConfig) {
    setConfig(newConfig);
  },

  observerCallback(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      const header = mutation.target as HTMLElement;

      switch (mutation.attributeName) {
        case 'disabled':
          header.removeAttribute('disabled');
          break;
        case 'aria-selected':
          tabStates[header.ariaSelected ?? 'false']();
          break;
      }
    }
  },

  async onPlayerApiReady(api: MusicPlayer) {
    _ytAPI = api;

    api.addEventListener('videodatachange', this.videoDataChange);

    await this.videoDataChange();
  },
  async videoDataChange() {
    if (!this.updateTimestampInterval) {
      this.updateTimestampInterval = setInterval(
        () => setCurrentTime((_ytAPI?.getCurrentTime() ?? 0) * 1000),
        100,
      );
    }

    // prettier-ignore
    this.observer ??= new MutationObserver(this.observerCallback);
    this.observer.disconnect();

    // Force the lyrics tab to be enabled at all times.
    const header = await waitForElement<HTMLElement>(selectors.head);
    {
      header.removeAttribute('disabled');
      tabStates[header.ariaSelected ?? 'false']();
    }

    this.observer.observe(header, { attributes: true });
    header.removeAttribute('disabled');
  },

  async start(ctx: RendererContext<SyncedLyricsPluginConfig>) {
    netFetch = ctx.ipc.invoke.bind(ctx.ipc, 'synced-lyrics:fetch');

    setConfig(await ctx.getConfig());

    ctx.ipc.on('peard:update-song-info', (info: SongInfo) => {
      fetchLyrics(info);
    });

    // Broadcast enriched lyrics (text + romaji + translation) for the
    // mini-player window. Guarded by a token so stale async runs are dropped.
    let broadcastToken = 0;
    runWithOwner(reactiveOwner, () => {
      createEffect(() => {
        const lyrics = currentLyrics();
        const conf = config();
        const lines = lyrics?.data?.lines;

        const token = ++broadcastToken;
        onCleanup(() => {
          broadcastToken++;
        });
        const send = (payload: unknown) => {
          if (token === broadcastToken) {
            ctx.ipc.send('synced-lyrics:mini-lyrics', payload);
          }
        };

        if (!lines?.length) {
          if (lyrics?.state === 'fetching') {
            send({ state: 'loading' });
          } else if (lyrics) {
            send({ state: 'none' });
          }
          return;
        }

        const enrich = async () => {
          const out: {
            timeInMs: number;
            text: string;
            romaji?: string;
            translation?: string;
          }[] = lines.map((line) => ({
            timeInMs: line.timeInMs,
            text: line.text,
          }));

          // bounded concurrency pool: keeps lyric order while running
          // several romanize/translate tasks in parallel
          const CONCURRENCY = 4;
          let cursor = 0;
          const worker = async () => {
            while (cursor < lines.length) {
              const i = cursor++;
              const line = lines[i];
              const entry = out[i];
              if (!line || !entry) continue;

              if (conf?.romanization) {
                try {
                  const result = await romanize(line.text);
                  if (result && result !== line.text) entry.romaji = result;
                } catch {
                  entry.romaji = undefined;
                }
              }

              if (conf?.translation) {
                entry.translation = await translateIfNeeded(
                  line.text,
                  conf.translationLanguage ?? 'en',
                );
              }
            }
          };
          await Promise.all(
            Array.from({ length: Math.min(CONCURRENCY, lines.length) }, () =>
              worker(),
            ),
          );
          send({ state: 'lines', lines: out });
        };
        enrich();
      });
    });
  },

  stop(ctx: RendererContext<SyncedLyricsPluginConfig>) {
    disposeReactiveRoot();
    ctx.ipc.send('synced-lyrics:mini-lyrics', { state: 'none' });
  },
});
