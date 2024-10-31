import { PropsWithChildren } from "react";
import styles from "./Toolbar.module.scss";

export function CustomToolbar({
  heading,
  children,
}: PropsWithChildren<{ heading: string }>) {
  return (
    <>
      <div className={styles.titleBar}>{heading}</div>
      <div className={styles.toolbar}>{children}</div>
    </>
  );
}
