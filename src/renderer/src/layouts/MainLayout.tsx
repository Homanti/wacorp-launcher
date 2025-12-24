import Header from "../components/Header/Header.tsx";
import {type ReactNode} from "react";
import Sidebar from "../components/Sidebar/Sidebar.tsx";
import styles from "./MainLayout.module.scss";
import {motion, AnimatePresence} from "motion/react";
import ProgressBar from "../components/ProgressBar/ProgressBar";
import useProgressBarStore from "../store/useProgressBarStore";
import {useAuthStore} from "../store/useAuthStore";
import {Outlet, useLocation} from "react-router-dom";
import Notifications from "../components/Notifications/Notifications";
import RootModal from "../components/RootModal/RootModal";

type MainLayoutProps = {
    children: ReactNode;
    isSidebar?: boolean;
};

const MainLayout = ({children, isSidebar = true}: MainLayoutProps) => {
    const progressBarisVisible = useProgressBarStore(state => state.isVisible)
    const percent = useProgressBarStore(state => state.percent)

    const estimated = useProgressBarStore(state => state.estimated)
    const speed = useProgressBarStore(state => state.speed)

    const description = useProgressBarStore(state => state.description)
    const accounts = useAuthStore(state => state.accounts);
    const routerLocation = useLocation();

    const showSidebar = accounts.length > 0 || isSidebar;

    const pageVariants = {
        initial: {opacity: 0, y: showSidebar ? 30 : 0},
        animate: {opacity: 1, y: 0},
        exit: {opacity: 0, y: showSidebar ? 30 : 0},
    };

    return (
        <>
            <div className={styles.mainLayout}>
                <Header/>

                <div className={styles.content}>
                    {showSidebar && <Sidebar/>}

                    <AnimatePresence mode={"popLayout"} initial={false}>
                        <motion.div
                            className={styles.animationWrapper}
                            key={routerLocation.pathname}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{type: "spring", stiffness: 500, damping: 40}}
                        >

                            {children ?? <Outlet />}
                        </motion.div>
                    </AnimatePresence>

                    <Notifications />
                    <RootModal />
                </div>

                <AnimatePresence initial={false}>
                    {progressBarisVisible &&
                        <motion.div
                            key="progress"
                            initial={{height: 0}}
                            animate={{height: "auto"}}
                            exit={{height: 0}}
                        >
                            <ProgressBar percent={percent} description={description} speed={speed} estimated={estimated} />
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        </>
    )
}

export default MainLayout;