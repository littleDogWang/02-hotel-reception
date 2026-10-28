# Hotel Reception Assistant

Answer hotel questions and explain room availability for a requested stay.

A hotel reception voice assistant for a fictional Boston hotel. Guests can ask about policies and facilities, specify a room type and dates, and discuss sample availability across a stay. The recipe includes an editable seven-night rolling inventory and a read-only room-status API.

Read the [eight-part recipe](RECIPE.md) for example conversations and business customization. This independent scenario derives its RTC/RTM lifecycle from the official [Agora Next.js quickstart](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs); its scenario facts and tools live in this repository.

## Prerequisites

- Node.js 22 or newer; pnpm **9.15.9** (`packageManager` in package.json; lockfile format 9).
- Access to this repository and an Agora project with RTC, Signaling and Conversational AI available.
- Browser microphone permission; HTTPS for hosted use.
- Docker with a running engine for container verification. Agora CLI is optional for manual setup and required only for its binding commands.

## Run It

```bash
git clone https://github.com/littleDogWang/02-hotel-reception.git
cd 02-hotel-reception
pnpm install --frozen-lockfile
cp env.local.example .env.local
```

Fill the two required Agora values in `.env.local`, then run `pnpm run doctor` and `pnpm run dev`. Keep an existing env file instead of overwriting it. With a ready Agora CLI, use `agora quickstart env write . --template nextjs --project <your-project> --json` to write template-aware keys for an existing authorized project. Check `agora version` and `agora doctor --json` first; do not create or change a remote project without authorization.

