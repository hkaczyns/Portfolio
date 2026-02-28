import { Loader2 } from "lucide-react";
import styles from "./Spinner.module.css";

export interface SpinnerProps {
    size?: number;
    color?: string;
}

export const Spinner = ({ size = 20, color = "black" }: SpinnerProps) => {
    return <Loader2 size={size} color={color} className={styles.spinner} />;
};
