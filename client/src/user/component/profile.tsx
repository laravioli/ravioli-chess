import clsx from 'clsx';

import { Header } from './header';
import l from '@/user/css/layout.module.css';
import s from '@/user/css/header.module.css';

const Profile: React.FC = () => {
  return (
    <div className={clsx(l.profile, s.profile)}>
      <Header />
    </div>
  );
};

export default Profile;
