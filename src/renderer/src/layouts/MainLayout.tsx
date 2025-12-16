import Header from "../components/Header/Header.tsx";
import {type ReactNode, useEffect} from "react";
import Sidebar from "../components/Sidebar/Sidebar.tsx";
import styles from "./MainLayout.module.scss";
import {motion, AnimatePresence} from "motion/react";
import ProgressBar from "../components/ProgressBar/ProgressBar";
import useProgressBarStore from "../store/useProgressBarStore";

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
    const progress = useProgressBarStore(state => state.progress)
    const maxValue = useProgressBarStore(state => state.maxValue)
    const description = useProgressBarStore(state => state.description)

    useEffect(() => {
        try {
            const offProgress = window.api.onProgress(({progress, size, element}) => {
                useProgressBarStore.setState({progress, maxValue: size, description: `Установка... ${element}`, isVisible: true})
            });

            const offChecking = window.api.onChecking(({progress, size, element}) => {
                useProgressBarStore.setState({progress, maxValue: size, description: `Проверка файлов... ${element}`, isVisible: true})
            });

            const offPatching = window.api.onPatching(() => {
                useProgressBarStore.setState({progress: 99, maxValue: 100, description: `Проверка файлов...`, isVisible: true})
            });

            const offVisible = window.api.onProgressBarVisible(isVisible => useProgressBarStore.setState({isVisible}));

            return () => {
                offProgress?.();
                offChecking?.();
                offPatching?.();
                offVisible?.();
            };
        } catch (e) {
            console.error(e);
        }
    }, [])

    return (
        <>
            <div className={styles.mainLayout}>
                <Header/>

                <div className={styles.mainLayout__content}>
                    {isSidebar && <Sidebar/>}
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
                            <ProgressBar progress={progress} max={maxValue} description={description}/>
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        </>
    )
}

export default MainLayout;