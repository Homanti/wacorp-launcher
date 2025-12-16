import Button from "../../../components/Button/Button";
import styles from "./AccountItem.module.scss";
import {Pencil, Trash} from "lucide-react";
import avatar from "../../../assets/avatar.png";

function AccountItem({children}: {children:string}) {
    return (
        <li className={styles.item}>
            <div className={styles.content}>
                <img src={avatar} />
                <h2>{children}</h2>
            </div>
            <div className={styles.actions}>
                <Button className={styles.button}><Pencil /></Button>
                <Button className={styles.button}><Trash /></Button>
            </div>
        </li>
    );
}

export default AccountItem;