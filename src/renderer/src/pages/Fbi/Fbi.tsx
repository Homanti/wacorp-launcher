import {useAuthStore} from "../../store/useAuthStore";
import styles from "./Fbi.module.scss";
import Button from "../../components/Button/Button";
import {Link} from "react-router-dom";
import PAGES from "../../../../config/pages.config";

function Fbi() {
    const selectedAccount = useAuthStore(s => s.selectedAccount);

    if (!selectedAccount?.fbiAccess) return null;

    return (
        <main className={styles.fbi}>
            <h2>Реестр ФБР</h2>

            <section className={styles.categories}>
                <Link to={PAGES.CITIZENS}><Button>Реестр граждан</Button></Link>
                {/*<Link to={PAGES.CITIZENS}><Button>Реестр машин</Button></Link>*/}
                {/*<Link to={PAGES.CITIZENS}><Button>Реестр имущества</Button></Link>*/}
            </section>
        </main>
    );
}

export default Fbi;