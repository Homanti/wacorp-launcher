import {NavLink, useLocation} from 'react-router-dom';
import styles from './Sidebar.module.scss';
import {motion} from "motion/react";
import {Home, Settings, User} from "lucide-react";
import avatar from "../../assets/avatar.png";

const routes = [
    {"path": "/", "label": "Главная", "icon": <Home/>},
    {"path": "/accounts", "label": "Аккаунты", icon: <User/>},
    {"path": "/settings", "label": "Настройки", icon: <Settings/>},
];

const Sidebar = () => {
    const {pathname} = useLocation();

    return (
        <div className={styles.sidebar}>
            <div className={styles.account}>
                <img src={avatar} className={styles.avatar} alt="avatar"/>
                <h2>Homanti</h2>
            </div>

            <nav className={styles.nav}>
                {routes.map((route) => (
                    <NavLink key={route.path} to={route.path} className={styles.navItem}>
                        <span className={styles.navItemContent}>
                            {route.icon}
                            {route.label}
                        </span>

                        {pathname === route.path && (
                            <motion.div
                                layoutId="activeBackground"
                                className={styles.activeBackground}
                                transition={{type: "spring", stiffness: 500, damping: 40}}
                            />
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}

export default Sidebar;