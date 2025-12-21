import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthAccount = {
    username: string;
    authToken: string;
};

type AuthStore = {
    accounts: AuthAccount[];
    addAccount: (account: AuthAccount) => void;
    removeAccount: (username: string) => void;
    clearAccounts: () => void;

    selectedAccount: AuthAccount | null;
    setSelectedAccount: (username: string) => void;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            accounts: [],
            selectedAccount: null,

            addAccount: (account) =>
                set((state) => {
                    const withoutCurrent = state.accounts.filter(
                        (acc) => acc.username !== account.username
                    );

                    return {
                        accounts: [...withoutCurrent, account],
                        selectedAccount: account
                    };
                }),

            removeAccount: (username) =>
                set((state) => {
                    const newAccounts = state.accounts.filter(
                        (acc) => acc.username !== username
                    );

                    const newSelected = state.selectedAccount?.username === username
                        ? newAccounts.at(-1) || null
                        : state.selectedAccount;

                    return { accounts: newAccounts, selectedAccount: newSelected };
                }),

            clearAccounts: () => set({ accounts: [] }),

            setSelectedAccount: (username) =>
                set((state) => ({
                    selectedAccount: state.accounts.find(
                        (acc) => acc.username === username
                    ) || null
                })),
        }),
        {
            name: "auth-storage",
        }
    )
);