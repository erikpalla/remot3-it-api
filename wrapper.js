require('isomorphic-fetch');
const {
  HOST_IP_URL,
  API_BASE_URL,
  USER_LOGIN_ENDPOINT,
  DEVICE_LIST_ALL_ENDPOINT,
  DEVICE_SEND_ENDPOINT,
  DEVICE_CONNECT_ENDPOINT,
} = require('./constants');

const networkInterface = ({ baseURL, headers = {}, responseType }) => {
  return {
    assignHeader(value) {
      headers = Object.assign({}, headers, value);
    },
    async get(relativeUrl = '/', opts = {}) {
      const config = { method: 'GET', headers: new Headers(Object.assign({}, headers, opts.headers)) }
      const specs = new Request(`${baseURL}${relativeUrl}`, config);
      try {
        const r = await fetch(specs);
        const response = {
          err: r.ok ? false : new Error(r.statusText),
          status: r.status,
          statusText: r.statusText,
          body: {}
        };
        if (r.status === 404) {
          return response;
        } else {
          response.body = await r[responseType]();
          return response;
        }
      } catch (error) {
        throw error;
      }
    },
    async post(relativeUrl = '/', opts = {}) {
      const config = {
        method: 'POST',
        headers: new Headers(Object.assign({}, headers, opts.headers)),
        body: JSON.stringify(opts.body)
      };
      const specs = new Request(`${baseURL}${relativeUrl}`, config);
      try {
        const r = await fetch(specs);
        const response = {
          err: r.ok ? false : new Error(r.statusText),
          status: r.status,
          statusText: r.statusText,
          body: {}
        };
        if (r.status === 404) {
          return response;
        } else {
          response.body = await r[responseType]();
          return response;
        }
      } catch (error) {
        throw error;
      }
    }
  }
}

const api = networkInterface({
  baseURL: API_BASE_URL,
  headers: {
    'apikey': 'WeavedDemoKey\$2015',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  responseType: 'json'
});
const ip = networkInterface({
  baseURL: HOST_IP_URL,
  responseType: 'text'
})

const logUser = async (email, password) => {
  try {
    const { err, status, body: { token, reason } } = await api.get(`${USER_LOGIN_ENDPOINT}/${email}/${password}`);
    if (err) {
      if (status === 400) throw new Error(reason);
      throw err;
    }
    api.assignHeader({ token });
    return token;
  } catch (error) {
    throw error;
  }
}

const deviceListAll = async () => {
  try {
    const { err, body: { status, devices, reason } } = await api.get(DEVICE_LIST_ALL_ENDPOINT)
    if (err) throw err;
    if (!status) throw new Error(reason);
    if (status && devices.length === 0) return 'Succesfully connected to account, but there are not any devices to list';

    return devices;
  } catch (error) {
    throw error;
  }
}

const deviceSend = async (uid, command) => {
  try {
    const { err, body: { status } } = await api
      .post(DEVICE_SEND_ENDPOINT, { body: { command, deviceaddress: uid } });
    if (err) throw err;
    if (status) {
      return `${command} was succesfully performed on device with address - ${uid}`;
    } else {
      throw new Error('Unknown error hapenned');
    }
  } catch (error) {
    throw error;
  }
}

const deviceConnect = async (uid, wait = true) => {
  try {
    const { err: _err, body: hostip } = await ip.get();
    if (_err) throw err;

    const { err, status, body: { connection, reason } } = await api
      .post(DEVICE_CONNECT_ENDPOINT,
      { body: { wait, hostip, deviceaddress: uid } }
      )
    if (err) {
      if (status === 403) throw new Error(reason);
      throw err;
    }
    return connection;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  logUser,
  deviceListAll,
  deviceSend,
  deviceConnect
}