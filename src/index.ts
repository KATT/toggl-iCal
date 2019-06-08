import { TogglEntry } from './TogglEntry';
import ical from 'ical-generator';
import { IncomingMessage, ServerResponse } from 'http';
import moment from 'moment';
import { env } from './env'
import axios from 'axios'
import qs from 'querystring'

const { TOGGL_API_TOKEN } = env

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
        }
    )

    return res.data as TogglEntry[]
}

async function getCal() {
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
            summary: `${icon} ${entry.description} - ⏳ ${duration}`
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

    return cal
}


export default async (_req: IncomingMessage, res: ServerResponse) => {
    const cal = await getCal()

    cal.serve(res)
};
