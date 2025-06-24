import Cookies from 'js-cookie';

export const apiJSON = {
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
      if (!response.ok) {
        const error = new Error('Post request Failed');
        error.data = data;
        error.status = response.status;
        throw error;
      }
      return { status: response.status, ...data };
    } catch (err) {
      throw err;
    }
  },
};
