import {create} from "zustand";

type launchButtonStore = {
    disabled: boolean,
    setDisabled: (disabled: boolean) => void,

    text: string,
    setText: (text: string) => void,
}

export const useLaunchButton = create<launchButtonStore>((set) => ({
    disabled: false,
    setDisabled: (disabled: boolean) => set({disabled}),

    text: "Играть",
    setText: (text: string) => set({text}),
}));

export default useLaunchButton;