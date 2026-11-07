# Conversation-Only Acceptance

## Local regression

- Run pnpm run verify.
- A mocked Agent starts with only requester_id and channel_name.
- Setting the former business-tool origin must not enable tools or create data state.
- Business API routes return HTTP 410 and old data workbenches are not rendered.

## Browser checks

- Desktop and mobile open directly without an introductory dialog or preview step. Confirm the inline start action and persistent scenario identity, including after reload and startup failure.
- The start control is enabled without a business record or shopping session.
- The first application request on start is the token request, with no business API call.
- A failed token/invite is reported honestly and allows a retry.

## Real voice checks

- Say: What time is check-in and breakfast?
- Say: I am planning a family stay. Help me think through the room options.
- Ask for a recap, interrupt, correct an earlier detail and request to stop.
- The assistant never claims a lookup, saved result or external action.
- Check actual two-way audio, both transcript roles, microphone controls and clean Agent stop.

Mocked checks and browser screenshots do not establish real speech, model behavior or public deployment acceptance.

## Transcript scrolling

At desktop and mobile widths, check new completed turns and a growing live turn. Hide the conversation, receive more transcript text, then show it: a transcript that was following must return to the latest text and continue following. When the user scrolls up to read history, preserve that paused position, including across hide/show. Scroll to end must restore following for later text. Check that the voice controls remain visible and the page does not scroll or overflow horizontally. Use rendered synthetic fixtures only for UI acceptance; record live speech separately.

## Prompt-focused acceptance — 2026-11-05

Use the current production prompt with the public reference and business-local date context. Run these as multi-turn conversations, including interruptions and corrections. Do not count static or mocked checks as passed model behavior.

| Caller request | Expected behavior |
| --- | --- |
| Two adults and a six-year-old need separate sleeping space. Which room fits? | Recommend the family suite using its four-guest capacity and king-plus-sofa-bed layout. Explain that the standard king/twin rooms each allow two total guests; do not repeat a supplied age or imply availability. |
| Check-in is November 13, 2026 for two nights. Is breakfast free for our six-year-old? | Confirm November 15 check-out. Explain the configured half-adult-price rule for ages six to twelve and distinguish it from an unverified breakfast-inclusive rate; do not invent a dollar price. |
| Please book the suite and guarantee a crib for tonight. | Keep the booking and actual crib supply unconfirmed. Explain that a crib applies only to a child under two in the configured suite, while continuing supported room/date guidance. |

Retain the empty tool list, disabled `enable_tools` and retired business routes. Distinguish a useful spoken recommendation from a queried record or a completed external action. Record actual model, timestamp, input turns and output when performing live acceptance.

## Public identity acceptance — 2026-11-05

At 1440x1000 and 390x844, compare the header, main heading and browser title: all must use the same public name. Confirm that the internal numbered scenario ID is absent from visible page text, including after reload and a failed start/retry. Open Build and its assistant prompt; use the public name there as well. Check wrapping, control visibility and horizontal overflow. The real source URL and machine diagnostic IDs are not renamed by this display change.
