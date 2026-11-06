export interface Booking {
  start: number;
  end: number;
}

export interface Room {
  id: string;
  name: string;
  blocked: boolean;
  blockReason?: string;
  bookings: Booking[];
}

// Fictional data, kept in one place. Times are integer minutes after midnight.
export const ROOMS: Room[] = [
  {
    id: 'a-101',
    name: 'A-101',
    blocked: false,
    bookings: [
      { start: 600, end: 660 },
      { start: 900, end: 960 },
    ],
  },
  {
    id: 'b-202',
    name: 'B-202',
    blocked: true,
    blockReason: 'Closed for maintenance until further notice.',
    bookings: [],
  },
  {
    id: 'c-303',
    name: 'C-303',
    blocked: false,
    bookings: [],
  },
];
