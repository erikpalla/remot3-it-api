const FetchInterface = require('./fetch-interface');
const {
  HOST_IP_URL,
  API_BASE_URL,
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

const api = new FetchInterface({
  baseURL: API_BASE_URL,
  headers: {
    apikey: 'WeavedDemoKey\$2015',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  responseType: 'json',
});
const ip = new FetchInterface({
  baseURL: HOST_IP_URL,
  responseType: 'text',
});

const logUser = async (email, password) => {
  if (!email || !password) throw new Error(USER_LOGIN_ENDPOINT_MSG_NO_CREDS);

  try {
    const { err, status, body: { token, auth_expiration, reason } } = await api.get(`${USER_LOGIN_ENDPOINT}/${email}/${password}`);
    if (err) {
      if (status === 400) throw new Error(reason);
      throw err;
    }
    api.assignHeaders({ token });
    return { token, auth_expiration };
  } catch (error) {
    throw error;
  }
};

const deviceListAll = async () => {
  try {
    const { err, body: { status, devices, reason } } = await api.get(DEVICE_LIST_ALL_ENDPOINT);
    if (status === 'false') throw new Error(reason);
    if (err) throw err;

    if (status && devices.length === 0) return DEVICE_LIST_ALL_ENDPOINT_MSG_NO_DEVICES;
    return devices;
  } catch (error) {
    throw error;
  }
};

const deviceSend = async (uid, command) => {
  if (!uid || !command) throw new Error(DEVICE_SEND_ENDPOINT_MSG_NO_UID_OR_CMND);
  try {
    const encodedCommand = new Buffer(command).toString('base64');
    const { err, body: { status } } = await api
      .post(DEVICE_SEND_ENDPOINT, { body: { command: encodedCommand, deviceaddress: uid } });
    if (err) throw err;
    if (status === 'true') {
      return `${command}${DEVICE_SEND_ENDPOINT_MSG_SUCCESS}${uid}`;
    }
    throw new Error(DEVICE_SEND_ENDPOINT_MSG_UNKNOWN_ERROR);
  } catch (error) {
    throw error;
  }
};

const getHostIP = async () => {
  try {
    const { err, body } = await ip.get();
    if (err) throw err;
    return body;
  } catch (error) {
    throw error;
  }
};

const deviceConnect = async (uid, wait = true) => {
  if (!uid) throw new Error(DEVICE_CONNECT_ENDPOINT_MSG_NO_UID);

  try {
    const hostip = await getHostIP();
    const { err, status, body: { status: apiStatus, connection, reason } } = await api
      .post(DEVICE_CONNECT_ENDPOINT,
        { body: { wait, hostip, deviceaddress: uid } },
      );
    if (err) {
      if (status === 403 && apiStatus === 'false') throw new Error(reason);
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
  getHostIP,
  deviceConnect,
};
