import { useCallback, useEffect, useRef } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';
import type { CreateTypes, Options } from 'canvas-confetti';

interface ConfettiProps {
    fire: boolean;
}

type OnInitParams = {
    confetti: CreateTypes;
};

const Confetti = ({ fire }: ConfettiProps) => {
    const refAnimationInstance = useRef<CreateTypes | null>(null);

    const getInstance = useCallback((params: OnInitParams) => {
        refAnimationInstance.current = params.confetti;
    }, []);

    const makeShot = useCallback((particleRatio: number, opts: Options) => {
        if (refAnimationInstance.current) {
            refAnimationInstance.current({
                ...opts,
                origin: { y: 0.95, x: 0.63 },
                particleCount: Math.floor(200 * particleRatio)
            });
        }
    }, []);

    const fireConfetti = useCallback(() => {
        makeShot(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        makeShot(0.2, {
            spread: 60,
        });

        makeShot(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        makeShot(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, [makeShot]);

    useEffect(() => {
        if (fire) {
            fireConfetti();
        }
    }, [fire, fireConfetti]);

    return (
        <ReactCanvasConfetti
            onInit={getInstance}
            style={{
                position: 'fixed',
                pointerEvents: 'none',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                zIndex: 10000
            }}
        />
    );
};

export default Confetti;