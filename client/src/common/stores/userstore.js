import { observable, action, runInAction } from 'mobx';
import { apiJSON } from 'src/lib/api/json';

export class UserStore {
  @observable accessor username = 'Anonymous';

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
      this.setName(credential.username);
      return { logged: true, message: response.data.success };
    } catch (err) {
      if (err.data) return { logged: false, message: err.data.error };
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
