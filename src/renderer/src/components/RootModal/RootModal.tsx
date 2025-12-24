import {AnimatePresence, motion} from "motion/react";
import styles from './RootModal.module.scss';
import { useRef } from "react";
import {useModalStore} from "../../store/useModalStore";
import {useClickOutside} from "../../hooks/useClickOutside";
import IconButton from "../IconButton/IconButton";
import {X} from "lucide-react";

function RootModal() {
    const modalRef = useRef<HTMLDivElement>(null);
    const content = useModalStore(s => s.content);
    const title = useModalStore(s => s.title);
    const isOpened = useModalStore(s => s.isOpened);
    const closeModal = useModalStore(s => s.closeModal);

    useClickOutside(modalRef, () => {if (isOpened) closeModal()}, true);

    return (
        <AnimatePresence>
            {isOpened && (
                <motion.div className={styles.backdrop}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                >
                    <motion.div className={styles.modal}
                                initial={{y: "110vh"}}
                                animate={{y: 0}}
                                exit={{y: "110vh"}}
                                transition={{type: "spring", stiffness: 290, damping: 25}}
                                ref={modalRef}
                    >
                        <header className={styles.header}>
                            {title}
                            <IconButton onClick={() => closeModal()}>
                                <X />
                            </IconButton>
                        </header>

                        <main className={styles.content}>
                            {content}
                        </main>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default RootModal;