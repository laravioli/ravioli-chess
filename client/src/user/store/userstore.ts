import { observable, action, runInAction } from 'mobx';
import { siteSocket } from 'src/lib/socket/socket';
import type { UserOpts, Credential } from './interface';

const ANON = 'Anonymous';

export class UserStore {
  @observable accessor username: string;
  @observable accessor logged: boolean;

  channel: BroadcastChannel;

  constructor(opts: UserOpts) {
    runInAction(() => {
      if (opts.is_auth) {
        this.username = opts.username;
        this.logged = true;
      } else {
        this.username = ANON;
        this.logged = false;
      }
    });
    this.subscribeTab();
  }

  subscribeTab() {
    this.channel = new BroadcastChannel('syncTab');
    this.channel.onmessage = event => {
      const data = event.data;
      if (data.type === 'login') {
        runInAction(() => {
          this.logged = true;
          this.username = data.username;
        });
      }
      if (data.type == 'logout') {
        runInAction(() => {
          this.logged = false;
          this.username = ANON;
        });
      }
      siteSocket?.reload();
    };
  }

  @action
  setName(username: string) {
    this.username = username;
  }

  @action
  login(credential: Credential) {
    this.username = credential.username;
    this.logged = true;
    setTimeout(
      () =>
        this.channel.postMessage({
          type: 'login',
          username: this.username,
        }),
      0,
    );
    setTimeout(() => siteSocket?.reload(), 0);
  }

  @action
  logout() {
    this.username = ANON;
    this.logged = false;

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
