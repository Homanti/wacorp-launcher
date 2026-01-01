import styles from './Header.module.scss';
import Button from "../Button/Button.tsx";
import {Minus, X} from "lucide-react";
import logo from "../../assets/logo.png";

const Header = () => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    const year = now.getFullYear();

    const isNewYearDay = month === 0 && day <= 5;

    return (
        <header className={`${styles.header}`} id="header">
            <div className={styles.title}>
                <img src={logo} alt="logo"/>
                <h4 className={styles.title}>
                    WacoRP{isNewYearDay && `. С новым ${year} годом!`}
                </h4>
            </div>
            <div className={styles.actions}>
                <Button className={styles.actionButton} onClick={() => window.api.minimize()}>
                    <Minus />
                </Button>
                <Button className={styles.actionButton} onClick={() => window.api.close()}>
                    <X />
                </Button>
            </div>
        </header>
    );
};

export default Header;
