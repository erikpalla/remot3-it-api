import 'isomorphic-fetch';

export default class FetchInterface {
  constructor({ baseURL, headers = {}, responseType = 'json' }) {
    if (!baseURL) throw new Error('baseURL parameter is missing');
    this.baseURL = baseURL;
    this.headers = headers;
    this.defaultHeaders = headers;
    this.responseType = responseType;
  }
  async handleResponse(r) {
    let body;
    if (r.status !== 404) {
      try {
        body = await r[this.responseType]();
      } catch (error) {
        throw new Error('Wrongly set parameter responseType. Parsing of response body failed');
      }
    } else {
      body = {};
    }
    return {
      err: r.ok ? false : new Error(r.statusText),
      status: r.status,
      statusText: r.statusText,
      body,
    };
  }
  assignHeaders(newHeaders) {
    this.headers = Object.assign({}, this.headers, newHeaders);
  }
  resetHeaders() {
    this.headers = this.defaultHeaders;
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
