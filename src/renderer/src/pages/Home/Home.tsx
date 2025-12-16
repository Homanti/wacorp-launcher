import styles from "./Home.module.scss";
import Button from "../../components/Button/Button.tsx";
import {Folder} from "lucide-react";
import useProgressBarStore from "../../store/useProgressBarStore";

const Home = () => {
    const isVisible = useProgressBarStore(state => state.isVisible);

    return (
        <main className={styles.home}>
            <section className={styles.home__content}>
                <div className={styles.card}>
                    <div className={styles.card__content}>
                        <h2>WacoRP</h2>
                        <p>Текущий онлайн: 1337</p>
                    </div>

                    <div className={styles.card__footer}>
                        <Button onClick={() => window.api.openGameDir()}>
                            <Folder />
                        </Button>
                        <Button className={styles.launchButton} onClick={() => window.api.minecraftLaunch()} disabled={isVisible}>
                            Запустить
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home;