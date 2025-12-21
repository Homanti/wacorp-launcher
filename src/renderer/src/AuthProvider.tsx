import { useAuthStore } from "./store/useAuthStore";
import { type ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function AuthProvider({ children }: { children: ReactNode }) {
    const accounts = useAuthStore((s) => s.accounts);
    const navigate = useNavigate();
    const location = useLocation();

    const mode = (location.state)?.mode;
    const isAddAccountFlow = mode === "addAccount";

    useEffect(() => {
        const onAuthPage = location.pathname.startsWith("/auth/");

        if (accounts.length === 0 && !onAuthPage) {
            navigate("/auth/login", { replace: true });
            return;
        }
        
        if (accounts.length > 0 && location.pathname.startsWith("/auth/") && !isAddAccountFlow) {
            navigate("/", { replace: true });
        }
        
    }, [accounts.length, location.pathname, isAddAccountFlow, navigate]);

    return children;
}

export default AuthProvider;
