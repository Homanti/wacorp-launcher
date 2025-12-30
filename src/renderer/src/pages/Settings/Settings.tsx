import styles from './Settings.module.scss';
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import {useEffect, useState} from "react";
import {useSettingsStore} from "../../store/useSettingsStore";
import {useModalStore} from "../../store/useModalStore";
import DeleteModal from "./DeleteModal/DeleteModal";
import {useNotificationsStore} from "../../store/useNotificationsStore";
import {Gamepad2, MemoryStick, Trash2, Save, AppWindow} from "lucide-react";

const Settings = () => {
    const [totalRam, setTotalRam] = useState<number>(0);
    const selectedRam = useSettingsStore(s => s.selectedRam);
    const setSelectedRam = useSettingsStore(s => s.setSelectedRam);
    const [ramInputValue, setRamInputValue] = useState<string>('');
    const openModal = useModalStore(s => s.openModal);
    const addNotification = useNotificationsStore(s => s.addNotification);
    const MIN_RAM = 1600;

    const hideLauncher = useSettingsStore(s => s.hideLauncher);
    const setHideLauncher = useSettingsStore(s => s.setHideLauncher);

    useEffect(() => {
        (async () => {
            const total = await window.api.getTotalRam();
            setTotalRam(Math.round(total));

            const next = selectedRam === 0 ? Math.max(Math.floor((total || 0) / 2), MIN_RAM) : selectedRam;
            setSelectedRam(next);
            setRamInputValue(String(next));
        })();
    }, [selectedRam, setSelectedRam])

    return (
        <main className={styles.settings}>
            <ul className={styles.settingsContent}>
                <li className={styles.settingsItem}>
                    <h2 className={styles.title}><MemoryStick /> Настройки памяти</h2>
                    <div className={styles.content}>
                        <label htmlFor="ram-input">Выделяемый объем RAM (МБ). {`Максимум ${Math.round(totalRam)}МБ`}</label>
                        <div className={styles.actions}>
                            <Input
                                min={MIN_RAM}
                                value={ramInputValue}
                                max={totalRam}
                                type="number"
                                placeholder={`Минимум ${MIN_RAM}МБ`}
                                id="ram-input"
                                onChange={(e) => {
                                    setRamInputValue(e.target.value);
                                }}
                                onBlur={() => {
                                    const num = Number(ramInputValue);
                                    const max = totalRam > 0 ? totalRam : MIN_RAM;

                                    if (ramInputValue === '' || !Number.isFinite(num)) {
                                        setRamInputValue(String(MIN_RAM));
                                    } else {
                                        const clamped = Math.min(max, Math.max(MIN_RAM, num));
                                        setRamInputValue(String(clamped));
                                    }
                                }}
                            />
                            <Button
                                onClick={() => {
                                    const num = Number(ramInputValue);
                                    const max = totalRam > 0 ? totalRam : MIN_RAM;

                                    const value = ramInputValue === '' || !Number.isFinite(num)
                                        ? MIN_RAM
                                        : Math.min(max, Math.max(MIN_RAM, num));

                                    setRamInputValue(String(value));
                                    setSelectedRam(value);
                                    addNotification({
                                        type: "info",
                                        text: "Сохранено"
                                    })
                                }}
                            >
                                <Save />
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </li>

                <li className={styles.settingsItem}>
                    <h2 className={styles.title}><Gamepad2 /> Управление игрой</h2>
                    <div className={styles.content}>
                        <label>Инструменты удаление Minecraft, модов или ресурс пака. Используйте если у вас, что нибудь не работает или же хотите удалить игру.</label>
                        <div className={styles.actions}>
                            <Button onClick={() => openModal(<DeleteModal what={"mods"} />, "Удаление модов")}>
                                <Trash2 /> Удалить моды
                            </Button>
                            <Button onClick={() => openModal(<DeleteModal what={"resourcepacks"} />, "Удаление ресурс паков")}>
                                <Trash2 /> Удалить ресурс пак
                            </Button>
                            <Button onClick={() => openModal(<DeleteModal what={"minecraft"} />, "Удаление Minecraft'а")} className={styles.dangerButton}>
                                <Trash2 /> Удалить Minecraft
                            </Button>
                        </div>
                    </div>
                </li>

                <li className={styles.settingsItem}>
                    <h2 className={styles.title}><AppWindow /> Настройки лаунчера</h2>
                    <div className={styles.content}>
                        <label>Настройки лаунчера не влияющие на игру.</label>
                        <div className={styles.actions}>
                            <div className={styles.checkbox}>
                                <input type="checkbox" className={styles.checkbox} id="agree" onChange={(e) => setHideLauncher(e.target.checked)} checked={hideLauncher} />
                                <label htmlFor="agree" className={styles.checkboxLabel}>
                                    Скрывать лаунчер после запуска майнкрафта
                                </label>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </main>
    );
}

export default Settings;