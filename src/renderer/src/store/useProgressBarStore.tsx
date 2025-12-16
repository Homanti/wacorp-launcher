import {create} from "zustand";

type progressBarStore = {
    progress: number,
    setProgress: (progress: number) => void,

    maxValue: number,
    setMaxValue: (maxValue: number) => void,

    description?: string,
    setDescription: (description: string) => void,

    isVisible: boolean,
    setIsVisible: (isVisible: boolean) => void,
}

export const useProgressBarStore = create<progressBarStore>((set) => ({
    progress: 0,
    setProgress: (progress: number) => set({progress}),

    maxValue: 0,
    setMaxValue: (maxValue: number) => set({maxValue}),

    description: "",
    setDescription: (description: string) => set({description}),

    isVisible: false,
    setIsVisible: (isVisible: boolean) => set({isVisible})
}));

export default useProgressBarStore;