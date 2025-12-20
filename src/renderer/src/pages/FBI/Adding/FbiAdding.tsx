import styles from "./FbiAdding.module.scss";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import {Link} from "react-router-dom";

const FbiAdding = () => {
    return (
        <main className={styles.fbi}>
            <form className={styles.form}>
                <h2>Добавить гражданина в реестр</h2>
                <Input className={styles.input} placeholder="Никнейм*" />
                <Input className={styles.input} placeholder="ФИО*" />
                <Input className={styles.input} placeholder="Дата рождение*" />
                <Input className={styles.input} placeholder="Место жительства" />
                <Input className={styles.input} placeholder="Идентификатор паспорта*" />
                <Input className={styles.input} placeholder="Идентификатор водительского удостоверение" />
                <Input className={styles.input} placeholder="Идентификатор удостоверение на оружие" />
                <label>* - обязательно</label>

                <Button className={styles.button}>Загрузить фотографию</Button>
                <Button className={styles.button}>Добавить</Button>

                <div className={styles.footer}>
                    <Link to="/fbi/searching">Искать в реестре</Link>
                </div>
            </form>
        </main>
    );
}

export default FbiAdding;