import { TogglEntry } from './TogglEntry.d';
import ical from 'ical-generator';
import http from 'http';
import moment = require('moment');
import { env } from './env'
import axios from 'axios'
import qs from 'querystring'
import fs from 'fs'

const { PORT, TOGGL_API_TOKEN } = env

async function getEntries() {
    const query = {
        start_date: moment().startOf('year').toJSON(),
        end_date: moment().toJSON()
    }

    const url = `https://www.toggl.com/api/v8/time_entries?${qs.stringify(query)}`

    const res = await axios.get(
        url,
        {
            auth: {
                username: TOGGL_API_TOKEN,
                password: 'api_token'
            },
            headers: {
                'content-type': 'application/json'
            }
        }
    )

    return res.data as TogglEntry[]
}

http.createServer(async function (req, res) {
    const cal = ical({
        name: 'Toggl time entries',
        domain: 'kattcorp.com',
    });

    const entries = await getEntries()

    for (const entry of entries) {
        const icon = entry.billable ? '💲' : '❌'
        const durationInHoursRounded = Math.round((entry.duration / 60 / 60) * 10) / 10
        const duration = durationInHoursRounded > 0 ? `${durationInHoursRounded}h` : 'n/a'

        cal.createEvent({
            start: moment(entry.start),
            end: moment(entry.stop),
            summary: `${icon} ${entry.description}\n - ⏳ ${duration}`
        })
    }

    cal.createEvent({
        start: moment(),
        end: moment().add(1, 'hour'),
        summary: 'Example Event 👌',
        description: 'It works!',
        location: 'my room',
        url: 'http://kattcorp.com/'
    });
    cal.serve(res);
}).listen(PORT, '127.0.0.1', function () {
    console.log(`Server running at http://127.0.0.1:${PORT}/`);
});
