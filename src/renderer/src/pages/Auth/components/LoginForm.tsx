import styles from "./AuthForm.module.scss";
import {useNavigate} from "react-router-dom";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import {useAuthStore} from "../../../store/useAuthStore";
import {useState} from "react";
import { motion } from "motion/react";

type LoginFormProps = {
    setFormType: (formType: 'login' | 'register') => void;
};

const LoginForm = ({setFormType}: LoginFormProps) => {
    const login = useAuthStore(s => s.login);

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [disabled, setDisabled] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setDisabled(true);

        try {
            await login(username, password, navigate);
        } catch (e) {
            console.error(e);
        } finally {
            setDisabled(false);
        }
    };

    return (
        <motion.form className={`${styles.form}`} onSubmit={handleSubmit}
                     initial={{ scale: 0.5, x: -300, opacity: 0 }}
                     animate={{ scale: 1, x: 0, opacity: 1 }}
                     exit={{ scale: 0.5, x: -300, opacity: 0 }}
                     transition={{ duration: 0.15 }}
                     layout
        >
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

            <Button className={styles.button} type="submit" disabled={!username || !password || disabled}>Войти</Button>

            <div className={styles.footer}>
                <p>Нет аккаунта?</p>
                <span onClick={() => setFormType("register")}>Регистрация</span>
            </div>
        </motion.form>
    );
}

export default LoginForm;