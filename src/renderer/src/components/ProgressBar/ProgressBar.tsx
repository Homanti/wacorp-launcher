import styles from './ProgressBar.module.scss';

type ProgressBarProps = {
    progress: number;
    max: number;
    description?: string;
};

function ProgressBar({progress, max, description}: ProgressBarProps) {
    return (
        <div className={styles.progressBar}>
            <div className={styles.progress} style={{width: `${progress/max*100}%`}}></div>
            <span className={styles.text}>{description && description + ": "} {`${Math.round(progress/max*100)}%`}</span>
        </div>
    );
}

export default ProgressBar;