import {Link, useLocation} from "react-router-dom";
import styles from "./Register.module.scss";
import Input from "../../../components/Input/Input";
import Textarea from "../../../components/Textarea/Textarea";
import Button from "../../../components/Button/Button";
import {SkinPicker} from "./SkinPicker/SkinPicker";
import {useRef, useState} from "react";
import {API_URL} from "../../../config/api.config";
import {useAuthStore} from "../../../store/useAuthStore";

const Register = () => {
    const location = useLocation();
    const [skinFile, setSkinFile] = useState<File>();
    const addAccount = useAuthStore(s => s.addAccount);

    const loginRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const rpHistoryRef = useRef<HTMLTextAreaElement>(null);

    const mode = (location.state)?.mode;
    const isAddAccountFlow = mode === "addAccount";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const login = loginRef.current?.value || "";
        const password = passwordRef.current?.value || "";
        const rpHistory = rpHistoryRef.current?.value || "";

        const formData = new FormData();
        formData.append('username', login);
        formData.append('password', password);
        formData.append('rp_history', rpHistory);
        if (skinFile) {
            formData.append('skin_file', skinFile);
        }

        const response = await fetch(API_URL+ "/auth/register", {
            method: "POST",
            body: formData,
        })

        const data = await response.json();

        if (response.ok) {
            addAccount({ username: login, accessToken: data.access_token, refreshToken: data.refresh_token });
        }
    };

    return (
        <main className={styles.register} onSubmit={handleSubmit}>
            <form className={`${styles.form} ${!isAddAccountFlow && styles.noAccount}`}>
                <h2>Регистрация аккаунта WacoRP</h2>
                <Input ref={loginRef} className={styles.input} type="text" placeholder="Введите ваш логин"/>
                <Input ref={passwordRef} className={styles.input} type="password" placeholder="Введите ваш пароль"/>
                <Textarea ref={rpHistoryRef} className={styles.textarea} placeholder="РП история вашего персонажа" />
                <SkinPicker skin={skinFile} setSkin={setSkinFile} />
                <div className={styles.checkbox}>
                    <input type="checkbox" className={styles.checkbox} id="agree" />
                    <label htmlFor="agree" className={styles.checkboxLabel}>
                        Я ознакомился(-ась) и согласен(-а) с <a href="https://discord.gg/huezMnX5JM" target="_blank" rel="noopener noreferrer">правилами WacoRP</a>
                    </label>
                </div>

                <Button className={styles.button} type={"submit"}>Зарегистрироваться</Button>

                <div className={styles.footer}>
                    <p>Уже есть аккаунт?</p>
                    <Link state={{mode: mode}} to="/auth/login">Войти</Link>
                </div>
            </form>

            {!isAddAccountFlow && (
                <div className={styles.noAccount} />
            )}
        </main>
    );
}

export default Register;