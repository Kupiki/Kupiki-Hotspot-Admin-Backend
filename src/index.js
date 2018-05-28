import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
import passport from 'passport';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
let corsServer = 'http://'+ (process.env.CLIENT_HOST || config.client.host)
const clientPort = (process.env.CLIENT_PORT || config.client.port)
corsServer+= (clientPort !== '80' && clientPort !== '')?':'+clientPort:'';
app.use(cors({
	credentials: true,
	origin: corsServer
}));

let socketio = require('socket.io')(app.server, {
  serveClient: true
});
require('./lib/socketio').default(socketio);

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

app.use(passport.initialize({ session: false }));

// connect to db
initializeDb( dbs => {

	// internal middleware
	app.use(middleware({ config, dbs }));

	// api router
	app.use('/api', api({ config, dbs }));

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});

export default app;
