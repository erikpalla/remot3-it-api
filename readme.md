# JavaScript wrapper for Remot3.it API
- supported platform: node.js (from 6.11.2 if installed from npm)
- using `build` command can be rebuilded for almost every version of node.js

## Instalation
- via npm: `npm i remot3-it-api`
- via github: `cd remot3-it-api && npm run build`  

## Usage:
`const { logUser, deviceListAll, deviceSend, deviceConnect } = require('remot3-it-api');`

## Methods:
### logUser
`logUser(username, password)`
- Sign in user into Remot3.it account
- Initial function as it generate access token for other commands, without this other function will not work
- Params: username, password
- Returns: token, expiration timeout

### deviceListAll
`deviceListAll()`
- Retrieves the list of devices registered to loged Weaved account
- Params: none
- Returns: details about registered devices

### deviceSend
`deviceSend(uid, command)`
- Send a command to registered device
- Params: device uid, command
- Returns: Confirmation message for sent command

### getHostIP
`getHostIP()`
- Return IP address of requester, support function for deviceConnect function
- Params: none
- Returns: IP address

### deviceConnect
`deviceConnect(uid)`
- Connects to device and returns details for direct connection (VPN, SSH)
- Params: device uid
- Returns: connection details

## API docs:
[Documentation for Remot3.it API](http://docs.weaved.com/docs)