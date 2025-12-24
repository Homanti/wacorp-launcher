import {useEffect} from "react";
import useProgressBarStore from "./store/useProgressBarStore";
import useLaunchButton from "./store/useLaunchButton";
import {useNotificationsStore} from "./store/useNotificationsStore";

function ElectronListeners() {
    useEffect(() => {
        try {
            const offProgressBar = window.api.onProgressBar((isVisible, description, percent) => {
                if (description && percent !== undefined) {
                    useProgressBarStore.setState(
                        state => ({...state, isVisible, description: description, percent: percent})
                    );
                } else {
                    useProgressBarStore.setState(state => ({...state, isVisible}));
                }
            });

            const offProgressBarSpeed = window.api.onProgressBarSpeed((speed) => {
                useProgressBarStore.setState(
                    state => ({...state, speed: speed})
                );
            });

            const offProgressBarEstimated = window.api.onProgressBarEstimated((estimated) => {
                useProgressBarStore.setState(
                    state => ({...state, estimated: estimated})
                );
            });

            const offLaunchButton = window.api.onLaunchButton((disabled, text) => {
                if (text) {
                    useLaunchButton.setState(
                        state => ({...state, disabled, text})
                    );
                } else {
                    useLaunchButton.setState(state => ({...state, disabled}));
                }
            });

            const offAddNotification = window.api.onAddNotification((type, text) => {
                useNotificationsStore.getState().addNotification({type, text});
            });

            return () => {
                offProgressBar?.();
                offLaunchButton?.();
                offAddNotification?.();
                offProgressBarSpeed?.();
                offProgressBarEstimated?.();
            };
        } catch (e) {
            console.error(e);
        }
    }, [])

    return null;
}

export default ElectronListeners;