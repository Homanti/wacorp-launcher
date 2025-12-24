import styles from "./NotificationsItem.module.scss";
import {Check, CircleAlert, Info} from "lucide-react";
import {type Notification} from "../../../store/useNotificationsStore";
import { motion } from "motion/react";

const icons = {
    success: <Check />,
    info: <Info />,
    error: <CircleAlert />,
};

function NotificationItem({ notification }: { notification: Notification }) {
    return (
        <motion.div key={`layout-${notification.id}`} transition={{layout: {duration: 0.2}}} layout={"position"}>
            <motion.div
                className={`${styles.notificationItem} ${styles[notification.type]}`}
                initial={{x: "110%"}}
                animate={{x: 0}}
                exit={{x: "110%"}}
                transition={{type: "spring", stiffness: 600, damping: 30}}
            >
                <span className={`${styles.content} ${notification.shake && styles.shakingText}`}>
                    <span className={styles.icon}>{icons[notification.type]}</span> <p>{notification.text}</p>
                </span>
            </motion.div>
        </motion.div>
    );
}

export default NotificationItem;