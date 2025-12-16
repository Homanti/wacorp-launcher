import styles from './IconButton.module.scss';

type ButtonProps = {
    children: React.ReactNode;
    className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const IconButton = ({ children, className, ...props }: ButtonProps) => {
    return (
        <button className={`${styles.button} ${className || ''}`} {...props}>
            {children}
        </button>
    );
}

export default IconButton;