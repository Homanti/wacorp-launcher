import {useAuthStore} from "../../store/useAuthStore";
import {useState} from "react";
import {AnimatePresence} from "motion/react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import styles from "./Auth.module.scss";

function Auth() {
    const accounts = useAuthStore(s => s.accounts);
    const isAddAccountFlow = accounts.length > 0;
    const [formType, setFormType] = useState<'login' | 'register'>('login');

    return (
        <main className={`${styles.auth} ${!isAddAccountFlow && styles.noAccounts}`}>
            <div className={styles.authForm}>
                <AnimatePresence mode="wait" initial={false}>
                    {formType === 'login' ? (
                        <LoginForm key="login" setFormType={setFormType} />
                    ) : (
                        <RegisterForm key="register" setFormType={setFormType} />
                    )}
                </AnimatePresence>
            </div>

            {!isAddAccountFlow && (
                <div className={styles.noAccounts} />
            )}
        </main>
    );
}

export default Auth;