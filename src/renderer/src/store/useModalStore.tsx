import { create } from "zustand";
import {type ReactNode} from "react";

type ModalStore = {
    isOpened: boolean;

    content: ReactNode | null;
    setContent: (content: ReactNode | null) => void;

    title?: string;

    openModal: (content: ReactNode | null, title?: string) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
    isOpened: false,

    content: null,
    setContent: (content) => set({ content }),

    title: undefined,

    openModal: (content, title) => set({ isOpened: true, content, title: title }),
    closeModal: () => set({ isOpened: false, content: null }),
}));