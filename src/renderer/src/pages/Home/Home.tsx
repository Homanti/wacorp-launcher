import styles from "./Home.module.scss";
import Button from "../../components/Button/Button.tsx";
import {Folder} from "lucide-react";
import useLaunchButton from "../../store/useLaunchButton";
import {useSettingsStore} from "../../store/useSettingsStore";

const Home = () => {
    const disabled = useLaunchButton(state => state.disabled);
    const text = useLaunchButton(state => state.text);
    const selectedRam = useSettingsStore(s => s.selectedRam);

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
                        <Button className={styles.launchButton} onClick={() => window.api.minecraftLaunch(selectedRam)} disabled={disabled}>
                            {text}
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home;