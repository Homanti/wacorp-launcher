import {create} from "zustand";

type progressBarStore = {
    percent: number | null,
    setPercent: (progress: number) => void,

    description?: string,
    setDescription: (description: string) => void,

    isVisible: boolean,
    setIsVisible: (isVisible: boolean) => void,
}

export const useProgressBarStore = create<progressBarStore>((set) => ({
    percent: null,
    setPercent: (percent: number) => set({percent}),

    description: "",
    setDescription: (description: string) => set({description}),

    isVisible: false,
    setIsVisible: (isVisible: boolean) => set({isVisible})
}));

export default useProgressBarStore;