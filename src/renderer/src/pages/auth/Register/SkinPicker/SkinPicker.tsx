import {useRef} from "react";
import Button from "../../../../components/Button/Button";
import styles from "./SkinPicker.module.scss";

type SkinPickerProps = {
    skin?: File;
    setSkin: React.Dispatch<React.SetStateAction<File | undefined>>;
}

export function SkinPicker({ skin, setSkin }: SkinPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={styles.skinPicker}>
            <input
                ref={inputRef}
                id="skinInput"
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

            <Button
                type="button"
                onClick={() => {inputRef.current?.click();}}
            >
                Выбрать скин
            </Button>

            {skin &&
                <p>
                    {skin.name}
                </p>
            }
        </div>
    );
}