## JavaScript wrapper for Remot3.it API
- for enviroments: browser, node.js

[Documentation for Remot3.it API](http://docs.weaved.com/docs)

### Instalation
- via npm `npm i remot3-it-api`
- via github `npm run build`
- tests `npm t`

### Usage:
### logUser
- Sign in user into Remot3.it account
- Params: username, password
- Returns: token, expiration timeout

### deviceListAll
- Retrieves the list of devices registered to loged Weaved account
- Params: none
- Returns: details about registered devices

### deviceSend
- Send a command to registered device
- Params: device uid, command
- Returns: Confirmation message for sent command

### getHostIP
- Return IP address of requester, support function for deviceConnect function
- Params: none
- Returns: IP address

### deviceConnect
- Connects to device and returns details for direct connection (VPN, SSH)
- Params: device uid
- Returns: connection details