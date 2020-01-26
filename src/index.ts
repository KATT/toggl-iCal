import { createClient, TogglProject, TogglEntry } from "./toggl";
import ical from "ical-generator";
import { IncomingMessage, ServerResponse } from "http";
import moment from "moment";
import url from "url";
import querystring from "querystring";

interface TogglEntryWithProject extends TogglEntry {
  project: TogglProject | null
}

async function getData({ token }: { token: string }) {
  const toggl = createClient({ token });

  const loadProjectById = toggl.projectByIdLoaderFactory();

  const entries = await toggl.getEntries({
    start_date: moment()
      .subtract(6, "months")
      .toDate(),
    end_date: moment().toDate(),
  });

  const entriesWithProjects = await Promise.all(
    entries
      .map(async entry => {
        let project: TogglProject | null = null
        if (entry.pid) {
          project = await loadProjectById(entry.pid!);
        }

        return {
          ...entry,
          project,
        };
      }),
  );

  return {
    entries: entriesWithProjects,
  };
}


function createCal({ entries }: { entries: TogglEntryWithProject[] }) {
  const cal = ical({
    name: "Toggl time entries",
    domain: "kattcorp.com",
  });

  for (const entry of entries) {
    const icon = entry.billable ? "💲" : "❌";

    const durationInHoursRounded =
      Math.round((entry.duration / 60 / 60) * 10) / 10;
    const duration =
      durationInHoursRounded > 0 ? `${durationInHoursRounded}h` : "n/a";

    const projectName = entry.project ? entry.project.name : 'n/a'
    let summary = `${icon} ${projectName}`
    if (entry.description) {
      summary += `: ${entry.description}`
    }
    summary += ` - ⏳: ${duration}`
    cal.createEvent({
      start: moment(entry.start),
      end: moment(entry.stop),
      summary,
    });
  }

  return cal;
}


export default async (req: IncomingMessage, res: ServerResponse) => {
  const parts = url.parse(req.url!);
  const { token } = querystring.parse(parts.query || "");

  if (typeof token !== "string") {
    res.writeHead(400);
    res.end('Missing query parameter "token"');
    return;
  }

  const data = await getData({ token })

  if (parts.pathname === '/index.json') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(data, null, 4))
    return
  }

  const cal = createCal(data)

  cal.serve(res);
};
