import { observable, action } from 'mobx';
import { apiJSON } from 'src/lib/api/json';

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
      const response = await apiJSON.post('login', {
        username: credential.username,
        password: credential.password,
      });
      return response;
    } catch (err) {
      if (err.status) return err;
      console.log(err);
    }
  }

  @action
  async register(credential) {
    try {
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': Cookies.get('csrftoken'),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: credential.username,
          password: credential.password,
          email: credential.email,
        }),
      });

      const data = await response.json();
      return { ok: response.ok, ...data };
    } catch (err) {
      console.log(err);
    }
  }
}
