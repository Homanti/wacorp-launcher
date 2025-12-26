import styles from './Accounts.module.scss';
import Button from "../../components/Button/Button";
import {Link} from "react-router-dom";
import AccountItem from "./AccountItem/AccountItem";
import {useAuthStore} from "../../store/useAuthStore";
import {AnimatePresence} from "motion/react";
import PAGES from "../../../../config/pages.config";
import {UserPlus} from "lucide-react";

const Accounts = () => {
    const accounts = useAuthStore(s => s.accounts);

    return (
        <main className={styles.accounts}>
            <section className={styles.accounts__content}>
                <header className={styles.accounts__header}>
                    <h1>Аккаунты</h1>
                    <Link to={PAGES.AUTH}>
                        <Button><UserPlus /> Добавить аккаунт</Button>
                    </Link>
                </header>

                <ul className={styles.accounts__list}>
                    <AnimatePresence initial={false} mode={"popLayout"}>
                        {accounts.map((account) => (
                            <AccountItem key={account.username}>{account.username}</AccountItem>
                        ))}
                    </AnimatePresence>
                </ul>
            </section>
        </main>
    );
}

export default Accounts;