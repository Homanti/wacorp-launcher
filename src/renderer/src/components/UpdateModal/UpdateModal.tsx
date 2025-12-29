import { useEffect, useState } from 'react';
import styles from './UpdateModal.module.scss';
import {useModalStore} from "../../store/useModalStore";
import Button from "../Button/Button";
import ProgressBar from "../ProgressBar/ProgressBar";

export function UpdateModal() {
    const [updateState, setUpdateState] = useState<'checking' | 'available' | 'downloading' | 'ready' | null>(null);
    const [progress, setProgress] = useState(0);
    const [version, setVersion] = useState('');
    const [bytesPerSecond, setBytesPerSecond] = useState(0);

    const { openModal, closeModal } = useModalStore();

    const handleDownload = () => {
        window.updater.downloadUpdate();
    };

    const handleInstall = () => {
        window.updater.quitAndInstall();
    };

    useEffect(() => {
        const unsubChecking = window.updater.onCheckingForUpdate(() => {
            setUpdateState('checking');
        });

        const unsubAvailable = window.updater.onUpdateAvailable((info) => {
            setUpdateState('available');
            setVersion(info.version);
        });

        const unsubProgress = window.updater.onDownloadProgress((progressObj) => {
            setUpdateState('downloading');
            setProgress(Math.round(progressObj.percent));
            setBytesPerSecond(progressObj.bytesPerSecond);
        });

        const unsubDownloaded = window.updater.onUpdateDownloaded((info) => {
            setUpdateState('ready');
            setVersion(info.version);
        });

        const unsubError = window.updater.onError((error) => {
            console.error('Update error:', error);
            setUpdateState(null);
            closeModal();
        });

        const unsubNotAvailable = window.updater.onUpdateNotAvailable(() => {
            setUpdateState(null);
        });

        window.updater.checkForUpdates();

        return () => {
            unsubChecking();
            unsubAvailable();
            unsubProgress();
            unsubDownloaded();
            unsubError();
            unsubNotAvailable();
        };
    }, [closeModal]);

    useEffect(() => {
        if (updateState === 'checking') {
            openModal(<CheckingContent />, 'Проверка обновлений');
        } else if (updateState === 'available') {
            openModal(<AvailableContent version={version} onDownload={handleDownload} />, 'Доступно обновление лаунчера', false);
        } else if (updateState === 'downloading') {
            openModal(<DownloadingContent percent={progress} speed={bytesPerSecond} />, 'Загрузка обновления лаунчера', false);
        } else if (updateState === 'ready') {
            openModal(<ReadyContent version={version} onInstall={handleInstall} />, 'Обновление лаунчера готово', false);
        } else {
            closeModal();
        }
    }, [updateState, progress, version, bytesPerSecond, openModal, closeModal]);

    return null;
}

function CheckingContent() {
    return (
        <div className={styles.updateContent}>
            <div className={styles.spinner} />
            <p>Проверяем наличие обновлений...</p>
        </div>
    );
}

function AvailableContent({ version, onDownload }: { version: string; onDownload: () => void }) {
    return (
        <div className={styles.updateContent}>
            <p>Доступна новая версия лаунчера <strong>{version}</strong></p>
            <Button onClick={onDownload} className={styles.btnPrimary}>
                Скачать обновление
            </Button>
        </div>
    );
}

function DownloadingContent({ percent, speed }: { percent: number; speed: number }) {
    const speedMB = (speed / 1024 / 1024).toFixed(2);

    return (
        <div className={styles.updateContent}>
            <ProgressBar className={styles.progressBar} percent={percent} description={"Загрузка обновления"} speed={speedMB} />
        </div>
    );
}

function ReadyContent({ version, onInstall }: { version: string; onInstall: () => void }) {
    return (
        <div className={styles.updateContent}>
            <p>Обновление до версии <strong>{version}</strong> загружено!</p>
            <Button onClick={onInstall} className={styles.btnPrimary}>
                Установить и перезапустить
            </Button>
        </div>
    );
}