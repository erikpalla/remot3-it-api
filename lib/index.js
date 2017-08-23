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


/**
 * Sign in user into Remot3.it account
 * 
 * @param {string} username - User's Weaved account name 
 * @param {string} password - User's Weaved account password
 * @returns {{ token: string, auth_expiration: number }} - Auth token and time to token expiration 
 */
const logUser = async (username, password) => {
  if (!username || !password) throw new Error(USER_LOGIN_ENDPOINT_MSG_NO_CREDS);

  try {
    const { err, status, body: { token, auth_expiration, reason } } = await api.get(`${USER_LOGIN_ENDPOINT}/${username}/${password}`);
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

/**
 * Retrieves the list of devices registered to loged Weaved account
 * @returns {Object[]} with details about each devices - described in detail 
 * in documentation on http://docs.weaved.com/docs/devicelistall
 */
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

/**
 * Send a server channel command to the daemon associated with this UID. This is independent 
 * from the tcp connection to a listener on the target device. A UDP listener needs to be 
 * written to listen to the port and process the commands.
 * @param {string} uid - Weaved UID of target daemon 
 * @param {string} command - Command to execute on target device/deamon 
 * @returns {string} Confirmation message for sent command
 */
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

/**
 * Returns an IP address of requester/host IP address
 * @returns {string} - IP address
 */

const getHostIP = async () => {
  try {
    const { err, body } = await ip.get();
    if (err) throw err;
    return body;
  } catch (error) {
    throw error;
  }
};

/**
 * Make a proxy connection to the daemon associated with this UID and return object with details
 * 
 * @param {string} uid - Weaved UID of target daemon 
 * @param {boolean} wait - Whether or not to wait until the connection completes
 * @returns {Object.<string>} - connection details described in documentation 
 * on http://docs.weaved.com/docs/deviceconnect
 */
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
