import styles from './header.module.css';
import logoUrl from '/images/logo/logo.png';
export const Header = () => {
  return (
    <div className={styles.logoContainer}>
      <img src={logoUrl} alt="Your Image" height="58px" />
    </div>
  );
};
