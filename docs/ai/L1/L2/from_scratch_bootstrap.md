# Scenario Baseline Copy Map

> Read when integrating Hotel Reception Assistant into another application.

## Baseline Rule

This checkout is the 05-hotel-reception scenario derivative of the official Agora Next.js voice quickstart. Read its current source before adapting SDK, token or event behavior. Do not generate a replacement integration from memory.

## Implementation Map

| Need | Source of truth | Guidance |
| --- | --- | --- |
| Setup and env | package.json, env.local.example | [Setup](../01_setup.md) |
| Voice lifecycle | components/LandingPage.tsx, components/ConversationComponent.tsx | [Lifecycle](conversation_lifecycle.md) |
| Scenario prompt and fixtures | scenarios/05-hotel-reception/config.ts and local data | [Public recipe](../../../../RECIPE.md) |
| Agent providers and tools | app/api/invite-agent/route.ts, scenarios/tool-contracts.ts | [Agent configuration](invite_agent_config.md) |
| API and call scope | app/api/scenarios, types/conversation.ts | [Interfaces](../06_interfaces.md) |
| Tokens and renewal | app/api/generate-agora-token/route.ts | [Token model](token_model.md) |
| State and deployment | ARCHITECTURE.md, Dockerfile | [Architecture](../../../../ARCHITECTURE.md) |

## Adaptation Sequence

1. Run the existing scenario using Node.js 22+, pnpm 9.15.9 and the documented .env.local contract.
2. Verify an actual call before declaring speech success; local contracts alone are not runtime evidence.
3. Map token, invite, stop, RTC join, RTM subscription and toolkit events into the target app's existing owners.
4. Preserve StrictMode initialization, hook-owned cleanup, combined token privileges, UID remap and interrupted turns.
5. The invite body contains `requester_id` and `channel_name`.
6. Start with default conversation: Hotel FAQ, room types and dated sample counts enter the prompt at session start. They support discussion of fictional availability without calling a business tool.
7. Add only requested business tools, preserving their exact call scope and confirmation semantics. Availability does not create a booking. No reservation, payment, upgrade, cancellation, callback submission or human transfer is implemented. All inventory is fictional, not a live property-management feed.
8. Run pnpm run verify and the appropriate separate Docker/live acceptance checks.

## See Also

- [Internal recipe](../../RECIPE.md)
- [Workflows](../05_workflows.md)
- [Interfaces](../06_interfaces.md)
