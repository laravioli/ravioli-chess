import Cookies from 'js-cookie';

export const apiJSON = {
  async get(endpoint) {
    try {
      const response = await fetch(`/api/${endpoint}/`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });
      const data = await response.json();
      const message = { ok: response.ok, status: response.status, data: data };
      if (response.ok) return message;
      else throw message;
    } catch (error) {
      throw error;
    }
  },

  async post(endpoint, body) {
    try {
      const response = await fetch(`/api/${endpoint}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': Cookies.get('csrftoken'),
        },
        credentials: 'same-origin',
        body: JSON.stringify(body),
      });
      const data = await response.json();
      const message = { ok: response.ok, status: response.status, data: data };
      if (response.ok) return message;
      else throw message;
    } catch (error) {
      throw error;
    }
  },
};
