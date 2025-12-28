import {useState} from "react";
import styles from "./SkinPicker.module.scss";
import {ArrowUpFromLine} from "lucide-react";
import {useNotificationsStore} from "../../store/useNotificationsStore";

type SkinPickerProps = {
    skin?: File;
    setSkin: React.Dispatch<React.SetStateAction<File | undefined>>;
}

export function SkinPicker({ skin, setSkin }: SkinPickerProps) {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const addNotification = useNotificationsStore(s => s.addNotification);

    return (
        <label className={styles.skinPickerLabel}>
            <div className={`${styles.dropzone} ${isDraggingOver && styles.dragging}`}
                 onDragOver={(e) => {
                     e.preventDefault();
                     setIsDraggingOver(true)
                 }}
                 onDragLeave={() => {
                     setIsDraggingOver(false)
                 }}
                 onDrop={(e) => {
                     e.preventDefault();
                     setIsDraggingOver(false);

                     const file = e.dataTransfer.files?.[0];

                     if (!file) return

                     if (!file.type.startsWith('image/png')) {
                         addNotification({type: "error", text: "Файл должен быть в формате png."})
                         return;
                     }

                     setSkin(file);
                 }}
            >

                <ArrowUpFromLine className={styles.icon}/>

                <p>Перетащите скин сюда или нажмите для загрузки</p>

                {skin &&
                    <p className={styles.selectedSkin}>{skin.name}</p>
                }
            </div>

            <input
                type="file"
                style={{ display: "none" }}
                accept="image/png"
                multiple={false}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                        setSkin(file);
                    }
                }}
            />
        </label>
    );
}