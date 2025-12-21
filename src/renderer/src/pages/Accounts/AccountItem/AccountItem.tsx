import Button from "../../../components/Button/Button";
import styles from "./AccountItem.module.scss";
import {Pencil, Play, Trash} from "lucide-react";
import avatar from "../../../assets/avatar.png";
import {useAuthStore} from "../../../store/useAuthStore";
import { motion } from "motion/react";

function AccountItem({children}: {children:string}) {
    const removeAccount = useAuthStore(s => s.removeAccount);
    const setSelectedAccount = useAuthStore(s => s.setSelectedAccount);

    return (
        <motion.li className={styles.item}
                   initial={{ opacity: 0, x: "-110%" }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: "110%" }}
                   layout
        >
            <div className={styles.content}>
                <img src={avatar} alt="avatar"/>
                <h2>{children}</h2>
            </div>

            <div className={styles.actions}>
                <Button className={styles.button} onClick={() => setSelectedAccount(children)}><Play /></Button>
                <Button className={styles.button}><Pencil /></Button>
                <Button className={`${styles.button} ${styles.dangerButton}`} onClick={() => removeAccount(children)}><Trash /></Button>
            </div>
        </motion.li>
    );
}

export default AccountItem;