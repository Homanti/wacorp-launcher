import styles from "./Home.module.scss";
import Button from "../../components/Button/Button.tsx";
import {Folder} from "lucide-react";
import useLaunchButton from "../../store/useLaunchButton";
import {useSettingsStore} from "../../store/useSettingsStore";
import {useAuthStore} from "../../store/useAuthStore";
import {useEffect, useState} from "react";

const Home = () => {
    const disabled = useLaunchButton(state => state.disabled);
    const text = useLaunchButton(state => state.text);

    const selectedRam = useSettingsStore(s => s.selectedRam);
    const selectedAccount = useAuthStore(s => s.selectedAccount);

    const [serverStatus, setServerStatus] = useState<number | boolean>(false);

    useEffect(() => {
        (async () => {
            const status = await window.api.getServerStatus();
            setServerStatus(status);
        })();

        const interval = setInterval(async () => {
            const status = await window.api.getServerStatus();

            setServerStatus(status);
        }, 1000)

        return () => clearInterval(interval);
    }, [])

    return (
        <main className={styles.home}>
            <section className={styles.home__content}>
                <div className={styles.card}>
                    <div className={styles.card__content}>
                        <h2>WacoRP</h2>
                        {serverStatus !== false ? (
                            <p>Текущий онлайн: {serverStatus}</p>
                        ) : (
                            <p>Сервер оффлайн</p>
                        )}
                    </div>

                    <div className={styles.card__footer}>
                        <Button onClick={() => window.api.openGameDir()}>
                            <Folder />
                        </Button>
                        <Button className={styles.launchButton} onClick={async () => {
                            if (!selectedAccount) return;
                            const validateAndRefresh = useAuthStore.getState().validateAndRefresh;

                            const data = await validateAndRefresh(selectedAccount.accessToken, selectedAccount.refreshToken);

                            if (data && data.uuid && data.minecraftAccessToken) {
                                console.log(selectedAccount);
                                return window.api.minecraftLaunch({
                                    username: data.username,
                                    accessToken: data.minecraftAccessToken,
                                    uuid: data.uuid,
                                    dedicatedRam: selectedRam
                                });
                            }
                        }}
                                disabled={disabled}>
                            {text}
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home;