const NetworkInterface = require('./network-interface');
const {
  HOST_IP_URL,
  API_BASE_URL,
  USER_LOGIN_ENDPOINT,
  DEVICE_LIST_ALL_ENDPOINT,
  DEVICE_SEND_ENDPOINT,
  DEVICE_CONNECT_ENDPOINT,
} = require('./constants');

const api = new NetworkInterface({
  baseURL: API_BASE_URL,
  headers: {
    apikey: 'WeavedDemoKey\$2015',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  responseType: 'json',
});
const ip = new NetworkInterface({
  baseURL: HOST_IP_URL,
  responseType: 'text',
});

const logUser = async (email, password) => {
  if (!email || !password) throw new Error('The username or password are missing');

  try {
    const { err, status, body: { token, auth_expiration, reason } } = await api.get(`${USER_LOGIN_ENDPOINT}/${email}/${password}`);
    if (err) {
      if (status === 400) throw new Error(reason);
      throw err;
    }
    api.assignHeader({ token });
    return { token, auth_expiration };
  } catch (error) {
    throw error;
  }
};

const deviceListAll = async () => {
  try {
    const { err, body: { status, devices, reason } } = await api.get(DEVICE_LIST_ALL_ENDPOINT);
    if (err) throw err;
    if (!status) throw new Error(reason);
    if (status && devices.length === 0) return 'Succesfully connected to account, but there are not any devices to list';

    return devices;
  } catch (error) {
    throw error;
  }
};

const deviceSend = async (uid, command) => {
  try {
    const { err, body: { status } } = await api
      .post(DEVICE_SEND_ENDPOINT, { body: { command, deviceaddress: uid } });
    if (err) throw err;
    if (status) {
      return `${command} was succesfully performed on device with address - ${uid}`;
    }
    throw new Error('Unknown error hapenned');
  } catch (error) {
    throw error;
  }
};

const deviceConnect = async (uid, wait = true) => {
  try {
    const { err: _err, body: hostip } = await ip.get();
    if (_err) throw _err;

    const { err, status, body: { connection, reason } } = await api
      .post(DEVICE_CONNECT_ENDPOINT,
      { body: { wait, hostip, deviceaddress: uid } },
    );
    if (err) {
      if (status === 403) throw new Error(reason);
      throw err;
    }
    return connection;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  logUser,
  deviceListAll,
  deviceSend,
  deviceConnect,
};
