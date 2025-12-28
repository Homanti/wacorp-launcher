import styles from "../Fbi.module.scss";
import Button from "../../../components/Button/Button";

function Property() {
    return (
        <main className={styles.fbi}>
            <h2>Реестр имущества</h2>

            <section className={styles.categories}>
                <Button>Добавить</Button>
                <Button>Найти</Button>
            </section>
        </main>
    );
}

export default Property;