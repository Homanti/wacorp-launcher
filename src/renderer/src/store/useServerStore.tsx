import { create } from 'zustand';

interface ServerStore {
    serverStatus: number | boolean;
    setServerStatus: (status: number | boolean) => void;
}

const useServerStore = create<ServerStore>((set) => ({
    serverStatus: false,
    setServerStatus: (status) => set({ serverStatus: status })
}));

export default useServerStore;