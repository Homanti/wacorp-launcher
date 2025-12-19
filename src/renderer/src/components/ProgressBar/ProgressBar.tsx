import styles from './ProgressBar.module.scss';

type ProgressBarProps = {
    percent: number | null;
    description?: string;
};

function ProgressBar({ percent, description }: ProgressBarProps) {
    const indeterminate = percent === null;

    return (
        <div className={styles.progressBar}>
            <div
                className={`${styles.progress} ${indeterminate ? styles.indeterminate : ''}`}
                style={indeterminate ? undefined : { width: `${percent}%` }}
            />
            <span className={styles.text}>{description && !indeterminate ? `${description}: ` : description ? description + "..." : ''} {!indeterminate && `${percent}%`}</span>
        </div>
    );
}

export default ProgressBar;
