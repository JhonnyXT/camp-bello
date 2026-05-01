require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const Server = require('./models/server');

const server = new Server();

server.listen();