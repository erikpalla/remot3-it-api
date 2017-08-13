require('isomorphic-fetch');

class networkInterface {
  constructor({ baseURL, headers = {}, responseType }) {
    this.baseURL = baseURL;
    this.headers = headers;
    this.responseType = responseType;
  }
  async handleResponse(r) {
    return {
      err: r.ok ? false : new Error(r.statusText),
      status: r.status,
      statusText: r.statusText,
      body: r.status === 404 ? {} : await r[this.responseType](),
    };
  }
  assignHeader(newHeader) {
    this.headers = Object.assign({}, this.headers, newHeader);
  }
  async get(relativeUrl = '/', opts = {}) {
    const config = {
      method: 'GET',
      headers: new Headers(Object.assign({}, this.headers, opts.headers)),
    };
    const specs = new Request(`${this.baseURL}${relativeUrl}`, config);
    try {
      const response = await fetch(specs);
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
  async post(relativeUrl = '/', opts = {}) {
    const config = {
      method: 'POST',
      headers: new Headers(Object.assign({}, this.headers, opts.headers)),
      body: JSON.stringify(opts.body),
    };
    const specs = new Request(`${this.baseURL}${relativeUrl}`, config);
    try {
      const response = await fetch(specs);
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = networkInterface;
