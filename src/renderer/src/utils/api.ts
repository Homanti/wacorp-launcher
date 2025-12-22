import axios, { type AxiosInstance } from 'axios';
import {API_URL} from "../config/api.config";
import {useAuthStore} from "../store/useAuthStore";

class ApiClient {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            timeout: 10000,
        });

        this.api.interceptors.request.use((config) => {
            const token = useAuthStore.getState().selectedAccount?.accessToken;
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
    }

    get instance() {
        return this.api;
    }
}

const apiClient = new ApiClient();
export default apiClient.instance;
export type { AxiosInstance };