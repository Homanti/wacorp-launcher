import placeholder from "../../assets/avatar-placeholder.png";
import {useEffect, useState} from "react";
import {extractHead} from "../../utils/extractHead";
import styles from "./Avatar.module.scss";

function Avatar({username}: {username: string | undefined}) {
    const [avatar, setAvatar] = useState(placeholder);

    useEffect(() => {
        if (!username) return setAvatar(placeholder);

        const skinUrl = `https://raw.githubusercontent.com/Homanti/wacorp-skins/main/${username}.png`;
        extractHead(skinUrl)
            .then((dataUrl: string) => setAvatar(dataUrl))
            .catch(console.error);
    }, [username]);

    return (
        <img className={styles.avatar} src={avatar} alt={"avatar"} />
    );
}

export default Avatar;