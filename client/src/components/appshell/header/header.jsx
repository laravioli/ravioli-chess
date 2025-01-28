import styles from './header.module.css';
export const Header = () => {
  return (
    <div className={styles.logoContainer}>
      <img src="./images/logo/logo.png" alt="Your Image" height="58px" />
    </div>
  );
};
