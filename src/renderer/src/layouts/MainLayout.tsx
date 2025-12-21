import Header from "../components/Header/Header.tsx";
import {type ReactNode} from "react";
import Sidebar from "../components/Sidebar/Sidebar.tsx";
import styles from "./MainLayout.module.scss";
import {motion, AnimatePresence} from "motion/react";
import ProgressBar from "../components/ProgressBar/ProgressBar";
import useProgressBarStore from "../store/useProgressBarStore";
import {useAuthStore} from "../store/useAuthStore";

type MainLayoutProps = {
    children: ReactNode;
    isSidebar?: boolean;
};

const pageVariants = {
    initial: {opacity: 0, y: 30},
    animate: {opacity: 1, y: 0},
    exit: {opacity: 0, y: 30},
};

const MainLayout = ({children, isSidebar = true}: MainLayoutProps) => {
    const progressBarisVisible = useProgressBarStore(state => state.isVisible)
    const percent = useProgressBarStore(state => state.percent)
    const description = useProgressBarStore(state => state.description)
    const accounts = useAuthStore(state => state.accounts);

    const showSidebar = accounts.length > 0 || isSidebar;

    return (
        <>
            <div className={styles.mainLayout}>
                <Header/>

                <div className={styles.mainLayout__content}>
                    {showSidebar && <Sidebar/>}
                    <motion.div className={styles.animationWrapper}
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{type: "spring", stiffness: 500, damping: 40}}
                    >
                        {children}
                    </motion.div>
                </div>

                <AnimatePresence initial={false}>
                    {progressBarisVisible &&
                        <motion.div
                            key="progress"
                            initial={{height: 0}}
                            animate={{height: "auto"}}
                            exit={{height: 0}}
                        >
                            <ProgressBar percent={percent} description={description}/>
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        </>
    )
}

export default MainLayout;