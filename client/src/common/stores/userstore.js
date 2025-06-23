import { observable, action } from 'mobx';
import Cookies from 'js-cookie';

export class UserStore {
  @observable accessor username = 'Anonymous';

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
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': Cookies.get('csrftoken'),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: credential.username,
          password: credential.password,
        }),
      });

      const data = await response.data;
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }
}
