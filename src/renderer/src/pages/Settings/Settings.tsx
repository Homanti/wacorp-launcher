import styles from './Settings.module.scss';
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

const Settings = () => {
    return (
        <main className={styles.settings}>
            <ul className={styles.settings__content}>
                <li className={styles.settings__item}>
                    <h2 className={styles.settings__item__title}>Настройки памяти</h2>
                    <div className={styles.settings__item__content}>
                        <label htmlFor="ram-input">Выделяемый объем RAM (МБ)</label>
                        <div className={styles.settings__item__actions}>
                            <Input type="number" placeholder="Например, 4096" id="ram-input"/>
                            <Button>Сохранить</Button>
                        </div>
                    </div>
                </li>
            </ul>
        </main>
    );
}

export default Settings;