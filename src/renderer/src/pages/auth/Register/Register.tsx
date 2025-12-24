import {Link, useLocation} from "react-router-dom";
import styles from "./Register.module.scss";
import Input from "../../../components/Input/Input";
import Textarea from "../../../components/Textarea/Textarea";
import Button from "../../../components/Button/Button";
import {SkinPicker} from "./SkinPicker/SkinPicker";
import {useState} from "react";
import {useAuthStore} from "../../../store/useAuthStore";

const Register = () => {
    const location = useLocation();
    const register = useAuthStore(s => s.register);

    const [isChecked, setIsChecked] = useState(true);

    const mode = (location.state)?.mode;
    const isAddAccountFlow = mode === "addAccount";

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [rpHistory, setRpHistory] = useState<string>("");
    const [skinFile, setSkinFile] = useState<File>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('rp_history', rpHistory);
        if (skinFile) {
            formData.append('skin_file', skinFile);
        }

        await register(formData);
    };

    return (
        <main className={styles.register} onSubmit={handleSubmit}>
            <form className={`${styles.form} ${!isAddAccountFlow && styles.noAccounts}`}>
                <h2>Регистрация аккаунта WacoRP</h2>
                <Input onChange={(e) => setUsername(e.target.value)} className={styles.input} type="text" placeholder="Введите ваш логин"/>
                <Input onChange={(e) => setPassword(e.target.value)} className={styles.input} type="password" placeholder="Введите ваш пароль"/>
                <Textarea onChange={(e) => setRpHistory(e.target.value)} className={styles.textarea} placeholder="РП история вашего персонажа" />
                <SkinPicker skin={skinFile} setSkin={setSkinFile} />

                <div className={styles.checkbox}>
                    <input type="checkbox" className={styles.checkbox} id="agree" onChange={(e) => setIsChecked(e.target.checked)} />
                    <label htmlFor="agree" className={styles.checkboxLabel}>
                        Я ознакомился(-ась) и согласен(-а) с <a href="https://discord.gg/huezMnX5JM" target="_blank" rel="noopener noreferrer">правилами WacoRP</a>
                    </label>
                </div>

                <Button className={styles.button} type={"submit"} disabled={!isChecked || !username || !password || !rpHistory || !skinFile}>Зарегистрироваться</Button>

                <div className={styles.footer}>
                    <p>Уже есть аккаунт?</p>
                    <Link state={{mode: mode}} to="/auth/login">Войти</Link>
                </div>
            </form>

            {!isAddAccountFlow && (
                <div className={styles.noAccounts} />
            )}
        </main>
    );
}

export default Register;