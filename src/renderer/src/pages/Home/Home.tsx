import styles from "./Home.module.scss";
import Button from "../../components/Button/Button.tsx";
import {Folder, Play} from "lucide-react";
import useLaunchButton from "../../store/useLaunchButton";
import {useSettingsStore} from "../../store/useSettingsStore";
import {useAuthStore} from "../../store/useAuthStore";
import {useEffect, useState} from "react";
import {useNotificationsStore} from "../../store/useNotificationsStore";
import Confetti from "../../components/Confetti";
import isNewYearPeriod from "../../utils/IsNewYearPeriod";

const Home = () => {
    const disabled = useLaunchButton(state => state.disabled);
    const text = useLaunchButton(state => state.text);

    const selectedRam = useSettingsStore(s => s.selectedRam);
    const hideLauncher = useSettingsStore(s => s.hideLauncher);
    const selectedAccount = useAuthStore(s => s.selectedAccount);

    const [serverStatus, setServerStatus] = useState<number | boolean>(false);

    const addNotification = useNotificationsStore(s => s.addNotification);

    const [showConfetti, setShowConfetti] = useState(false);

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
            <section className={styles.content}>
                <div className={styles.card}>
                    <div className={styles.cardContent}>
                        <h2>WacoRP</h2>
                        {serverStatus !== false ? (
                            <p>Текущий онлайн: {serverStatus}</p>
                        ) : (
                            <p>Сервер оффлайн</p>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <Button className={styles.openGameDirButton} onClick={() => window.api.openGameDir()}>
                            <Folder />
                        </Button>
                        <Button className={styles.launchButton} onClick={async () => {
                            if (!selectedAccount) return;
                            const validateAndRefresh = useAuthStore.getState().validateAndRefresh;

                            const data = await validateAndRefresh(selectedAccount.accessToken, selectedAccount.refreshToken);

                            if (!data?.discordId) {
                                addNotification({type: "info", text: "Верифицируйте аккаунт для доступа на сервер"})
                            } else if (!data?.accepted) {
                                addNotification({type: "info", text: "Ожидайте одобрения заявки для доступа на сервер"})
                            }

                            if (data && data.uuid) {
                                setShowConfetti(true);
                                setTimeout(() => setShowConfetti(false), 3000);

                                return window.api.minecraftLaunch({
                                    username: data.username,
                                    accessToken: data.minecraftAccessToken,
                                    uuid: data.uuid,
                                    dedicatedRam: selectedRam,
                                    hideLauncher: hideLauncher,
                                });
                            }
                        }}
                                disabled={disabled}>
                            <Play /> {text}
                        </Button>

                        {isNewYearPeriod() && (
                            <Confetti fire={showConfetti} />
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home;