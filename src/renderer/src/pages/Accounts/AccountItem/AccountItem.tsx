import Button from "../../../components/Button/Button";
import styles from "./AccountItem.module.scss";
import {LogOut, Pencil, Play} from "lucide-react";
import {useAuthStore} from "../../../store/useAuthStore";
import { motion } from "motion/react";
import Avatar from "../../../components/Avatar/Avatar";
import {useModalStore} from "../../../store/useModalStore";
import ChangeSkinModal from "./ChangeSkinModal/ChangeSkinModal";

function AccountItem({children}: {children: string}) {
    const logout = useAuthStore(s => s.logout);
    const setSelectedAccount = useAuthStore(s => s.setSelectedAccount);
    const openModal = useModalStore(s => s.openModal);

    return (
        <motion.div
            layout
        >
            <motion.li className={styles.item}
                       initial={{ opacity: 0, x: "-110%" }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: "110%" }}
            >
                <div className={styles.content}>
                    <div className={styles.avatar}>
                        <Avatar username={children} />
                    </div>
                    <h2>{children}</h2>
                </div>

                <div className={styles.actions}>
                    <Button className={styles.button} onClick={() => setSelectedAccount(children)}><Play /></Button>
                    <Button className={styles.button} onClick={() => openModal(<ChangeSkinModal username={children} />, "Смена скина")}>
                        <Pencil />
                    </Button>
                    <Button className={`${styles.button} ${styles.dangerButton}`} onClick={() => logout(children)}><LogOut /></Button>
                </div>
            </motion.li>
        </motion.div>
    );
}

export default AccountItem;