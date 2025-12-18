import styles from './Settings.module.scss';
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import {useEffect, useState} from "react";
import {useSettingsStore} from "../../store/useSettingsStore";

const Settings = () => {
    const [totalRam, setTotalRam] = useState<number>(0);
    const selectedRam = useSettingsStore(s => s.selectedRam);
    const setSelectedRam = useSettingsStore(s => s.setSelectedRam);
    const [ramInputValue, setRamInputValue] = useState<number>(0);
    const MIN_RAM = 1600;
    
    useEffect(() => {
        (async () => {
            const total = await window.api.getTotalRam();
            setTotalRam(Math.round(total));

            const next = selectedRam === 0 ? Math.floor(total / 2) : selectedRam;
            setSelectedRam(next);
            setRamInputValue(next);
        })();
    }, [])

    return (
        <main className={styles.settings}>
            <ul className={styles.settings__content}>
                <li className={styles.settings__item}>
                    <h2 className={styles.settings__item__title}>Настройки памяти</h2>
                    <div className={styles.settings__item__content}>
                        <label htmlFor="ram-input">Выделяемый объем RAM (МБ). {`Максимум ${Math.round(totalRam)}МБ`}</label>
                        <div className={styles.settings__item__actions}>
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
            </ul>
        </main>
    );
}

export default Settings;