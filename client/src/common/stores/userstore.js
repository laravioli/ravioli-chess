import { observable, action, runInAction } from 'mobx';
import { apiJSON } from 'src/lib/api/json';

export class UserStore {
  @observable accessor username = 'Anonymous';
  @observable accessor logged = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
    window.userstore = this;
  }

  @action
  setName(username) {
    this.username = username;
  }

  @action
  async login(credential) {
    try {
      const response = await apiJSON.post('login', {
        username: credential.username,
        password: credential.password,
      });
      runInAction(() => {
        this.username = credential.username;
        this.logged = true;
      });
      return { logged: true, message: response.data.success };
    } catch (err) {
      if (err.data) return { logged: false, message: err.data.error };
      console.log(err);
    }
  }

  @action
  async logout() {
    try {
      const response = await apiJSON.post('logout', {});
      runInAction(() => {
        this.username = 'Anonymous';
        this.logged = false;
      });
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  @action
  async getSession() {
    try {
      const response = await apiJSON.get('session');
      runInAction(() => {
        this.username = response.data.username;
        this.logged = true;
      });
    } catch (err) {
      console.log(err);
    }
  }

  @action
  async register(credential) {
    try {
      await apiJSON.post('register', {
        username: credential.username,
        password: credential.password,
        email: credential.email,
      });

      return {
        registered: true,
        message: 'account created',
      };
    } catch (err) {
      if (err.data) return { registered: false, message: err.data };
      console.log(err);
    }
  }
}
