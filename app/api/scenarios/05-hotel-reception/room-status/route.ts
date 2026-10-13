import { NextResponse } from 'next/server';
import { lookupRoomAvailability } from '@/scenarios/05-hotel-reception/hotel';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const roomType = searchParams.get('room_type');
  const date = searchParams.get('date');
  if (!roomType || !date) {
    return NextResponse.json(
      { error: 'room_type and date are required' },
      { status: 400 },
    );
  }
  const room = lookupRoomAvailability(roomType, date);
  return room
    ? NextResponse.json({ room, booking_confirmed: false })
    : NextResponse.json({ error: 'room_status_not_found' }, { status: 404 });
}
