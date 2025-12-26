import Button from "../../../components/Button/Button";
import styles from "./DeleteModal.module.scss"
import {useModalStore} from "../../../store/useModalStore";
import {Trash2} from "lucide-react";

const array = {
    minecraft: "Minecraft",
    mods: "моды",
    resourcepacks: "ресурс паки",
}

function DeleteModal({what}: {what: "minecraft" | "mods" | "resourcepacks" }) {
    const closeModal = useModalStore(s => s.closeModal);

    return (
        <div className={styles.content}>
            Вы уверены что хотите удалить {array[what]}?

            <div className={styles.actions}>
                <Button onClick={closeModal}>Отмена</Button>
                <Button className={styles.dangerButton} onClick={() => {
                    closeModal();
                    window.api.delete(what);
                }}><Trash2 /> Удалить</Button>
            </div>
        </div>
    );
}

export default DeleteModal;