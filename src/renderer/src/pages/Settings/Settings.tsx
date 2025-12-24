import styles from './Settings.module.scss';
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import {useEffect, useState} from "react";
import {useSettingsStore} from "../../store/useSettingsStore";
import {useModalStore} from "../../store/useModalStore";
import DeleteModal from "./DeleteModal/DeleteModal";

const Settings = () => {
    const [totalRam, setTotalRam] = useState<number>(0);
    const selectedRam = useSettingsStore(s => s.selectedRam);
    const setSelectedRam = useSettingsStore(s => s.setSelectedRam);
    const [ramInputValue, setRamInputValue] = useState<number>(0);
    const openModal = useModalStore(s => s.openModal);
    const MIN_RAM = 1600;
    
    useEffect(() => {
        (async () => {
            const total = await window.api.getTotalRam();
            setTotalRam(Math.round(total));

            const next = selectedRam === 0 ? Math.floor(total / 2) : selectedRam;
            setSelectedRam(next);
            setRamInputValue(next);
        })();
    }, [selectedRam, setSelectedRam])

    return (
        <main className={styles.settings}>
            <ul className={styles.settingsContent}>
                <li className={styles.settingsItem}>
                    <h2 className={styles.title}>Настройки памяти</h2>
                    <div className={styles.content}>
                        <label htmlFor="ram-input">Выделяемый объем RAM (МБ). {`Максимум ${Math.round(totalRam)}МБ`}</label>
                        <div className={styles.actions}>
                            <Input min={MIN_RAM} value={ramInputValue} max={totalRam} type="number" placeholder={`Максимум ${Math.round(totalRam)}МБ`} id="ram-input"
                                   onChange={(e) => {
                                       const raw = Number(e.target.value);
                                       if (!Number.isFinite(raw)) return;
                                       setRamInputValue(raw);
                                   }}
                                   onBlur={() => {
                                       const max = totalRam > 0 ? totalRam : MIN_RAM;
                                       setRamInputValue(v => Math.min(max, Math.max(MIN_RAM, v)));
                                   }}
                            />
                            <Button
                                onClick={() => {
                                    const max = totalRam > 0 ? totalRam : MIN_RAM;
                                    const clamped = Math.min(max, Math.max(MIN_RAM, ramInputValue));
                                    setRamInputValue(clamped);
                                    setSelectedRam(clamped);
                                }}
                            >
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </li>

                <li className={styles.settingsItem}>
                    <h2 className={styles.title}>Управление игрой</h2>
                    <div className={styles.content}>
                        <label htmlFor="ram-input">Инструменты удаление Minecraft, модов или ресурс пака. Используйте если у вас, что нибудь не работает или же хотите удалить игру.</label>
                        <div className={styles.actions}>
                            <Button onClick={() => openModal(<DeleteModal what={"mods"} />, "Удаление модов")}>
                                Удалить моды
                            </Button>
                            <Button onClick={() => openModal(<DeleteModal what={"resourcepacks"} />, "Удаление ресурс паков")}>
                                Удалить ресурс пак
                            </Button>
                            <Button onClick={() => openModal(<DeleteModal what={"minecraft"} />, "Удаление Minecraft'а")} className={styles.dangerButton}>
                                Удалить Minecraft
                            </Button>
                        </div>
                    </div>
                </li>
            </ul>
        </main>
    );
}

export default Settings;