import {create} from "zustand";
import {persist} from "zustand/middleware";
import apiClient from "../utils/api";
import {AxiosError} from "axios";
import {useNotificationsStore} from "./useNotificationsStore";

export type AuthAccount = {
    username: string;
    accessToken: string;
    refreshToken: string;
    minecraftAccessToken?: string;
    uuid?: string;
};

type AuthStore = {
    accounts: AuthAccount[];
    addAccount: (account: AuthAccount) => void;
    removeAccount: (username: string) => void;
    clearAccounts: () => void;
    updateAccount: (account: AuthAccount) => void;
    selectedAccount: AuthAccount | null;

    setSelectedAccount: (username: string) => void;

    login: (username: string, password: string) => Promise<boolean>;
    register: (formData: FormData) => Promise<boolean>;
    validateToken: (accessToken: string) => Promise<AuthAccount | null>;
    refreshToken: (refreshToken: string) => Promise<AuthAccount | null>;
    validateAndRefresh: (accessToken: string, refreshToken: string) => Promise<AuthAccount | null>;
};

type RefreshResponse = {
    access_token: string;
    refresh_token: string;
};

let refreshPromise: Promise<AuthAccount | null> | null = null;

const validateCredentials = (username: string, password: string, rp_history?: string): string | null => {
    const pattern = /^[a-zA-Z0-9_]+$/;

    if (!username || username.length < 3) {
        return "Логин должен содержать минимум 3 символа";
    }
    if (username.length > 16) {
        return "Логин не может быть длиннее 16 символов";
    }
    if (!pattern.test(username)) {
        return "Логин может содержать только латинские буквы, цифры и подчеркивание";
    }

    if (!password || password.length < 8) {
        return "Пароль должен содержать минимум 8 символов";
    }
    if (password.length > 32) {
        return "Пароль не может быть длиннее 32 символов";
    }
    if (!pattern.test(password)) {
        return "Пароль может содержать только латинские буквы, цифры и подчеркивание";
    }

    if (rp_history && rp_history.length < 100) {
        return "РП история должна содержать минимум 100 символов"
    }
    if (rp_history && rp_history.length > 10000) {
        return "РП история не может быть длиннее 10000 символов";
    }

    return null;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
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

            updateAccount: (account) =>
                set((state) => ({
                    accounts: state.accounts.map(acc =>
                        acc.username === account.username ? account : acc
                    )
                })),

            setSelectedAccount: (username: string) => {
                set((state) => ({
                    selectedAccount: state.accounts.find(
                        (acc) => acc.username === username
                    ) || null
                }));
            },

            validateToken: async (accessToken: string): Promise<AuthAccount | null> => {
                try {
                    const response = await apiClient.get("/me", {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    const state = get();
                    const current = state.accounts.find(a => a.accessToken === accessToken) ?? state.selectedAccount;
                    if (!current) return null;

                    return {
                        ...current,
                        username: response.data.username ?? current.username,
                        uuid: response.data.uuid ?? current.uuid,
                        minecraftAccessToken: response.data.minecraft_access_token
                    };
                } catch {
                    return null;
                }
            },

            refreshToken: async (refreshTokenKey: string): Promise<AuthAccount | null> => {
                if (refreshPromise) return refreshPromise;

                refreshPromise = (async () => {
                    try {
                        const response = await apiClient.post<RefreshResponse>("/auth/refresh", {
                            refresh_token: refreshTokenKey,
                        });

                        const state = get();
                        const current =
                            state.accounts.find((a) => a.refreshToken === refreshTokenKey) ??
                            state.selectedAccount;

                        if (!current) return null;

                        const updated: AuthAccount = {
                            ...current,
                            accessToken: response.data.access_token,
                            refreshToken: response.data.refresh_token,
                        };

                        set((s) => ({
                            accounts: s.accounts.map((a) =>
                                a.username === updated.username ? updated : a
                            ),
                            selectedAccount:
                                s.selectedAccount?.username === updated.username
                                    ? updated
                                    : s.selectedAccount,
                        }));

                        return updated;

                    } catch (err) {
                        const e = err as AxiosError<{ detail?: string; message?: string }>;
                        const status = e.response?.status;

                        const shouldRemove =
                            status === 401 || status === 403 || status === 400;

                        if (shouldRemove) {
                            set((s) => {
                                const newAccounts = s.accounts.filter(
                                    (a) => a.refreshToken !== refreshTokenKey
                                );

                                const selectedRemoved =
                                    s.selectedAccount?.refreshToken === refreshTokenKey;

                                useNotificationsStore.getState().addNotification({
                                    type: "error",
                                    text: "Срок аутентификации истёк"
                                });

                                return {
                                    accounts: newAccounts,
                                    selectedAccount: selectedRemoved ? newAccounts.at(-1) ?? null : s.selectedAccount,
                                };
                            });
                        }

                        console.error("Refresh error:", e);
                        return null;
                    } finally {
                        refreshPromise = null;
                    }
                })();

                return refreshPromise;
            },

            validateAndRefresh: async (): Promise<AuthAccount | null> => {
                const acc = get().selectedAccount;
                if (!acc?.accessToken || !acc?.refreshToken) return null;

                const me1 = await get().validateToken(acc.accessToken);
                if (me1) return { ...acc, ...me1 };

                const refreshed = await get().refreshToken(acc.refreshToken);
                if (!refreshed) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: "Ошибка аутентификации. Код: 1"
                    });
                    return null
                }

                const me2 = await get().validateToken(refreshed.accessToken);
                if (!me2) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: "Ошибка аутентификации. Код: 2"
                    });
                    return null
                }

                const merged: AuthAccount = { ...acc, ...me2, ...refreshed };

                set((state) => ({
                    accounts: state.accounts.map((a) => a.username === merged.username ? merged : a),
                    selectedAccount: merged,
                }));

                return merged;
            },

            login: async (username: string, password: string): Promise<boolean> => {
                const validationError = validateCredentials(username, password);
                if (validationError) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: validationError
                    });
                    return false;
                }

                try {
                    const response = await apiClient.post('/auth/login', { username, password });

                    const account: AuthAccount = {
                        username,
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                    };

                    set((state) => ({
                        accounts: [...state.accounts.filter(acc => acc.username !== username), account],
                        selectedAccount: account
                    }));

                    useNotificationsStore.getState().addNotification({
                        type: "success",
                        text: "Вы успешно авторизовались!"
                    });

                    return true;

                } catch (error) {
                    const e = error as AxiosError<{ detail?: string }>;

                    if (e.response?.status === 401) {
                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: "Неверный логин или пароль"
                        });
                    } else if (e.response?.status === 422) {
                        const detail = e.response.data?.detail;

                        console.error(detail);

                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: "Произошла ошибка во время валидации данных"
                        });

                    } else if (e.response) {
                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: "Произошла ошибка во время авторизации"
                        });

                        console.error(e.response);
                    } else {
                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: "Не удалось подключиться к серверу"
                        });

                        console.error(e.response);
                    }

                    return false;
                }
            },

            register: async (formData: FormData): Promise<boolean> => {
                const username = formData.get('username') as string;
                const password = formData.get('password') as string;
                const rp_history = formData.get('rp_history') as string;

                const validationError = validateCredentials(username, password, rp_history);
                if (validationError) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: validationError
                    });
                    return false;
                }

                if (!rp_history) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: "РП история должна содержать минимум 100 символов"
                    })

                    return false;
                }

                try {
                    const response = await apiClient.post('/auth/register', formData);

                    const account: AuthAccount = {
                        username: username,
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                    };

                    set((state) => ({
                        accounts: [...state.accounts.filter(acc => acc.username !== username), account],
                        selectedAccount: account
                    }));
                    return true;
                } catch (error) {
                    const e = error as AxiosError<{ detail?: string }>;

                    if (e.response?.status === 422) {
                        const detail = e.response.data?.detail;

                        console.error(detail);

                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: "Произошла ошибка во время валидации данных"
                        });

                    } else if (e.response) {
                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: "Произошла ошибка во время регистрации"
                        });

                        console.error(e.response);
                    } else {
                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: "Не удалось подключиться к серверу"
                        });

                        console.error(e.response);
                    }

                    return false;
                }
            }
        }),
        {
            name: "auth-storage",
        }
    )
);