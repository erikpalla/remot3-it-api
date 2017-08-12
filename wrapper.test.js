const { expect } = require('chai');
const fetchMock = require('fetch-mock');
const { logUser } = require('./wrapper');
const { API_BASE_URL, USER_LOGIN_ENDPOINT } = require('./constants');

describe('Remot3.it API wrapper', () => {
  afterEach(fetchMock.restore);

  describe('logUser', () => {
    it('returns token', async () => {
      const email = 'someuser';
      const password = 'somepass';
      const token = "a1234";

      fetchMock.get(
        `${API_BASE_URL}${USER_LOGIN_ENDPOINT}/${email}/${password}`,
        { err: false, body: { token } }
      );
      const rToken = await logUser(email, password);
      expect(rToken).to.be.equal(token);
    });
  });

  describe('deviceListAll', () => {
    it('return list of devices', () => {

    });
  });
});