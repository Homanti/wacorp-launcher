import styles from './ToggleButton.module.scss';

type ToggleButtonProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children: string;
    id?: string;
}

const ToggleButton = ({checked, onChange, children, id = 'toggleBtn'}: ToggleButtonProps) => {
    return (
        <div className={styles.customCheckBoxHolder}>
            <input
                type="checkbox"
                id={id}
                className={styles.customCheckBoxInput}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <label htmlFor={id} className={styles.customCheckBoxWrapper}>
                <div className={styles.customCheckBox}>
                    <div className={styles.inner}>{children}</div>
                </div>
            </label>
        </div>
    );
};

export default ToggleButton;