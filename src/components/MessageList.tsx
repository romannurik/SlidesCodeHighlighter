import cn from "classnames";
import styles from "./MessageList.module.scss";

export interface Message {
  type: "warning" | "info";
  message: string;
}

export function MessageList({
  className,
  messages,
}: {
  className?: string;
  messages: Message[];
}) {
  return (
    <div className={cn(className, styles.list)}>
      {messages.map(({ type, message }, i) => (
        <div data-type={type} className={styles.message} key={i}>
          {message}
        </div>
      ))}
    </div>
  );
}
