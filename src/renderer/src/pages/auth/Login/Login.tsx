import styles from "./Login.module.scss";
import {Link} from "react-router-dom";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";

const Login = () => {
    return (
        <main className={styles.login}>
            <form className={styles.form}>
                <h2>Вход в аккаунт</h2>
                <Input className={styles.input} placeholder="Введите ваш логин" />
                <Input className={styles.input} placeholder="Введите ваш пароль" type="password" />
                <Button className={styles.button}>Войти</Button>
                <div className={styles.footer}>
                    <p>Нет аккаунта?</p>
                    <Link to="/auth/register">Регистрация</Link>
                </div>
            </form>
        </main>
    );
}

export default Login;