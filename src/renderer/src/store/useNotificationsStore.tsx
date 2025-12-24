import {create} from "zustand";

export type Notification = {
    id?: number,
    type: "success" | "info" | "error",
    text: string,
    shake?: boolean,
}

type NotificationsStore = {
    notifications: Notification[],
    addNotification: (notification: Notification) => void,
    removeNotification: (id: number) => void,
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
    notifications: [],

    addNotification: (notification) => {
        const id = Date.now();
        set(state => ({
            notifications: [...state.notifications, { ...notification, id }]
        }));

        setTimeout(() => {
            get().removeNotification(id);
        }, 2500);
    },

    removeNotification: (id: number) => set(state => ({notifications: state.notifications.filter(n => n.id !== id)})),
}));