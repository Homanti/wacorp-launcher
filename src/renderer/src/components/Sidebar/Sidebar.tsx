import { NavLink, useLocation, useMatch } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import { motion } from "motion/react";
import { Home, Settings, Siren, User } from "lucide-react";
import {useAuthStore} from "../../store/useAuthStore";
import {useEffect, useState} from "react";
import {extractHead} from "../../utils/extractHead";

const routes = [
    { path: "/", label: "Главная", icon: <Home />, end: true },
    { path: "/accounts", label: "Аккаунты", icon: <User />, end: true },
    { path: "/settings", label: "Настройки", icon: <Settings />, end: true },
    { path: "/fbi/searching", label: "Реестр ФБР", icon: <Siren />, match: "/fbi/*" },
];

const Sidebar = () => {
    const { pathname } = useLocation();
    const fbiMatch = useMatch("/fbi/*");
    const selectedAccount = useAuthStore(s => s.selectedAccount);
    const [headSrc, setHeadSrc] = useState('');

    useEffect(() => {
        if (selectedAccount?.username) {
            const skinUrl = `https://raw.githubusercontent.com/Homanti/wacorp-skins/main/${selectedAccount?.username}.png`;
            extractHead(skinUrl)
                .then((dataUrl: string) => setHeadSrc(dataUrl))
                .catch(console.error);
        }
    }, [selectedAccount?.username]);

    return (
        <div className={styles.sidebar}>
            <div className={styles.account}>
                <img src={headSrc} className={styles.avatar} alt="avatar" />
                <h2>{selectedAccount?.username}</h2>
            </div>

            <nav className={styles.nav}>
                {routes.map((route) => {
                    const isActive = route.match ? !!fbiMatch : (route.end ? pathname === route.path : pathname.startsWith(route.path));

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
    );
};

export default Sidebar;
