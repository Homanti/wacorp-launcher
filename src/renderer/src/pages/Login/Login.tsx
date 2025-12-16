import styles from "./Login.module.scss";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import {Link} from "react-router-dom";

const Login = () => {
    return (
        <main className={styles.login}>
            <section className={styles.login__content}>
                <form className={styles.login__form}>
                    <h2>Вход в аккаунт</h2>
                    <Input className={styles.login__input} placeholder="Введите ваш логин" />
                    <Input className={styles.login__input} placeholder="Введите ваш пароль" type="password" />
                    <Button className={styles.login__button}>Войти</Button>
                    <div className={styles.login__footer}>
                        <p>Нет аккаунта?</p>
                        <Link to="/register">Регистрация</Link>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default Login;