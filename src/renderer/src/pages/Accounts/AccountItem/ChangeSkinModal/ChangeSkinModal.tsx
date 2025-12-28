import {SkinPicker} from "../../../../components/SkinPicker/SkinPicker";
import ToggleButton from "../../../../components/ToggleSwitch/ToggleButton";
import {useState} from "react";
import styles from "./ChangeSkinModal.module.scss";
import Button from "../../../../components/Button/Button";
import {useModalStore} from "../../../../store/useModalStore";
import {Save} from "lucide-react";
import {useAuthStore} from "../../../../store/useAuthStore";

function ChangeSkinModal({username}: { username: string}) {
    const [skinFile, setSkinFile] = useState<File>();
    const [isSlimEnabled, setIsSlimEnabled] = useState(false);

    const closeModal = useModalStore(s => s.closeModal)
    const changeSkin = useAuthStore(s => s.changeSkin);

    const [disabled, setDisabled] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!skinFile) return;

        setDisabled(true);

        await changeSkin(username, skinFile, isSlimEnabled ? "slim" : "classic");
        await window.api.updateSkin();

        setDisabled(false);

        closeModal();
    };

    return (
        <form className={styles.content} onSubmit={handleSubmit}>
            <SkinPicker skin={skinFile} setSkin={setSkinFile} />
            <ToggleButton checked={isSlimEnabled} onChange={setIsSlimEnabled}>Slim модель</ToggleButton>

            <div className={styles.actions}>
                <Button onClick={closeModal}>Отмена</Button>
                <Button className={styles.primaryButton} type={"submit"} disabled={disabled || !skinFile}><Save /> Сохранить</Button>
            </div>
        </form>
    );
}

export default ChangeSkinModal;