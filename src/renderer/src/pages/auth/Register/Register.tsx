import {Link, useLocation} from "react-router-dom";
import styles from "./Register.module.scss";
import Input from "../../../components/Input/Input";
import Textarea from "../../../components/Textarea/Textarea";
import Button from "../../../components/Button/Button";

const Register = () => {
    const location = useLocation();

    const mode = (location.state)?.mode;
    const isAddAccountFlow = mode === "addAccount";

    return (
        <main className={styles.register}>
            <form className={`${styles.form} ${!isAddAccountFlow && styles.noAccount}`}>
                <h2>Регистрация аккаунта WacoRP</h2>
                <Input className={styles.input} type="text" placeholder="Введите ваш логин"/>
                <Input className={styles.input} type="password" placeholder="Введите ваш пароль"/>
                <Textarea className={styles.textarea} placeholder="РП история вашего персонажа" />
                <div className={styles.checkbox}>
                    <input type="checkbox" className={styles.checkbox} id="agree" />
                    <label htmlFor="agree" className={styles.checkboxLabel}>
                        Я ознакомился(-ась) и согласен(-а) с <a href="https://discord.gg/huezMnX5JM" target="_blank" rel="noopener noreferrer">правилами WacoRP</a>
                    </label>
                </div>

                <Button className={styles.button}>Зарегистрироваться</Button>

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