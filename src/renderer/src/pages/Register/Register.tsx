import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import {Link} from "react-router-dom";
import styles from "./Register.module.scss";
import Textarea from "../../components/Textarea/Textarea";

const Register = () => {
    return (
        <main className={styles.register}>
            <section className={styles.register__content}>
                <form className={styles.register__form}>
                    <h2>Регистрация аккаунта</h2>
                    <Input className={styles.register__input} type="text" placeholder="Введите ваш логин"/>
                    <Input className={styles.register__input} type="password" placeholder="Введите ваш пароль"/>
                    <Textarea className={styles.register__textarea} placeholder="РП история вашего персонажа" />
                    <div className={styles.register__checkbox}>
                        <input type="checkbox" className={styles.register__checkbox} id="agree" />
                        <label htmlFor="agree" className={styles.register__checkboxLabel}>
                            Я ознакомился(-ась) и согласен(-а) с <a href="https://discord.gg/huezMnX5JM" target="_blank" rel="noopener noreferrer">правилами WacoRP</a>
                        </label>
                    </div>

                    <Button className={styles.register__button}>Зарегистрироваться</Button>

                    <div className={styles.register__footer}>
                        <p>Уже есть аккаунт?</p>
                        <Link to="/login">Войти</Link>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default Register;