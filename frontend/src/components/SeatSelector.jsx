export default function SeatSelector({ seats, bookedSeats = [], selectedSeats = [], onSeatToggle }) {
  if (!seats || seats.length === 0) return <p className="text-gray-400 text-center py-4">No seat data available</p>;

  const rows = [...new Set(seats.map((s) => s.row))].sort((a, b) => a - b);
  const cols = [...new Set(seats.map((s) => s.column))].sort((a, b) => a - b);

  const getSeatByPos = (row, col) => seats.find((s) => s.row === row && s.column === col);

  const getSeatClass = (seat) => {
    if (!seat) return '';
    if (bookedSeats.includes(seat.seatNumber)) return 'seat-booked';
    if (selectedSeats.includes(seat.seatNumber)) return 'seat-selected';
    return 'seat-available';
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex justify-center mb-6">
        <div className="bg-gray-300 rounded-t-full w-20 h-10 flex items-center justify-center text-xs text-gray-600 font-medium">
          Driver
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {rows.map((row) => (
            <div key={row} className="flex gap-2 mb-2 items-center justify-center">
              <span className="text-xs text-gray-400 w-5 text-right">{row}</span>
              {cols.map((col) => {
                const seat = getSeatByPos(row, col);
                const isAisle = col === Math.ceil(cols.length / 2);
                return (
                  <div key={col} className="flex items-center">
                    {isAisle && <div className="w-4" />}
                    {seat ? (
                      <div
                        className={`w-10 h-10 ${getSeatClass(seat)}`}
                        onClick={() => {
                          if (!bookedSeats.includes(seat.seatNumber) && onSeatToggle) {
                            onSeatToggle(seat.seatNumber);
                          }
                        }}
                        title={`Seat ${seat.seatNumber} - ${seat.type} - ₹${seat.price}`}
                      >
                        {seat.seatNumber}
                      </div>
                    ) : (
                      <div className="w-10 h-10" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 justify-center mt-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 seat-available rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 seat-selected rounded" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 seat-booked rounded" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}
