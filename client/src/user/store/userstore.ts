import { observable, action } from 'mobx';

import { siteSocket } from '@/lib/socket/socket';

import type { UserInfo } from './interface';

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
          break;
        case 'logout':
          this.set_as_anon();
          break;
      }
      siteSocket?.reload();
    };
  }

  @action
  setName(username: string) {
    this.username = username;
  }

  @action
  login(data: UserInfo) {
    this.set_as_logged(data);
    setTimeout(
      () =>
        this.channel.postMessage({
          type: 'login',
          id: data.id,
          username: data.username,
        }),
      0,
    );
    setTimeout(() => siteSocket?.reload(), 0);
  }

  @action
  logout() {
    this.set_as_anon();
    setTimeout(
      () =>
        this.channel.postMessage({
          type: 'logout',
        }),
      0,
    );
    setTimeout(() => siteSocket?.reload(), 0);
  }
}
