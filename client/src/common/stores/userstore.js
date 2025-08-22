import { observable, action, runInAction } from "mobx";
import { apiJSON } from "src/lib/api/json";
import { siteSocket } from "src/lib/socket/socket";

export class UserStore {
  @observable accessor username = "Anonymous";
  @observable accessor logged = false;

  constructor() {
    this.syncTab();
  }

  syncTab() {
    this.channel = new BroadcastChannel("syncTab");
    this.channel.onmessage = (event) => {
      const data = event.data;
      if (data.type === "login") {
        runInAction(() => {
          this.logged = true;
          this.username = data.username;
        });
      }
      if (data.type == "logout") {
        runInAction(() => {
          this.logged = false;
          this.username = "Anonymous";
        });
      }
      siteSocket.reload();
    };
  }

  @action
  setName(username) {
    this.username = username;
  }

  @action
  async login(credential) {
    try {
      await apiJSON.post("login", {
        username: credential.username,
        password: credential.password,
      });
      runInAction(() => {
        this.username = credential.username;
        this.logged = true;
      });
      setTimeout(
        () =>
          this.channel.postMessage({
            type: "login",
            username: this.username,
          }),
        0
      );
      setTimeout(() => siteSocket.reload(), 0);
    } catch (error) {
      throw error;
    }
  }

  @action
  async logout() {
    try {
      const response = await apiJSON.post("logout", {});
      runInAction(() => {
        this.username = "Anonymous";
        this.logged = false;
      });
      setTimeout(
        () =>
          this.channel.postMessage({
            type: "logout",
          }),
        0
      );
      setTimeout(() => siteSocket.reload(), 0);
      return response.data.detail;
    } catch (error) {
      throw error;
    }
  }

  @action
  async register(credential) {
    try {
      await apiJSON.post("register", {
        username: credential.username,
        password: credential.password,
        email: credential.email,
      });
    } catch (error) {
      throw error;
    }
  }
}
