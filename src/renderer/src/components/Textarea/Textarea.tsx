import styles from "./Textarea.module.scss";
import {useState} from "react";

type TextareaProps = {
    className?: string;
    ref?: React.Ref<HTMLTextAreaElement>;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = ({ className, ref, onChange, value: controlledValue, ...props }: TextareaProps) => {
    const [internalValue, setInternalValue] = useState('');

    const value = controlledValue !== undefined ? String(controlledValue) : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInternalValue(e.target.value);

        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className={styles.textareaWrapper}>
            <textarea onChange={handleChange} value={value} ref={ref} className={`${styles.textarea} ${className || ''}`} {...props}/>
            {props.maxLength && (
                <span className={styles.charCounter}>{value.length}/{props.maxLength}</span>
            )}
        </div>
    );
}

export default Textarea;