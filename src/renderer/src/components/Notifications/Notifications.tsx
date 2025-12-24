import styles from './Notifications.module.scss';
import {useNotificationsStore} from "../../store/useNotificationsStore";
import NotificationItem from "./NotificationItem/NotificationItem";
import {AnimatePresence} from "motion/react";

function Notifications() {
    const notifications = useNotificationsStore(s => s.notifications);

    return (
        <output className={styles.notifications}>
            <AnimatePresence mode={"popLayout"}>
                {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                ))}
            </AnimatePresence>
        </output>
    );
}

export default Notifications;