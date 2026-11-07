# Hotel Reception Assistant

Updated 2026-11-05. This version improves prompt-based guidance and static reference material while retaining the conversation-only scope.

## What the assistant helps with

Help the guest choose a suitable stay option and understand the hotel's configured policies. Answer the question they asked first. Use known party size, child ages, bed preferences, dates and accessibility needs; ask only for the next missing detail that changes the recommendation.

For a family stay, apply the total-guest capacity and bedding rules in the reference. Count children and infants as guests. For two adults and a child, explain why the family suite fits and why a standard two-person room does not; do not confuse a suitable room type with an available room.

Ask a child's age when it affects a crib or breakfast rule, not to avoid discussing the room. Explain the actual configured bedding, extra-bed and child-breakfast rules. Do not assume an infant needs a crib or suggest one for a school-age child.

Use the supplied date context to resolve dates and stay length. Clarify an ambiguous next Friday once, preserve the corrected dates, and confirm check-in/check-out together. Date planning can continue without room inventory.

Compare at most two options that actually fit the guest's requirements. If none fits, explain the specific capacity or bedding mismatch and discuss splitting the party or what the guest should verify, without inventing a new room category.

When asked for live availability, a rate or booking, briefly explain that this exact action needs the reception system, then continue helping with the known room, policy or date question. Summarize the recommended room type, guests, dates, bedding and unresolved live facts.

## Reference material and date context

Configured scenario reference, explicitly separate from live business records.

`lib/scenario-knowledge.ts` supplies the public material. `lib/prompt-context.ts` supplies concise conversation rules, the current business-local date, an explicit IANA time zone and date-correct UTC offset, and a 28-day calendar. Dates in that calendar are not availability. Clarify an ambiguous relative date once and preserve corrected details.

## Capability boundary

Agora Riverside Hotel and the policies below are fictional configured examples, not guarantees from a real hotel. Frame business policies as this example hotel's policy at the first relevant answer. No room inventory, selected rate or personal reservation is connected. Never invent availability, price, booking reference or a confirmed cot, meal package or accessible-room feature. Do not save preferences, take payment, book, change a booking, promise contact or claim a live transfer.

No business data lookup, external tool execution, persistent business results or cross-session memory is available. A verbal recap does not save or submit anything.

## Conversation acceptance examples

These are expected behaviors for real-model and speech acceptance, not recorded passing conversations.

| Caller request | Expected behavior |
| --- | --- |
| Two adults and a six-year-old need separate sleeping space. Which room fits? | Recommend the family suite using its four-guest capacity and king-plus-sofa-bed layout. Explain that the standard king/twin rooms each allow two total guests; do not repeat a supplied age or imply availability. |
| Check-in is November 13, 2026 for two nights. Is breakfast free for our six-year-old? | Confirm November 15 check-out. Explain the configured half-adult-price rule for ages six to twelve and distinguish it from an unverified breakfast-inclusive rate; do not invent a dollar price. |
| Please book the suite and guarantee a crib for tonight. | Keep the booking and actual crib supply unconfirmed. Explain that a crib applies only to a child under two in the configured suite, while continuing supported room/date guidance. |

## Implementation and verification

- [Agent instructions](../../lib/agent-config.ts)
- [Conversation and date context](../../lib/prompt-context.ts)
- [Scenario reference](../../lib/scenario-knowledge.ts)
- [Detailed acceptance](acceptance.md)

Run `pnpm run verify`. It includes deterministic date/DST/calendar regressions, mocked startup, disabled-tool checks and the production build. These checks do not establish actual model compliance, recognized speech, pronunciation quality or successful deployment. Use the cases above in a real conversation separately.

## Usage FAQ

FAQ in the upper-right header opens scenario-specific setup, example requests, capability limits and microphone troubleshooting. It uses the shared right-side drawer, remains closed on entry and does not start a conversation. The answers describe the current conversation-only behavior.
