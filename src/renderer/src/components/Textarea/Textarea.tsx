import styles from "./Textarea.module.scss";

type TextareaProps = {
    className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = ({ className, ...props }: TextareaProps) => {
    return (
        <textarea className={`${styles.textarea} ${className || ''}`} {...props} />
    );
}

export default Textarea;