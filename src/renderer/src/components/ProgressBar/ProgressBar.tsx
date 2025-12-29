import styles from './ProgressBar.module.scss';

type ProgressBarProps = {
    percent: number | null;
    description?: string;

    speed?: string,
    estimated?: string,

    className?: string,
};

function ProgressBar({ percent, description, speed, estimated, className }: ProgressBarProps) {
    const indeterminate = percent === null;

    return (
        <div className={`${styles.progressBar} ${className || ''}`}>
            <div
                className={`${styles.progress} ${indeterminate ? styles.indeterminate : ''}`}
                style={indeterminate ? undefined : { width: `${percent}%` }}
            />
            <span className={styles.text}>{description && !indeterminate ? `${description}: ` : description ? description + "..." : ''} {!indeterminate && `${percent}%.`} {speed && speed} {estimated && estimated}</span>
        </div>
    );
}

export default ProgressBar;
