import styles from "./FbiSearching.module.scss";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import {Link} from "react-router-dom";

const FbiSearching = () => {
    return (
        <main className={styles.fbi}>
            <form className={styles.form}>
                <h2>Поиск в реестре</h2>
                <Input className={styles.input} placeholder="ФИО" />
                <Input className={styles.input} placeholder="Дата рождение" />
                <Input className={styles.input} placeholder="Место жительства" />
                <Input className={styles.input} placeholder="Индификатор паспорта" />
                <Input className={styles.input} placeholder="Индификатор водительского удостоверение" />
                <Input className={styles.input} placeholder="Индификатор удостоверение на оружие" />
                <Button className={styles.button}>Искать</Button>
                <div className={styles.footer}>
                    <Link to="/fbi/adding">Добавить в реестр</Link>
                </div>
            </form>
        </main>
    );
}

export default FbiSearching;