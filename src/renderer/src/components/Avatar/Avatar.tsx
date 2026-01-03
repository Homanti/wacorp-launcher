import placeholder from "../../assets/avatar-placeholder.png";
import {extractHead} from "../../utils/extractHead";
import styles from "./Avatar.module.scss";
import apiClient from "../../utils/api";
import useSWR from 'swr';

const fetcher = async (username: string) => {
    const response = await apiClient.get(`/api/skin/${username}`);
    const { skinURL } = response.data;
    return await extractHead(skinURL);
};

function Avatar({username}: {username: string | undefined}) {
    const { data: avatar, error, isLoading } = useSWR(
        username ? `/avatar/${username}` : null,
        () => fetcher(username!),
        {
            fallbackData: placeholder,
            revalidateOnFocus: false,
            onError: (err) => console.error('Avatar load error:', err)
        }
    );

    return (
        <img
            className={styles.avatar}
            src={error || isLoading ? placeholder : (avatar || placeholder)}
            alt={"avatar"}
        />
    );
}

export default Avatar;