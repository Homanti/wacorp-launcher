import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
    selectedRam: number;
    setSelectedRam: (v: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            selectedRam: 0,
            setSelectedRam: (v) => set({ selectedRam: v }),
        }),
        { name: "settings" }
    )
);
