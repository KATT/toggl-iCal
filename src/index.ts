import { createClient } from './toggl';
import ical from 'ical-generator';
import { IncomingMessage, ServerResponse } from 'http';
import moment from 'moment';
import { env } from './env'

async function getCal() {
	const toggl = createClient({ token: env.TOGGL_API_TOKEN })

	const loadProjectById = toggl.projectByIdLoaderFactory()

	const cal = ical({
		name: 'Toggl time entries',
		domain: 'kattcorp.com',
	});

	const entries = await toggl.getEntries({
		start_date: moment().subtract(6, 'months').toDate(),
		end_date: moment().toDate()
	})

	const entriesWithProjects = await Promise.all(
		entries.map(async (entry) => {
			const project = await loadProjectById(entry.pid)

			return {
				...entry,
				project,
			}
		})
	)

	for (const entry of entriesWithProjects) {
		const icon = entry.billable ? '💲' : '❌'

		const durationInHoursRounded = Math.round((entry.duration / 60 / 60) * 10) / 10
		const duration = durationInHoursRounded > 0 ? `${durationInHoursRounded}h` : 'n/a'

		cal.createEvent({
			start: moment(entry.start),
			end: moment(entry.stop),
			summary: `${icon} ${entry.project.name}: ${entry.description} - ${duration} ⏳`
		})
	}

	return cal
}

export default async (_req: IncomingMessage, res: ServerResponse) => {
	const cal = await getCal()

	cal.serve(res)
};
