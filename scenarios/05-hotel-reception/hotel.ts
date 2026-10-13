import hotelData from './hotel.json';

export interface RoomAvailability {
  roomType: string;
  date: string;
  available: number;
}

export function lookupRoomAvailability(
  roomType: string,
  date: string,
): RoomAvailability | null {
  return (
    (hotelData.rooms as RoomAvailability[]).find(
      (room) => room.roomType === roomType.trim().toLowerCase() && room.date === date,
    ) ?? null
  );
}

export function formatHotelFaqForPrompt(): string {
  return hotelData.faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n');
}

export const HOTEL_FIXTURE_VERSION = hotelData.version;
