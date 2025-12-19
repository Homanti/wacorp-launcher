import styles from './ProgressBar.module.scss';

type ProgressBarProps = {
    percent: number;
    description?: string;
};

function ProgressBar({percent, description}: ProgressBarProps) {
    return (
        <div className={styles.progressBar}>
            <div className={styles.progress} style={{width: `${percent}%`}}></div>
            <span className={styles.text}>{description && description + ": "} {`${percent}%`}</span>
        </div>
    );
}

export default ProgressBar;