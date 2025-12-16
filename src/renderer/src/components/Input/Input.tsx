import styles from "./Input.module.scss";

type InputProps = {
    className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className, ...props }: InputProps) => {
    return (
        <input className={`${styles.input} ${className || ''}`} {...props} />
    );
}

export default Input;