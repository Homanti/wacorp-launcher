import styles from "./Textarea.module.scss";

type TextareaProps = {
    className?: string;
    ref?: React.Ref<HTMLTextAreaElement>;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = ({ className, ref, ...props }: TextareaProps) => {
    return (
        <textarea ref={ref} className={`${styles.textarea} ${className || ''}`} {...props} />
    );
}

export default Textarea;