import {NavLink, useLocation, useMatch} from "react-router-dom";
import styles from "./Sidebar.module.scss";
import { motion } from "motion/react";
import { Home, Settings, Siren, User } from "lucide-react";
import {useAuthStore} from "../../store/useAuthStore";
import {useNotificationsStore, type Notification} from "../../store/useNotificationsStore";
import Avatar from "../Avatar/Avatar";
import {useState} from "react";
import PAGES from "../../../../config/pages.config";
import { version } from "../../../../../package.json";
import isNewYearPeriod from "../../utils/IsNewYearPeriod";
import {useModalStore} from "../../store/useModalStore";
import CreditsModal from "./CreditsModal/CreditsModal";

const Sidebar = () => {
    const { pathname } = useLocation();
    const fbiMatch = useMatch("/fbi/*");
    const selectedAccount = useAuthStore(s => s.selectedAccount);

    const openModal = useModalStore(s => s.openModal);

    const addNotification = useNotificationsStore(s => s.addNotification);

    const [clickCount, setClickCount] = useState(0);

    const routes = [
        { path: PAGES.HOME, label: "Главная", icon: <Home />, end: true },
        { path: PAGES.ACCOUNTS, label: "Аккаунты", icon: <User />, end: true },
        { path: PAGES.SETTINGS, label: "Настройки", icon: <Settings />, end: true },
        { path: "/fbi", label: "Реестр ФБР", icon: <Siren />, match: "/fbi/*", visible: selectedAccount?.fbiAccess || false },
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.top}>
                <div className={styles.account}>
                    <div className={styles.avatar}
                         onClick={() => {
                             const easterEgg: Notification[] = [
                                 {
                                     type: "info",
                                     text: "Зачем ты сюда нажал?"
                                 },
                                 {
                                     type: "info",
                                     text: "Не нажимай сюда, ладно?"
                                 },
                                 {
                                     type: "error",
                                     text: "Остановить!",
                                 },
                                 {
                                     type: "info",
                                     text: "Это последнее уведомление, хватит нажимать!",
                                 },
                                 {
                                     type: "info",
                                     text: "Это точно последнее.",
                                 },
                                 {
                                     type: "error",
                                     text: "Последний раз прошу. Перестань!",
                                 },
                                 {
                                     type: "error",
                                     text: "Установка майнеров на ваш компьютер...",
                                     shake: true
                                 },
                                 {
                                     type: "success",
                                     text: "Установка прошла успешно!"
                                 },
                                 {
                                     type: "info",
                                     text: "Передача всех ваших данных ФБР...",
                                 },
                                 {
                                     type: "success",
                                     text: "К вам выехал наряд, ожидайте!"
                                 }
                             ];

                             if (clickCount < easterEgg.length) addNotification(easterEgg[clickCount])

                             setClickCount(clickCount + 1);

                             if (clickCount === easterEgg.length) {
                                 setClickCount(0);
                                 window.open('https://www.youtube.com/watch?v=vdmYF6App9M', '_blank', 'noopener noreferrer');
                             }
                         }}
                    >
                        <Avatar username={selectedAccount?.username} />
                    </div>
                    <h2>{selectedAccount?.username}</h2>

                    {(!selectedAccount?.discordId || !selectedAccount?.accepted) && (
                        <p className={styles.accountStatus}>
                            {!selectedAccount?.discordId
                                ? <NavLink to={PAGES.LINK_DISCORD}>Discord аккаунт не привязан</NavLink>
                                : "Ожидает одобрения модератора"
                            }
                        </p>
                    )}
                </div>

                <nav className={styles.nav}>
                    {routes.map((route) => {
                        const isActive = route.match ? !!fbiMatch : (route.end ? pathname === route.path : pathname.startsWith(route.path));

                        if (route.visible === false) return null;

                        return (
                            <NavLink key={route.path} to={route.path} end={route.end} className={styles.navItem}>
                            <span className={styles.navItemContent}>
                                {route.icon}
                                {route.label}
                            </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="activeBackground"
                                        className={styles.activeBackground}
                                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                    />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className={styles.bottom}>
                <div className={styles.version} onDoubleClick={() => openModal(<CreditsModal />, "Благодарности")}>
                    {version}
                    {isNewYearPeriod() && (
                        <span>Новогодняя версия</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;