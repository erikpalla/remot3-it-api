// const { logUser, deviceListAll, deviceConnect } = require('./wrapper');

// const username = process.env.W_USER;
// const password = process.env.W_PASS;

// const getLinkToPi = async () => {
//   try {
//     const token = await logUser(username, password);
//     const devices = await deviceListAll();
//     const uid = devices.filter(device => device.devicealias === 'VNC-pi')[0].deviceaddress;
//     const link = await deviceConnect(uid);
//     console.log(link);
//   } catch (error) {
//     console.error(error);
//   }
// };
// getLinkToPi();