Open [http://localhost:3000](http://localhost:3000) and choose **Talk to hotel reception**. Confirm two-way audio and both transcript speakers with a real call; local checks cannot establish that result.

## Working From A Clone

Run all commands at this repository root. Install the declared pnpm version before using the frozen lockfile; pnpm 8 cannot consume lockfile format 9. On an existing clone, retain `.env.local` and use `pnpm install --frozen-lockfile`, `pnpm run doctor`, then `pnpm run dev`.

Use the scenario-specific entry and persistent identity; starting voice requires a user action.

## Environment Variables

The tracked example is [env.local.example](env.local.example); local Next.js loads `.env.local`. Hosted environments provide the same values through the platform's secret store.

| Variable | Required | Owner / exposure | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_AGORA_APP_ID` | Required | Next.js build and runtime; public | App ID from the selected Agora project; Docker must receive the same value at build and runtime. |
| `NEXT_AGORA_APP_CERTIFICATE` | Required | Next.js server runtime; secret | Signs RTC/RTM credentials and authenticates managed Agent operations; never a build argument. |
| `TOP_TEN_SCENARIO_TOOL_BASE_URL` | Optional | Next.js server; non-secret | This same app's public HTTPS origin. Omit for default conversation; enabling tools requires actual cloud reachability. |

With no valid public HTTPS tool origin, voice uses default conversation mode. A valid-looking URL does not prove that Agora cloud can reach it. Restart/redeploy after changing env and start a new conversation.

Optional BYOK credentials appear only in the invite route's commented provider blocks. They are not needed by default; enabling a block requires supplying its server-only variables and separately verifying the provider.

## Commands

### Setup

`pnpm install --frozen-lockfile`, configure `.env.local`, then `pnpm run doctor`.

### Development

`pnpm run dev` starts Next.js with its local API routes.

### Quality

| Command | Purpose |
| --- | --- |
| `pnpm run doctor` | `node scripts/doctor.mjs` |
| `pnpm run dev` | `next dev --webpack` |
| `pnpm run build` | `next build` |
| `pnpm run start` | `next start` |
| `pnpm run lint` | `eslint .` |
| `pnpm run verify:api` | `node --import tsx scripts/verify-api-contracts.ts` |
| `pnpm run typecheck` | `tsc --noEmit` |
| `pnpm run verify` | Canonical local/CI checks: `pnpm run doctor`, `pnpm run verify:template`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run verify:api`, `pnpm run verify:signal`, `pnpm run verify:inspection`, `pnpm run verify:scenario`, `pnpm run build` |
| `pnpm run verify:signal` | Activity state mapping and measured-audio checks. |
| `pnpm run verify:inspection` | Inspector measurements, bounded history and presentation checks. |
| `pnpm run verify:scenario` | `node --import tsx scripts/verify-scenario.ts` |
| `pnpm run verify:template` | Standard repository paths, identity, documentation links and delivery contracts. |
| `pnpm run verify:docker` | Separate Docker image + startup + scenario-route smoke check (synthetic credentials). |

### CI / Pre-ship

`pnpm run verify` is the canonical local and project-CI entry. It includes every shipped scenario check. Doctor requires a populated local env file; CI uses synthetic credentials and mocked Agora operations. `pnpm run verify:docker` is the separate container check.

## Architecture

A browser joins Agora RTC for audio and RTM for transcript/state/metrics events. Next.js signs short-lived tokens and starts/stops the cloud Agent. Scenario instructions select the actual business behavior.

Local development runs one Next.js process at http://localhost:3000 using `.env.local`. Native production uses `pnpm run build` then `pnpm run start`. Docker runs the same app as non-root UID 1001 on port 3000, without a reverse proxy inside the image. The voice app and read-only inventory route can share a Next.js deployment. The route reads packaged hotel.json on each request. Editing inventory on a writable local server is visible to API calls without restart; changing a hosted bundle requires redeployment. Start a fresh conversation after prompt-data changes.

See [ARCHITECTURE.md](ARCHITECTURE.md) for topology, ownership and deployment details.

## What You Get

- Hotel policy and facility answers from local, versioned data.
- King/twin clarification and exact check-in/check-out collection.
- Rolling America/New_York inventory with minimum-night availability and an explicit distinction between sold out and unknown.

**Default mode:** Hotel FAQ, room types and dated sample counts enter the prompt at session start. They support discussion of fictional availability without calling a business tool.

**Tool mode:** `lookup_room_status` queries one occupied night at a time. Inline counts are omitted; a failed tool result cannot be replaced with fixed prompt inventory.

**Limits:** Availability does not create a booking. No reservation, payment, upgrade, cancellation, callback submission or human transfer is implemented. All inventory is fictional, not a live property-management feed.

## How It Works

| User step | Assistant / app behavior | Result |
| --- | --- | --- |
| Ask about policy or availability | Use hotel FAQ, or clarify room type and exact dates. | A hotel-specific answer and a defined stay. |
| Confirm the stay | Use dated prompt counts by default; in tool mode query every occupied night. | The minimum nightly count, with missing dates treated as unknown. |
| Ask to reserve or speak to staff | Explain the available next step without a booking or handoff claim. | A verbal summary of sample availability only. |

`lookup_room_status` calls `GET /api/scenarios/02-hotel-reception/room-status` with `room_type` and `date`. Direct API clients can instead use `check_in` and `check_out` for a 1–31-night stay. The response identifies `local_fixture` data and keeps `booking_confirmed: false`.

The invite body contains `requester_id` and `channel_name`.

## Repo Map

- `app/api/`: token, invite, stop and scenario HTTP routes.
- `components/`: browser RTC/RTM lifecycle, transcript and scenario presentation.
- `lib/hotel-reception/`: repository-local business data and rules.
- `lib/agent-config.ts`, `lib/agent-tools.ts`: prompt and optional tool assembly.
- `types/`: application, Agent configuration and presentation types.
- `docs/scenario/`: business guide and acceptance cases.
- `scripts/`: doctor, contracts, scenario checks and delivery verification.
- `docs/ai/`: AI loading card, internal recipe, all eight L1 summaries and L2 deep dives.

## Troubleshooting

- **Wrong pnpm / frozen-lockfile error:** install pnpm 9.15.9; do not regenerate the lockfile with pnpm 8.
- **Doctor fails:** check Node, pnpm and the two populated values in `.env.local`.
- **Agent/transcript fails:** inspect token/invite errors, then RTM login. Preserve `RtcTokenBuilder.buildTokenWithRtm`.
- **No business write:** Hotel FAQ, room types and dated sample counts enter the prompt at session start. They support discussion of fictional availability without calling a business tool.
- **Lost result or state:** The voice app and read-only inventory route can share a Next.js deployment. The route reads packaged hotel.json on each request. Editing inventory on a writable local server is visible to API calls without restart; changing a hosted bundle requires redeployment. Start a fresh conversation after prompt-data changes.
- **Docker has no usable client App ID:** rebuild with the correct public App ID and use that same ID at runtime.

## Deployment

Native hosting runs `pnpm run build` and `pnpm run start` on the documented Node runtime. The voice app and read-only inventory route can share a Next.js deployment. The route reads packaged hotel.json on each request. Editing inventory on a writable local server is visible to API calls without restart; changing a hosted bundle requires redeployment. Start a fresh conversation after prompt-data changes. Serve the public origin through HTTPS; configure the optional business-tool origin only for a cloud-reachable deployment.

### Docker

```bash
docker build --build-arg NEXT_PUBLIC_AGORA_APP_ID=YOUR_AGORA_APP_ID -t 02-hotel-reception:local .
docker run --rm -p 3000:3000 --env-file .env.local 02-hotel-reception:local
```

Replace `YOUR_AGORA_APP_ID` with the public App ID used in `.env.local`. Next.js embeds that identifier in the browser bundle, so changing projects requires rebuilding the image. The App Certificate is supplied only at container runtime. A container restart does not preserve process memory. This image does not add a shared state service.

`pnpm run verify:docker` independently builds the image with synthetic credentials, starts an isolated localhost-bound container, checks the home page and a scenario route, then removes only that container. It does not contact Agora or prove a live voice session.

## More Docs

- [AGENTS.md](AGENTS.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [RECIPE.md](RECIPE.md)
- [AI repo card](docs/ai/L0_repo_card.md)
- [Internal recipe contract](docs/ai/RECIPE.md)
- [Scenario guide](docs/scenario/README.md)
- [Acceptance cases](docs/scenario/acceptance.md)

## Security

Use fictional business data. The sample is not a production authentication, authorization or multi-tenant system. Keep certificates, provider keys, local data and local project bindings out of Git, logs and images. Rotate exposed credentials through the owning service and replace the runtime secret. Report security issues privately to security@agora.io; do not post credentials in an issue.

## License

Released under the [MIT License](LICENSE). Preserve upstream copyright and source attribution. See [third-party notices](THIRD_PARTY_NOTICES.md) for UI source and font attribution.
