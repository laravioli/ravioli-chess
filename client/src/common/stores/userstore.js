import { observable, action, runInAction } from 'mobx';
import { apiJSON } from 'src/lib/api/json';

export class UserStore {
  @observable accessor username = 'Anonymous';
  @observable accessor logged = false;
  @observable accessor errorLog = undefined;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @action
  setName(username) {
    this.username = username;
  }

  @action
  async login(credential) {
    try {
      await apiJSON.post('login', {
        username: credential.username,
        password: credential.password,
      });
      runInAction(() => {
        this.username = credential.username;
        this.logged = true;
      });
    } catch (error) {
      throw error;
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
      return response.data.detail;
    } catch (error) {
      throw error;
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
    } catch (error) {}
  }

  @action
  async register(credential) {
    try {
      await apiJSON.post('register', {
        username: credential.username,
        password: credential.password,
        email: credential.email,
      });
    } catch (error) {
      throw error;
    }
  }
}
