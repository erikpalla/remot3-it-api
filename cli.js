// const api = require('./wrapper');

// const username = process.env.W_USER;
// const password = process.env.W_PASS;

// const getLinkToPi = async () => {
//   try {
//     const token = await api.logUser(username, password);
//     const devices = await api.deviceListAll();
//     const uid = devices.filter(device => device.devicealias === 'VNC-pi')[0].deviceaddress;
//     const link = await api.deviceConnect(uid);
//     console.log(link);
//   } catch (error) {
//     console.error(error);
//   }
// };
// getLinkToPi();
