import ical from 'ical-generator';
import http from 'http';
import moment = require('moment');
import { env } from './env'

const { PORT } = env
const cal = ical({domain: 'github.com', name: 'my first iCal'});


// overwrite domain
cal.domain('kattcorp.com');

cal.createEvent({
    start: moment(),
    end: moment().add(1, 'hour'),
    summary: 'Example Event 👌',
    description: 'It works!',
    location: 'my room',
    url: 'http://kattcorp.com/'
});

http.createServer(function(req, res) {
    cal.serve(res);
}).listen(PORT, '127.0.0.1', function() {
    console.log(`Server running at http://127.0.0.1:${PORT}/`);
});
