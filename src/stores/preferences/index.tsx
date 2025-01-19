import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface PreferencesStore {
  enableThumbnails: boolean;
  enableAutoplay: boolean;
  enableDiscover: boolean;
  sourceOrder: string[];
  enableSourceOrder: boolean;

  setEnableThumbnails(v: boolean): void;
  setEnableAutoplay(v: boolean): void;
  setEnableDiscover(v: boolean): void;
  setSourceOrder(v: string[]): void;
  setenableSourceOrder(v: boolean): void;
}

export const usePreferencesStore = create(
  persist(
    immer<PreferencesStore>((set) => ({
      enableThumbnails: false,
      enableAutoplay: true,
      enableDiscover: true,
      sourceOrder: [],
      enableSourceOrder: false,
      setEnableThumbnails(v) {
        set((s) => {
          s.enableThumbnails = v;
        });
      },
      setEnableAutoplay(v) {
        set((s) => {
          s.enableAutoplay = v;
        });
      },
      setEnableDiscover(v) {
        set((s) => {
          s.enableDiscover = v;
        });
      },
      setSourceOrder(v) {
        set((s) => {
          s.sourceOrder = v;
        });
      },
      setenableSourceOrder(v) {
        set((s) => {
          s.enableSourceOrder = v;
        });
      },
    })),
    {
      name: "__MW::preferences",
    },
  ),
);
