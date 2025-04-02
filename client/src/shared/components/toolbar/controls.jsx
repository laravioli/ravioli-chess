import { Button } from '@mantine/core';
import styles from '../css/toolbar.module.css';

export function Controls({ children }) {
  return (
    <>
      <Button.Group orientation="vertical" classNames={{ group: styles.group }}>
        {children}
      </Button.Group>
    </>
  );
}
