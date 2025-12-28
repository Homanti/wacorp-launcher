import styles from "../Fbi.module.scss";
import Button from "../../../components/Button/Button";
import {Plus, Search} from "lucide-react";
import {Link} from "react-router-dom";
import PAGES from "../../../../../config/pages.config";

function Citizens() {
    return (
        <main className={styles.fbi}>
            <h2>Реестр граждан</h2>

            <section className={styles.categories}>
                <Link to={PAGES.CITIZENS_ADD}>
                    <Button><Plus/> Добавить</Button>
                </Link>
                <Button><Search /> Найти (в разработке)</Button>
            </section>
        </main>
    );
}

export default Citizens;