const FetchInterface = require('./fetch-interface');
const { expect } = require('chai');
const fetchMock = require('fetch-mock');


describe('FetchInterface', () => {
  const STATUS_INTERNAL_SERVER_ERROR = 'Internal Server Error';
  const STATUS_OK = 'OK';
  const STATUS_NOT_FOUND = 'Not found';
  describe('constructor', () => {
    it('return error if baseURL parameter is missing', () => {
      try {
        new FetchInterface({});
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal('baseURL parameter is missing');
      }
    });
  });
  describe('response handler', () => {
    it('handle response - rejected request', async () => {
      const api = new FetchInterface({ baseURL: 'url', responseType: 'text' });
      const response = {
        ok: false,
        status: 500,
        statusText: STATUS_INTERNAL_SERVER_ERROR,
        text() {
          return new Promise((resolve) => {
            resolve(STATUS_INTERNAL_SERVER_ERROR);
          });
        },
      };
      const expected = {
        err: new Error(STATUS_INTERNAL_SERVER_ERROR),
        status: 500,
        statusText: STATUS_INTERNAL_SERVER_ERROR,
        body: STATUS_INTERNAL_SERVER_ERROR,
      };
      const result = await api.handleResponse(response);
      expect(result.err.message).equal(expected.err.message);
      expect(result.status).equal(expected.status);
      expect(result.statusText).equal(expected.statusText);
      expect(result.body).equal(expected.body);
    });
    it('handle response - status 404', async () => {
      const api = new FetchInterface({ baseURL: 'url' });
      const response = {
        ok: false,
        status: 404,
        statusText: STATUS_NOT_FOUND,
        json() {
          return new Promise((resolve) => {
            resolve(STATUS_NOT_FOUND);
          });
        },
      };
      const expected = {
        err: new Error(STATUS_NOT_FOUND),
        status: 404,
        statusText: STATUS_NOT_FOUND,
        body: {},
      };
      const result = await api.handleResponse(response);
      expect(result.err.message).equal(expected.err.message);
      expect(result.status).equal(expected.status);
      expect(result.statusText).equal(expected.statusText);
      expect(result.body).to.deep.equal(expected.body);
    });
    it('handle response - resolved request', async () => {
      const api = new FetchInterface({ baseURL: 'url' });
      const response = {
        ok: true,
        status: 200,
        statusText: STATUS_OK,
        json() {
          return new Promise((resolve) => {
            resolve({ status: STATUS_OK });
          });
        },
      };
      const expected = {
        err: false,
        status: 200,
        statusText: STATUS_OK,
        body: { status: STATUS_OK },
      };
      const result = await api.handleResponse(response);
      expect(result.err).equal(expected.err);
      expect(result.status).equal(expected.status);
      expect(result.statusText).equal(expected.statusText);
      expect(result.body).to.deep.equal(expected.body);
    });
  });
  describe('headers', () => {
    it('assign headers', () => {
      const api = new FetchInterface({ baseURL: 'url', headers: { header1: 'header1' } });
      api.assignHeaders({ header2: 'header2' });
      expect(api.headers).to.deep.equal({ header1: 'header1', header2: 'header2' });
    });
    it('reset headers', () => {
      const api = new FetchInterface({ baseURL: 'url', headers: { header1: 'header1' } });
      api.assignHeaders({ header2: 'header2' });
      api.resetHeaders();
      expect(api.headers).to.deep.equal({ header1: 'header1' });
    });
  });
  describe('https requests', () => {
    const baseURL = 'https://google.com';
    const api = new FetchInterface({ baseURL });

    it('initiate GET request', async () => {
      const statusMsg = 'Succesful "GET" request';
      fetchMock.get(`${baseURL}${'/'}`, { err: false, status: 200, statusText: 'OK', body: { statusMsg } });
      try {
        const response = await api.get();
        expect(fetchMock.called()).to.be.equal(true);
        expect(response.body.statusMsg).to.be.equal(statusMsg);
        const request = fetchMock.lastCall()[0];
        expect(request.method).to.be.equal('GET');
        expect(request.headers._headers).to.deep.equal({});
        expect(request.url).to.be.equal(`${baseURL}${'/'}`);
      } catch (error) {
        throw error;
      }
    });
    it('initiate POST requests', async () => {
      const statusMsg = 'Succesful "POST" request';
      const data = 'some data here';
      const headers = { 'context-type': ['application/json'] };
      fetchMock.post(`${baseURL}${'/'}`, { err: false, status: 200, statusText: 'OK', body: { statusMsg } });
      try {
        const response = await api.post('/', { body: { data }, headers });
        expect(fetchMock.called()).to.be.equal(true);
        expect(response.body.statusMsg).to.be.equal(statusMsg);
        const request = fetchMock.lastCall()[0];
        expect(request.method).to.be.equal('POST');
        expect(JSON.parse(request.body)).to.deep.equal({ data });
        expect(request.headers._headers).to.deep.equal(headers);
        expect(request.url).to.be.equal(`${baseURL}${'/'}`);
      } catch (error) {
        throw error;
      }
    });
  });
});
