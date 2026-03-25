import { observable, action } from 'mobx';

import { siteSocket } from '@/lib/socket/socket';
import type { UserInfo } from './interface';
import type { UserSuccess } from '@/lib/api';

import { setPreference } from './utils';

const ANON = 'Anonymous';

export class UserStore {
  id?: string;
  @observable accessor username: string;
  @observable accessor logged: boolean;

  channel: BroadcastChannel;

  constructor(data: UserInfo) {
    data.is_auth ? this.set_as_logged(data) : this.set_as_anon();
    this.listen();
  }

  @action
  set_as_logged(data: UserInfo) {
    this.username = data.username;
    this.logged = true;
  }

  @action
  set_as_anon() {
    this.id = undefined;
    this.username = ANON;
    this.logged = false;
  }

  listen() {
    this.channel = new BroadcastChannel('UserChannel');
    this.channel.onmessage = (event) => {
      const data = event.data;
      switch (data.type) {
        case 'login':
          this.set_as_logged(data);
          setPreference(data.preference);
          siteSocket?.reload();
          break;
        case 'logout':
          window.location.reload();
          break;
      }
    };
  }

  @action
  setName(username: string) {
    this.username = username;
  }

  @action
  login(data: UserSuccess) {
    this.set_as_logged(data);
    setPreference(data.preference);
    setTimeout(
      () =>
        this.channel.postMessage({
          type: 'login',
          ...data,
        }),
      0,
    );
    setTimeout(() => siteSocket?.reload(), 0);
  }

  @action
  logout() {
    setTimeout(() => {
      this.channel.postMessage({
        type: 'logout',
      });
      window.location.reload();
    }, 0);
  }
}
