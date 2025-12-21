import styles from "./Home.module.scss";
import Button from "../../components/Button/Button.tsx";
import {Folder} from "lucide-react";
import useLaunchButton from "../../store/useLaunchButton";
import {useSettingsStore} from "../../store/useSettingsStore";
import {useAuthStore} from "../../store/useAuthStore";
import {API_URL} from "../../config/api.config";

const Home = () => {
    const disabled = useLaunchButton(state => state.disabled);
    const text = useLaunchButton(state => state.text);

    const selectedRam = useSettingsStore(s => s.selectedRam);
    const selectedAccount = useAuthStore(s => s.selectedAccount);
    const updateAccount = useAuthStore(s => s.updateAccount);

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
                        <Button className={styles.launchButton} onClick={async () => {
                            if (!selectedAccount) return;

                            const response = await fetch(API_URL + "/me", {
                                method: "GET",
                                headers: {
                                    Authorization: `Bearer ${selectedAccount.accessToken}`
                                }
                            })

                            const data = await response.json();

                            if (response.status === 401) {
                                const response = await fetch(API_URL + "/auth/refresh", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({ refreshToken: selectedAccount.refreshToken })
                                })

                                const data = await response.json();
                                updateAccount({ ...selectedAccount, accessToken: data.access_token, refreshToken: data.refresh_token });
                            }

                            if (response.ok) {
                                return window.api.minecraftLaunch({
                                    username: data.username,
                                    accessToken: data.minecraft_access_token,
                                    uuid: data.uuid,
                                    dedicatedRam: selectedRam
                                });
                            }
                        }}
                                disabled={disabled}
                        >
                            {text}
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home;