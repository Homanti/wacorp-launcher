import styles from "./Login.module.scss";
import {Link, useLocation} from "react-router-dom";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import {useAuthStore} from "../../../store/useAuthStore";
import {useState} from "react";

const Login = () => {
    const login = useAuthStore(s => s.login);

    const location = useLocation();

    const mode = (location.state)?.mode;
    const isAddAccountFlow = mode === "addAccount";

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await login(username, password);
    };

    return (
        <main className={styles.login}>
            <form className={`${styles.form} ${!isAddAccountFlow && styles.noAccount}`} onSubmit={handleSubmit}>
                <h2>Вход в аккаунт WacoRP</h2>

                <Input
                    className={styles.input}
                    placeholder="Введите ваш логин"
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    min={3}
                    max={16}
                />

                <Input
                    className={styles.input}
                    placeholder="Введите ваш пароль"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    min={6}
                    max={32}
                />

                <Button className={styles.button} type="submit" disabled={!username || !password}>Войти</Button>

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