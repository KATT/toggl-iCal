Toggl iCal
---


1. `npm i -g now`
1. Setup an `.env`-file
2. `now dev` (will complain what env vars are missing)
3. Open Calendar
4. `File` -> `New Calendar Subscription`
5. Paste `http://127.0.0.1:3000/`


🎉 Now you can view the last six month's Toggl entries.


## Deploy

1. `now secrets add toggl-api-token xxxxxx`
2. `now`
