import styles from "./DiscordLink.module.scss";
import {useNavigate} from "react-router-dom";
import {useNotificationsStore} from "../../store/useNotificationsStore";
import {useAuthStore} from "../../store/useAuthStore";
import Button from "../../components/Button/Button";
import PAGES from "../../../../config/pages.config";

function DiscordLink() {
    const selectedAccount = useAuthStore(s => s.selectedAccount);
    const setSelectedAccount = useAuthStore(s => s.setSelectedAccount);
    const navigate = useNavigate();
    const addNotification = useNotificationsStore(s => s.addNotification);

    if (!selectedAccount) {
        return null;
    }

    const handleClick = async () => {
        await setSelectedAccount(selectedAccount.username);
        navigate(PAGES.HOME);
    }

    const copy = (text: string) => {
        addNotification({type: "success", text: "Скопировано!"})
        navigator.clipboard.writeText(text);
    }

    return (
        <main className={styles.discordLink}>
            <h3>
                Для завершение регистрации напишите <span onClick={() => copy('/link user_id:' + selectedAccount?.id)} className={styles.copy}>/link {selectedAccount?.id}</span> в этом <a href={"https://discord.gg/Ms6fuCDgHW"} target="_blank" rel="noopener noreferrer">Discord канале</a>
            </h3>

            <Button onClick={handleClick}>Далее</Button>
        </main>
    );
}

export default DiscordLink;