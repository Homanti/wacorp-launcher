import placeholder from "../../assets/avatar-placeholder.png";
import {useEffect, useState} from "react";
import {extractHead} from "../../utils/extractHead";
import styles from "./Avatar.module.scss";

function Avatar({username}: {username: string | undefined}) {
    const [avatar, setAvatar] = useState(placeholder);

    useEffect(() => {
        if (!username) return setAvatar(placeholder);

        (async () => {
            try {
                const skinURL = `https://raw.githubusercontent.com/Homanti/wacorp-skins/refs/heads/main/skins/${username}.png`
                const dataUrl = await extractHead(skinURL);

                setAvatar(dataUrl);

            } catch (error) {
                console.error(error);
                setAvatar(placeholder);
            }
        })();
    }, [username]);

    return (
        <img className={styles.avatar} src={avatar} alt={"avatar"} />
    );
}

export default Avatar;