import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
    selectedRam: number;
    setSelectedRam: (v: number) => void;

    hideLauncher: boolean;
    setHideLauncher: (v: boolean) => void;

    snowVisible: boolean;
    setSnowVisible: (v: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            selectedRam: 0,
            setSelectedRam: (v) => set({ selectedRam: v }),

            hideLauncher: false,
            setHideLauncher: (v) => set({ hideLauncher: v }),

            snowVisible: true,
            setSnowVisible: (v) => set({ snowVisible: v }),
        }),
        { name: "settings" }
    )
);
