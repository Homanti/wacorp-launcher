import styles from './Accounts.module.scss';
import Button from "../../components/Button/Button";
import {Link} from "react-router-dom";
import AccountItem from "./AccountItem/AccountItem";

const Accounts = () => {
    return (
        <main className={styles.accounts}>
            <section className={styles.accounts__content}>
                <header className={styles.accounts__header}>
                    <h1>Аккаунты</h1>
                    <Link to="/auth/login">
                        <Button>Добавить аккаунт</Button>
                    </Link>
                </header>
                <ul className={styles.accounts__list}>
                    <AccountItem>Homanti</AccountItem>
                </ul>
            </section>
        </main>
    );
}

export default Accounts;