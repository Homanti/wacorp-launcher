import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T | null>, // реф компонента который нужно отслеживать
    handler: (event: MouseEvent | TouchEvent) => void, // обработчик клика вне компонента
    isActive = false, // флаг для включения/выключения обработчика
    exceptionRef?: RefObject<HTMLElement | null> | null // реф исключения, на которое клик не должен срабатывать
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!isActive) return;

            const target = event.target as Node;

            const refEl = ref.current;
            const exceptionEl = exceptionRef?.current;

            if (!refEl) return;
            const clickedInsideRef = refEl.contains(target);
            const clickedOnException = exceptionEl?.contains(target) ?? false;

            if (clickedInsideRef || clickedOnException) return;

            handler(event);
        };

        document.addEventListener('mouseup', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mouseup', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, isActive, exceptionRef]);
}
