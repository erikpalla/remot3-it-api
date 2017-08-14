const { expect } = require('chai');
const fetchMock = require('fetch-mock');
const { logUser, deviceListAll, deviceSend, getHostIP, deviceConnect } = require('./wrapper');
const {
  API_BASE_URL,
  HOST_IP_URL,
  USER_LOGIN_ENDPOINT,
  USER_LOGIN_ENDPOINT_MSG_NO_CREDS,
  DEVICE_LIST_ALL_ENDPOINT,
  DEVICE_LIST_ALL_ENDPOINT_MSG_NO_DEVICES,
  DEVICE_SEND_ENDPOINT,
  DEVICE_SEND_ENDPOINT_MSG_SUCCESS,
  DEVICE_SEND_ENDPOINT_MSG_UNKNOWN_ERROR,
  DEVICE_SEND_ENDPOINT_MSG_NO_UID_OR_CMND,
  DEVICE_CONNECT_ENDPOINT,
  DEVICE_CONNECT_ENDPOINT_MSG_NO_UID,
} = require('./constants');


describe('Remot3.it API wrapper', () => {
  const intervalServerError = 'Internal Server Error';
  afterEach(fetchMock.restore);

  describe('logUser', () => {
    const email = 'someuser';
    const password = 'somepass';
    const mock = response => fetchMock.get(
      `${API_BASE_URL}${USER_LOGIN_ENDPOINT}/${email}/${password}`,
      response,
    );
    it('return error if username or password are missing', async () => {
      try {
        await logUser();
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(USER_LOGIN_ENDPOINT_MSG_NO_CREDS);
      }
    });
    it('return error if status code is 400 (API returns own message)', async () => {
      const reason = '[0102] The username or password are invalid';
      mock({ err: true, status: 400, body: { reason } });
      try {
        await logUser(email, password);
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(reason);
      }
    });
    it('return error if there is problem with network/server', async () => {
      mock({ err: true, status: 500, body: {} });

      try {
        await logUser(email, password);
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(intervalServerError);
      }
    });
    it('return token and unix stamp of token expiration', async () => {
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
    const mock = response => fetchMock.get(
      `${API_BASE_URL}${DEVICE_LIST_ALL_ENDPOINT}`,
      response,
    );
    it('return error if status code is 401 (API returns own message)', async () => {
      const body = {
        status: 'false',
        reason: 'missing api token',
      };

      mock({ status: 400, body });
      try {
        await deviceListAll();
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(body.reason);
      }
    });
    it('return error if there is problem with network/server', async () => {
      mock({ err: true, status: 500, body: {} });
      try {
        await deviceListAll();
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(intervalServerError);
      }
    });
    it('return message if list of devices is empty', async () => {
      const body = {
        status: 'true',
        devices: [],
      };

      mock({ status: 200, body });
      try {
        const response = await deviceListAll();
        expect(response).to.equal(DEVICE_LIST_ALL_ENDPOINT_MSG_NO_DEVICES);
      } catch (error) {
        throw error;
      }
    });
    it('return list of devices', async () => {
      const body = {
        status: 'true',
        devices: [
          {
            deviceaddress: '80:00:00:05:46:00:3C:07',
            devicealias: 'Shared Raspberry Pi2 ssh22',
            ownerusername: 'myfriend@example.com',
            devicetype: '00:1C:00:00:00:01:00:00:04:30:00:16',
            devicestate: 'active',
            devicelastip: '75.51.xx.xx',
            lastinternalip: '10.0.xx.xx',
            servicetitle: 'SSH',
            webenabled: '1',
            weburi: '/ssh/index.php',
            localurl: 'bm9uZQ==',
            webviewerurl: [
              null,
            ],
          },
          {
            deviceaddress: '80:00:00:05:xx:xx:xx:xx',
            devicealias: 'Freescale i.MX6 vnc',
            ownerusername: 'myname@example.com',
            devicetype: '00:04:00:00:00:01:00:00:04:30:17:0D',
            devicestate: 'active',
            devicelastip: '76.103.xx.xx',
            lastinternalip: '192.168.xx.xx',
            servicetitle: 'VNC',
            webenabled: '1',
            weburi: [
              null,
            ],
            localurl: 'bm9uZQ==',
            webviewerurl: [
              null,
            ],
          },
        ],
      };

      mock({ status: 200, body });
      try {
        const response = await deviceListAll();
        expect(response).to.deep.equal(body.devices);
      } catch (error) {
        throw error;
      }
    });
  });

  describe('deviceSend', () => {
    const mock = response => fetchMock.post(
      `${API_BASE_URL}${DEVICE_SEND_ENDPOINT}`,
      response,
    );
    const uid = '20:00:00:0:012:05:00:FA';
    const command = 'reboot';
    it('return error if uid or command are missing', async () => {
      try {
        await deviceSend();
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(DEVICE_SEND_ENDPOINT_MSG_NO_UID_OR_CMND);
      }
    });
    it('return error if there is problem with network/server', async () => {
      mock({ err: true, status: 500, body: {} });

      try {
        await deviceSend(uid, command);
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(intervalServerError);
      }
    });
    it('return error if command succesfully send, but API refuse to accept command', async () => {
      mock({ err: false, status: 200, body: { status: 'false' } });

      try {
        await deviceSend(uid, command);
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(DEVICE_SEND_ENDPOINT_MSG_UNKNOWN_ERROR);
      }
    });
    it('send command as base64 string in body of request', async () => {
      const encodedCommand = new Buffer(command).toString('base64');
      mock({ status: 200, body: { status: 'true' } });
      try {
        await deviceSend(uid, command);
        const { command: resCommand, deviceaddress: resUid } = JSON.parse(fetchMock.lastCall()[0].body);
        expect(resCommand).to.be.equal(encodedCommand);
        expect(resUid).to.be.equal(uid);
      } catch (error) {
        throw error;
      }
    });
    it('return message if command was succesful', async () => {
      mock({ status: 200, body: { status: 'true' } });
      try {
        const response = await deviceSend(uid, command);
        expect(response).to.be.equal(`${command}${DEVICE_SEND_ENDPOINT_MSG_SUCCESS}${uid}`);
      } catch (error) {
        throw error;
      }
    });
  });
  describe('getHostIP', () => {
    const mock = response => fetchMock.get(`${HOST_IP_URL}/`, response);
    it('return error if there is problem with network/server', async () => {
      mock({ status: 500, body: {} });
      try {
        await getHostIP();
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(intervalServerError);
      }
    });
    it('return IP address', async () => {
      const ip = '12.34.567.89';
      mock({ status: 200, body: ip });
      try {
        const response = await getHostIP();
        expect(response).to.be.equal(ip);
      } catch (error) {
        throw error;
      }
    });
  });
  describe('deviceConnect', () => {
    const ip = '12.34.567.89';
    beforeEach(() => fetchMock.get(`${HOST_IP_URL}/`, { status: 200, body: ip }));
    const uid = '20:00:00:0:012:05:00:FA';
    const mock = response => fetchMock.post(
      `${API_BASE_URL}${DEVICE_CONNECT_ENDPOINT}`,
      response,
    );
    it('return error if uid is missing', async () => {
      try {
        await deviceConnect();
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(DEVICE_CONNECT_ENDPOINT_MSG_NO_UID);
      }
    });
    it('return error if there is problem with network/server', async () => {
      mock({ status: 500, body: {} });
      try {
        await deviceConnect(uid);
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(intervalServerError);
      }
    });
    it('return error if status code is 403 (API returns own message)', async () => {
      const body = {
        status: 'false',
        reason: '[0405] 80:00:00:05:46:00:74:E1 is not available for public access and is not shared with you.',
      };
      mock({
        status: 403,
        body,
      });
      try {
        await deviceConnect(uid);
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.be.equal(body.reason);
      }
    });
    it('send wait, hostip, deviceaddress in body of request', async () => {
      mock({ status: 200, body: {} });
      try {
        await deviceConnect(uid);
        const { wait, hostip, deviceaddress } = JSON.parse(fetchMock.lastCall()[0].body);
        expect(wait).to.be.equal(true);
        expect(hostip).to.be.equal(ip);
        expect(deviceaddress).to.be.equal(uid);
      } catch (error) {
        throw error;
      }
    });
    it('return connection details', async () => {
      const body = {
        status: 'true',
        connection: {
          deviceaddress: '80:00:00:05:46:00:74:E6',
          expirationsec: '1790',
          imageintervalms: '1000',
          proxy: 'http://proxy4.yoics.net:31067',
          requested: '12/16/2015T7:41 PM',
          status: 'http://proxy4.yoics.net:31067',
          streamscheme: [
            null,
          ],
          streamuri: [
            null,
          ],
          url: [
            null,
          ],
        },
      };
      mock({ status: 200, body });
      try {
        const response = await deviceConnect(uid);
        expect(response).to.deep.equal(body.connection);
      } catch (error) {
        throw error;
      }
    });
  });
});
