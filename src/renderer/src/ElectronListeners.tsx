import {useEffect} from "react";
import useProgressBarStore from "./store/useProgressBarStore";
import useLaunchButton from "./store/useLaunchButton";

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
                offProgressBar?.();
                offLaunchButton?.();
            };
        } catch (e) {
            console.error(e);
        }
    }, [])

    return null;
}

export default ElectronListeners;