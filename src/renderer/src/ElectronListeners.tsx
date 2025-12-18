import {useEffect} from "react";
import useProgressBarStore from "./store/useProgressBarStore";
import useLaunchButton from "./store/useLaunchButton";

function ElectronListeners() {
    useEffect(() => {
        try {
            const offProgress = window.api.onProgress(({progress, size, element}) => {
                useProgressBarStore.setState({progress, maxValue: size, description: `Установка... ${element}`, isVisible: true})
                useLaunchButton.setState(state => ({...state, disabled: true, text: "Установка.."}));
            });

            const offChecking = window.api.onChecking(({progress, size, element}) => {
                useProgressBarStore.setState({progress, maxValue: size, description: `Проверка файлов... ${element}`, isVisible: true})
                useLaunchButton.setState(state => ({...state, disabled: true, text: "Проверка файлов.."}));
            });

            const offPatching = window.api.onPatching(() => {
                useProgressBarStore.setState({progress: 99, maxValue: 100, description: `Проверка файлов...`, isVisible: true})
            });

            const offVisible = window.api.onProgressBarVisible(isVisible => useProgressBarStore.setState({isVisible}));

            const offLaunchButton = window.api.onLaunchButton((disabled, text) => {
                if (text) {
                    useLaunchButton.setState(
                        state => ({...state, disabled, text})
                    );
                } else {
                    useLaunchButton.setState(state => ({...state, disabled}));
                }
            });

            return () => {
                offProgress?.();
                offChecking?.();
                offPatching?.();
                offVisible?.();
                offLaunchButton?.();
            };
        } catch (e) {
            console.error(e);
        }
    }, [])

    return null;
}

export default ElectronListeners;