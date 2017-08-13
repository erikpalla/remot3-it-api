const { expect } = require('chai');
const fetchMock = require('fetch-mock');
const { logUser } = require('./wrapper');
const { API_BASE_URL, USER_LOGIN_ENDPOINT } = require('./constants');

describe('Remot3.it API wrapper', () => {
  afterEach(fetchMock.restore);

  describe('logUser', () => {
    const email = 'someuser';
    const password = 'somepass';
    const mock = response => fetchMock.get(
      `${API_BASE_URL}${USER_LOGIN_ENDPOINT}/${email}/${password}`,
      response,
    );
    it('return error if username or password are missing', async () => {
      const errorMsgMissingDetails = 'The username or password are missing';
      try {
        await logUser();
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(errorMsgMissingDetails);
      }
    });
    it('returns error if status code is 400 (API returns own message)', async () => {
      const reason = '[0102] The username or password are invalid';
      mock({ err: true, status: 400, body: { reason } });
      try {
        await logUser(email, password);
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(reason);
      }
    });
    it('returns error if there is problem with network/server', async () => {
      const intervalServerError = 'Internal Server Error';
      mock({ err: true, status: 500, body: {} });

      try {
        await logUser(email, password);
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(intervalServerError);
      }
    });
    it('returns token and unix stamp of token expiration', async () => {
      const token = 'a1234';
      const authExpiration = 12315464;

      mock({ err: false, body: { token, auth_expiration: authExpiration } });
      try {
        const r = await logUser(email, password);
        expect(r.token).to.be.equal(token);
        expect(r.auth_expiration).to.be.equal(authExpiration);
      } catch (error) {
        throw error;
      }
    });
  });

  describe('deviceListAll', () => {
    it('return list of devices', () => {

    });
  });
});
