# Helmlore AIS relay

The GitHub Pages chart cannot run the persistent upstream connection. This separate Node service holds AISStream's key in an environment variable and serves only normalised target data to the chart. No live feed is enabled until a deployed URL is configured.

## Setup

1. Create an AISStream account at https://aisstream.io/account using GitHub. Create a key privately. Do not paste it into chat or commit it.
2. Deploy this directory as a Node web service. A Render blueprint is provided at `services/ais-relay/render.yaml`; create a Blueprint pointing at this repository and this blueprint path. It selects the Free plan, intended only for testing. Free instances sleep after inactivity and must reconnect/repopulate targets when waking; verify the current plan terms before deployment.
3. Set `AISSTREAM_API_KEY` in the hosting service's secret environment field. Optional `AIS_BOUNDS` is south,west,north,east (default Irish Sea). The same server limits subscriptions to one area and shares its cache across clients.
4. After deployment, verify `/health` is connected and `/v1/targets?bbox=54,-5,55,-3` responds with timestamps and target data.
5. Put the relay's public HTTPS origin in `js/navigation/ais-config.js` and publish that config file. Only the URL belongs there, never a key.

## Run locally

Node 22 or newer. `npm ci`, set `AISSTREAM_API_KEY` through your environment, then `npm start`. Do not put the key in a shell command that enters shared logs. `npm test` needs no key or network.

## Behaviour and limits

- Position reports support Class A and Class B; unavailable AIS speed/course/heading sentinels become null.
- Names are text, never injected HTML. No raw upstream messages or credentials reach clients.
- A single compressed WSS connection filters reports to the configured area. Reconnects use exponential backoff and jitter.
- Positions expire after 15 minutes. Frontend fades them after five minutes and shows whether age is upstream-reported or relay-reception age. Never implies complete coverage.
- In-memory cache only; no historical replay or durable tracks. New service startup needs new reports.
- Endpoint uses an origin allowlist, limited bbox size, per-socket-IP rate limit and a 3,000-target response cap. It is a public read-only data endpoint, not a private authenticated service. Origin checks do not substitute for authentication. Review provider redistribution terms and hosting traffic limits before a public launch.
- Internet AIS is supplementary, not collision avoidance. No CPA/TCPA alarms are implemented.
