import { observable, action, reaction, computed } from 'mobx';

import type { UserServer } from './interface';
import type { Preference, UserSuccess } from '@/lib/api';

import { setPreference } from './utils';

const ANON: UserSuccess = {
  id: '',
  username: 'Anonymous',
  preference: { board: 'blue', pieceset: 'base' },
};

type UserEvent = ({ type: 'login' } & UserSuccess) | { type: 'logout' };
type AuthReaction = () => void;

export class UserStore {
  id?: string;
  @observable accessor username: string;
  @observable private accessor logged: boolean;

  private channel: BroadcastChannel | undefined;

  constructor(data: UserServer) {
    if (data.is_auth) {
      this.username = data.username;
      this.logged = true;
    } else {
      this.username = ANON.username;
      this.logged = false;
    }
  }

  private set preference(pref: Preference) {
    setPreference(pref);
  }

  @computed
  get isAuth() {
    return this.logged;
  }

  onAuthchange = (f: AuthReaction) => reaction(() => this.logged, f);

  @action
  login(user: UserSuccess) {
    this.username = user.username;
    this.preference = user.preference;
    this.logged = true;
  }

  @action
  logout() {
    this.username = ANON.username;
    this.preference = ANON.preference;
    this.logged = false;
  }

  listen() {
    this.channel = new BroadcastChannel('UserStoreChannel');
    this.channel.onmessage = (event) => {
      const { type, ...data } = event.data;
      if (type === 'login') this.login(data);
      if (type === 'logout') this.logout();
    };
  }

  unlisten() {
    this.channel?.close();
    this.channel = undefined;
  }

  broadcast(event: UserEvent) {
    this.channel?.postMessage(event);
  }
}
