import type { ScenarioConfig } from '../types';
import { formatHotelFaqForPrompt, HOTEL_FIXTURE_VERSION } from './hotel';

export const config: ScenarioConfig = {
  id: '05-hotel-reception',
  title: 'Hotel reception',
  role: 'a friendly hotel reception agent.',
  workflow: 'Answer verified hotel policy and facility questions briefly. For room availability, collect dates and room requirements, use the configured room-status tool when available, and offer a human request when the tool is unavailable.',
  guardrails: 'Never promise a room, rate, booking, payment, upgrade, or cancellation without a confirmed system result. Keep static policy answers separate from live availability and reservation actions.',
  greeting: 'Welcome. How can I help with your stay?',
  fixtureSummary: `Hotel fixture version ${HOTEL_FIXTURE_VERSION}. Verified FAQ:\n${formatHotelFaqForPrompt()}\nRoom status requires the room-status tool; availability is not a booking.`,
};
