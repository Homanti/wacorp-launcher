import styles from "./Input.module.scss";

type InputProps = {
    className?: string;
    ref?: React.Ref<HTMLInputElement>;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className, ref, ...props }: InputProps) => {
    return (
        <input ref={ref} className={`${styles.input} ${className || ''}`} {...props} />
    );
}

export default Input;