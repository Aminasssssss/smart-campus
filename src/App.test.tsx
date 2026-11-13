// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '@/App';

afterEach(() => cleanup());

describe('App UI integration', () => {
  it('F4: typing 50 attendees shows the empty state and disables Check', () => {
    render(<App />);
    // The Attendees input has default value "1".
    fireEvent.change(screen.getByDisplayValue('1'), {
      target: { value: '50' },
    });
    expect(screen.getByText('No rooms match your filters.')).toBeDefined();
    const checkButton = screen.getByRole('button', {
      name: 'Check availability',
    }) as HTMLButtonElement;
    expect(checkButton.disabled).toBe(true);
  });

  it('F1/F2: 25 attendees + projector shows only A-101 and D-404', () => {
    render(<App />);
    fireEvent.change(screen.getByDisplayValue('1'), {
      target: { value: '25' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'projector' }));
    expect(screen.getByText('A-101')).toBeDefined();
    expect(screen.getByText('D-404')).toBeDefined();
    expect(screen.queryByText('B-202')).toBeNull();
    expect(screen.queryByText('C-303')).toBeNull();
  });

  it('F5: re-checks when the selected room changes', async () => {
    render(<App />);
    // Times: now 480 (default), start 720, end 780.
    fireEvent.change(screen.getByDisplayValue('700'), {
      target: { value: '720' },
    });
    fireEvent.change(screen.getByDisplayValue('760'), {
      target: { value: '780' },
    });
    // Check on A-101 (default selected room) — 720-780 does not overlap its bookings.
    fireEvent.click(
      screen.getByRole('button', { name: 'Check availability' })
    );
    expect(await screen.findByText('Available')).toBeDefined();
    // Click D-404 room card; F5 auto re-checks with the same times.
    // D-404 has a booking 720-780, so the overlap is detected.
    fireEvent.click(screen.getByRole('button', { name: /D-404/ }));
    expect(await screen.findByText('Unavailable')).toBeDefined();
    expect(
      await screen.findByText(
        'Overlaps with an existing booking from 720 to 780.'
      )
    ).toBeDefined();
  });

  it('F5: moves to A-101 and re-checks when C-303 is filtered out', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /C-303/ }));
    fireEvent.change(screen.getByDisplayValue('700'), {
      target: { value: '600' },
    });
    fireEvent.change(screen.getByDisplayValue('760'), {
      target: { value: '660' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
    expect(await screen.findByText('Available')).toBeDefined();
    fireEvent.change(screen.getByDisplayValue('1'), {
      target: { value: '25' },
    });
    expect(screen.queryByText('C-303')).toBeNull();
    expect(await screen.findByText('Unavailable')).toBeDefined();
    expect(screen.getByText('Existing bookings for A-101')).toBeDefined();
    expect(
      screen.getByText('Overlaps with an existing booking from 600 to 660.')
    ).toBeDefined();
  });
});
