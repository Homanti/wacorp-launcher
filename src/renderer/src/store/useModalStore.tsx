import { create } from "zustand";
import {type ReactNode} from "react";

type ModalStore = {
    isOpened: boolean;

    content: ReactNode | null;
    setContent: (content: ReactNode | null) => void;

    title?: string;

    openModal: (content: ReactNode | null, title?: string, closeAvaliable?: boolean) => void;
    closeModal: () => void;

    closeAvaliable?: boolean;
}

export const useModalStore = create<ModalStore>((set) => ({
    isOpened: false,

    content: null,
    setContent: (content) => set({ content }),

    title: undefined,

    closeAvaliable: true,
    openModal: (content, title, closeAvaliable) => set({ isOpened: true, content, title: title, closeAvaliable: closeAvaliable }),

    closeModal: () => set({ isOpened: false, content: null }),
}));