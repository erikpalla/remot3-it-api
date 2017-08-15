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
  describe('handleResponse', () => {
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
  describe('assignHeader', () => {
    it('assign header', () => {
      const api = new FetchInterface({ baseURL: 'url', headers: { header1: 'header1' } });
      api.assignHeader({ header2: 'header2' });
      expect(api.headers).to.deep.equal({ header1: 'header1', header2: 'header2' });
    });
  });
  // it('initiate "GET" call', () => {

  // });
  // it('initiate "POST" call', () => {

  // });
});
