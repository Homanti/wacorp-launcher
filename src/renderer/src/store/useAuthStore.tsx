import {create} from "zustand";
import {persist} from "zustand/middleware";
import apiClient from "../utils/api";
import {AxiosError} from "axios";
import {useNotificationsStore} from "./useNotificationsStore";
import {type NavigateFunction} from "react-router-dom";
import {validateSkinImage} from "../utils/validateSkin";
import PAGES from "../../../config/pages.config";

export type AuthAccount = {
    id: number;
    username: string;
    accessToken: string;
    refreshToken: string;

    minecraftAccessToken?: string;
    uuid?: string;

    discordId?: string;
    accepted?: boolean;
    fbiAccess?: boolean;
};

type AuthStore = {
    accounts: AuthAccount[];
    addAccount: (account: AuthAccount) => void;
    removeAccount: (username: string) => void;
    clearAccounts: () => void;
    updateAccount: (account: AuthAccount) => void;
    selectedAccount: AuthAccount | null;

    setSelectedAccount: (username: string) => void;

    login: (username: string, password: string, navigate?: NavigateFunction) => Promise<boolean>;
    register: (formData: FormData, navigate?: NavigateFunction) => Promise<boolean>;
    validateToken: (accessToken: string) => Promise<AuthAccount | null>;
    refreshToken: (refreshToken: string) => Promise<AuthAccount | null>;
    validateAndRefresh: (accessToken: string, refreshToken: string) => Promise<AuthAccount | null>;

    logout: (username: string) => void;
    changeSkin: (username: string, skinFile: File) => void;
};

type RefreshResponse = {
    user_id: number;
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
    if (rp_history && rp_history.length > 4000) {
        return "РП история не может быть длиннее 4000 символов";
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
                        ? newAccounts[newAccounts.length] || null
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

            setSelectedAccount: async (username: string) => {
                const state = get();
                const account = state.accounts.find((acc) => acc.username === username);

                if (!account) {
                    set({ selectedAccount: null });
                    return;
                }

                set({ selectedAccount: account });

                const validated = await get().validateAndRefresh(account.accessToken, account.refreshToken);

                if (validated) {
                    set({ selectedAccount: validated });
                } else {
                    set({ selectedAccount: state.accounts[state.accounts.length] ?? null });
                }
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
                        id: response.data.id ?? current.id,
                        username: response.data.username ?? current.username,
                        uuid: response.data.uuid ?? current.uuid,
                        minecraftAccessToken: response.data.minecraft_access_token,

                        discordId: response.data.discord_id,
                        accepted: response.data.accepted,
                        fbiAccess: response.data.fbi_access
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
                            id: response.data.user_id ?? current.id,
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
                                    selectedAccount: selectedRemoved ? newAccounts[newAccounts.length] ?? null : s.selectedAccount,
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
                if (me1) {
                    const merged: AuthAccount = { ...acc, ...me1 };

                    set((state) => ({
                        accounts: state.accounts.map((a) => a.username === merged.username ? merged : a),
                        selectedAccount: me1,
                    }));

                    return merged;
                }

                const refreshed = await get().refreshToken(acc.refreshToken);
                if (!refreshed) return null

                const me2 = await get().validateToken(refreshed.accessToken);
                if (!me2) return null

                const merged: AuthAccount = { ...acc, ...me2, ...refreshed };

                set((state) => ({
                    accounts: state.accounts.map((a) => a.username === merged.username ? merged : a),
                    selectedAccount: merged,
                }));

                return merged;
            },

            login: async (username: string, password: string, navigate?: NavigateFunction): Promise<boolean> => {
                const validationError = validateCredentials(username, password);
                if (validationError) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: validationError
                    });
                    return false;
                }

                try {
                    const formData = new URLSearchParams();
                    formData.append('username', username);
                    formData.append('password', password);

                    const response = await apiClient.post('/auth/login', formData, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });

                    const account: AuthAccount = {
                        id: response.data.user_id,
                        username: username,
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

                    if (navigate) navigate(PAGES.HOME, { replace: true });

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

            register: async (formData: FormData, navigate?: NavigateFunction): Promise<boolean> => {
                const username = formData.get('username') as string;
                const password = formData.get('password') as string;
                const rp_history = formData.get('rp_history') as string;
                const skinFile = formData.get('skin_file') as File;

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

                if (!skinFile) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: "Необходимо загрузить скин"
                    });
                    return false;
                }

                if (!skinFile.name.toLowerCase().endsWith('.png')) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: "Скин должен быть в формате PNG"
                    });
                    return false;
                }

                if (skinFile.size > 1024 * 1024) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: "Файл скина слишком большой (макс 1 MB)"
                    });
                    return false;
                }

                try {
                    const validation = await validateSkinImage(skinFile);
                    if (!validation.valid) {
                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: validation.error || "Неверный формат скина"
                        });
                        return false;
                    }
                } catch (error) {
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: "Ошибка при проверке скина"
                    });
                    console.error(error);
                    return false;
                }

                try {
                    const response = await apiClient.post('/auth/register', formData);

                    const account: AuthAccount = {
                        id: response.data.user_id,
                        username: username,
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                    };

                    set((state) => ({
                        accounts: [...state.accounts.filter(acc => acc.username !== username), account],
                        selectedAccount: account
                    }));

                    useNotificationsStore.getState().addNotification({
                        type: "success",
                        text: "Вы успешно зарегистрировались!"
                    });

                    if (navigate) navigate(PAGES.LINK_DISCORD, { replace: true });

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

                    } else if (e.response?.status === 409) {
                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: "Аккаунт с таким именем уже существует."
                        })

                    } else if (e.response?.status === 400) {
                        useNotificationsStore.getState().addNotification({
                            type: "error",
                            text: "Ошибка валидации скина."
                        })

                        console.error(e.response);
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
                    }

                    return false;
                }
            },

            logout: async (username: string) => {
                const account = get().accounts.find(acc => acc.username === username);

                if (!account) {
                    console.warn('Account not found for logout');
                    return;
                }

                try {
                    await apiClient.post('/auth/logout', {}, {
                        headers: { Authorization: `Bearer ${account.accessToken}` }
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    get().removeAccount(username);

                    useNotificationsStore.getState().addNotification({
                        type: "success",
                        text: "Вы вышли из аккаунта"
                    });
                }
            },

            changeSkin: async (username: string, skinFile: File) => {
                const account = get().accounts.find(acc => acc.username === username);
                if (!account) return;

                const updatedAccount = await get().validateAndRefresh(account.accessToken, account.refreshToken);
                if (!updatedAccount) return;

                const formData = new FormData();
                formData.append('skin_file', skinFile);

                try {
                    const response = await apiClient.post('/change_skin', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${updatedAccount.accessToken}`
                        }
                    });

                    if (response.status === 200) {
                        useNotificationsStore.getState().addNotification({
                            type: "success",
                            text: "Вы успешно поменяли скин."
                        });
                    }
                } catch (error) {
                    console.error('Change skin error:', error);
                    useNotificationsStore.getState().addNotification({
                        type: "error",
                        text: "Ошибка во время изменение скина."
                    });
                }
            }
        }),
        {
            name: "auth-storage",
        }
    )
);