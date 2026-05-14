import { observable, action, computed } from 'mobx';
import type { UserServer } from './interface';
import type { Preference, UserSuccess } from '@/lib/api';
import { wsReload } from '@/lib/socket';
import { setPreference } from './utils';
import { UserCacheEvent } from '@/core/boot/interface';

const ANON = {
  id: '',
  username: 'Anonymous',
  preference: { board: 'blue', pieceset: 'base' } as Preference,
};

type UserEvent = ({ type: 'login' } & UserSuccess) | { type: 'logout' };

interface userOpts {
  data: UserServer;
  cacheEvent: UserCacheEvent;
}

export class UserStore {
  id?: string;
  @observable accessor username: string;
  @observable private accessor logged: boolean;

  private cacheEvent: UserCacheEvent;
  private channel: BroadcastChannel | undefined;

  constructor({ data, cacheEvent }: userOpts) {
    if (data.is_auth) {
      this.username = data.username;
      this.logged = true;
    } else {
      this.username = ANON.username;
      this.logged = false;
    }
    this.cacheEvent = cacheEvent;
  }

  onLoad() {
    this.channel = new BroadcastChannel('UserStoreChannel');
    this.channel.onmessage = (event) => {
      const { type, ...data } = event.data;
      if (type === 'login') this.login(data);
      if (type === 'logout') this.logout();
    };
  }

  onUnload() {
    this.channel?.close();
    this.channel = undefined;
  }
  private set preference(pref: Preference) {
    setPreference(pref);
  }

  @computed
  get isAuth() {
    return this.logged;
  }

  @action
  login(user: UserSuccess) {
    this.username = user.username;
    this.preference = user.preference;
    this.logged = true;
    this.cacheEvent.onLogin(user);
    wsReload();
    setTimeout(() =>
      this.broadcast({
        type: 'login',
        ...user,
      }),
    );
  }

  @action
  logout() {
    this.username = ANON.username;
    this.preference = ANON.preference;
    this.logged = false;
    this.cacheEvent.onLogout();
    wsReload();
    setTimeout(() => {
      this.broadcast({
        type: 'logout',
      });
    });
  }

  private broadcast(event: UserEvent) {
    this.channel?.postMessage(event);
  }
}
