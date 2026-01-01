import isNewYearPeriod from "../utils/IsNewYearPeriod";
import {useEffect} from "react";
import cursor from "../assets/christmas-cursor.png";
import pointer from "../assets/christmas-pointer.png";

const NewYearCursor = () => {
    useEffect(() => {
        if (!isNewYearPeriod()) return;

        const style = document.createElement('style');
        style.id = 'new-year-cursor';
        style.innerHTML = `
              * {
                cursor: url(${cursor}) 0 0, auto !important;
              }
        
              button,
              a,
              [role="button"] {
                cursor: url(${pointer}) 8 0, pointer !important;
              }
        
              input, textarea {
                cursor: text !important;
              }
        
              button *,
              a *,
              [role="button"] * {
                cursor: inherit !important;
              }
        `;

        document.head.appendChild(style);

        return () => {
            const styleElement = document.getElementById('new-year-cursor');
            if (styleElement) {
                document.head.removeChild(styleElement);
            }
        };
    }, []);

    return null;
};

export default NewYearCursor;