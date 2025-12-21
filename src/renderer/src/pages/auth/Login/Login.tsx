import styles from "./Login.module.scss";
import {Link, useLocation} from "react-router-dom";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import {useAuthStore} from "../../../store/useAuthStore";
import {useRef} from "react";
import {API_URL} from "../../../config/api.config";

const Login = () => {
    const loginRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const addAccount = useAuthStore(s => s.addAccount);

    const location = useLocation();

    const mode = (location.state)?.mode;
    const isAddAccountFlow = mode === "addAccount";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const login = loginRef.current?.value || "";
        const password = passwordRef.current?.value || "";

        if (!login || !password) return;
        if (login.length < 3 || login.length > 16) return;
        if (password.length < 6 || password.length > 32) return;

        console.log(login, password);

        const response = await fetch(API_URL + "/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: login, password })
        })

        const data = await response.json();

        if (response.ok) {
            addAccount({ username: login, accessToken: data.access_token, refreshToken: data.refresh_token });
        }
    };

    return (
        <main className={styles.login}>
            <form className={`${styles.form} ${!isAddAccountFlow && styles.noAccount}`} onSubmit={handleSubmit}>
                <h2>Вход в аккаунт WacoRP</h2>

                <Input
                    ref={loginRef}
                    className={styles.input}
                    placeholder="Введите ваш логин"
                    min={3}
                    max={16}
                />

                <Input
                    ref={passwordRef}
                    className={styles.input}
                    placeholder="Введите ваш пароль"
                    type="password"
                    min={6}
                    max={32}
                />

                <Button className={styles.button} type="submit">Войти</Button>

                <div className={styles.footer}>
                    <p>Нет аккаунта?</p>
                    <Link state={{mode: mode}} to="/auth/register">Регистрация</Link>
                </div>
            </form>

            {!isAddAccountFlow && (
                <div className={styles.noAccount} />
            )}
        </main>
    );
}

export default Login;