import Snowfall from 'react-snowfall';
import {useSettingsStore} from "../store/useSettingsStore";

const Snow = () => {
    const showVisible = useSettingsStore(s => s.snowVisible);
    if (!showVisible) return null;

    return (
        <Snowfall
            color="#fff"
            snowflakeCount={150}
            speed={[0.5, 2.0]}
            wind={[-0.5, 1.0]}
            opacity={[0.6, 1]}
            style={{
                position: 'fixed',
                width: '100vw',
                height: '100vh',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 9999
            }}
        />
    );
};

export default Snow;