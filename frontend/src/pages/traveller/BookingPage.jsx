import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import SeatSelector from '../../components/SeatSelector';
import MapView from '../../components/MapView';
import CheckoutLogin from '../../components/CheckoutLogin';

const API = import.meta.env.VITE_API_URL || '/api';

export default function BookingPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState(1);
  const [passengers, setPassengers] = useState([]);
  const [booking, setBooking] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    fetchSchedule();
    checkUserLogin();
  }, [scheduleId]);

  // Allow access without login - only check at payment
  useEffect(() => {
    if (!loading && !schedule) {
      navigate('/search');
    }
  }, [loading, schedule, navigate]);

  useEffect(() => {
    setPassengers(selectedSeats.map((sn) => ({ seatNumber: sn, name: '', age: '', gender: 'male' })));
  }, [selectedSeats]);

  const checkUserLogin = () => {
    const token = localStorage.getItem('token');
    setIsUserLoggedIn(!!token);
  };

  const fetchSchedule = async () => {
    try {
      const { data } = await axios.get(`${API}/schedules/${scheduleId}`);
      setSchedule(data.schedule);
    } catch {
      toast.error('Could not load schedule');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const updatePassenger = (idx, field, value) => {
    setPassengers((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleLoginSuccess = (user) => {
    setShowLoginModal(false);
    setIsUserLoggedIn(true);
    localStorage.setItem('token', user.token || localStorage.getItem('token'));
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handlePaymentClick = () => {
    if (!isUserLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    handleBooking();
  };

  const handleBooking = async () => {
    if (passengers.some((p) => !p.name || !p.age)) {
      return toast.error('Fill details for all passengers');
    }
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API}/bookings`, {
        scheduleId,
        passengers: passengers.map((p) => ({ ...p, age: Number(p.age) })),
        selectedSeats,
        boardingPoint: schedule.route?.source?.name,
        droppingPoint: schedule.route?.destination?.name,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(data);
      initRazorpay(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const initRazorpay = (bookingData) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: bookingData.amount * 100,
      currency: 'INR',
      name: 'AdiTourn Travel',
      description: `Bus Ticket - ${schedule?.route?.source?.name} to ${schedule?.route?.destination?.name}`,
      order_id: bookingData.razorpayOrderId,
      handler: async (response) => {
        try {
          const token = localStorage.getItem('token');
          await axios.post(`${API}/bookings/verify-payment`, {
            bookingId: bookingData.booking._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Booking confirmed!');
          navigate('/my-bookings');
        } catch {
          toast.error('Payment verification failed. Contact support.');
        }
      },
      prefill: { name: passengers[0]?.name, contact: '' },
      theme: { color: '#2563eb' },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (!schedule) return null;

  const totalAmount = selectedSeats.length * schedule.fare;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      {showLoginModal && (
        <CheckoutLogin
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Book Your Ticket</h1>
          <p className="text-gray-500">{schedule.route?.source?.name} → {schedule.route?.destination?.name} • {schedule.departureTime} - {schedule.arrivalTime}</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['Select Seats', 'Passenger Details', 'Payment'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="card">
                <h2 className="font-bold text-lg mb-4">Select Your Seats</h2>
                <SeatSelector
                  seats={schedule.bus?.seats || []}
                  bookedSeats={schedule.bookedSeats || []}
                  selectedSeats={selectedSeats}
                  onSeatToggle={toggleSeat}
                />
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-gray-600">Selected: <strong>{selectedSeats.join(', ') || 'None'}</strong></span>
                  <button onClick={() => selectedSeats.length > 0 && setStep(2)} disabled={selectedSeats.length === 0} className="btn-primary">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="card">
                <h2 className="font-bold text-lg mb-4">Passenger Details</h2>
                <div className="space-y-6">
                  {passengers.map((p, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-700 mb-3">Passenger {i + 1} — Seat {p.seatNumber}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 font-medium block mb-1">Full Name</label>
                          <input type="text" placeholder="Name" value={p.name} onChange={(e) => updatePassenger(i, 'name', e.target.value)} className="input-field" required />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-medium block mb-1">Age</label>
                          <input type="number" placeholder="Age" min="1" max="120" value={p.age} onChange={(e) => updatePassenger(i, 'age', e.target.value)} className="input-field" required />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-medium block mb-1">Gender</label>
                          <select value={p.gender} onChange={(e) => updatePassenger(i, 'gender', e.target.value)} className="input-field">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary">Continue →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="card">
                <h2 className="font-bold text-lg mb-4">Review & Pay</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm py-2 border-b">
                    <span className="text-gray-500">Route</span>
                    <span className="font-medium">{schedule.route?.source?.name} → {schedule.route?.destination?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b">
                    <span className="text-gray-500">Departure</span>
                    <span className="font-medium">{schedule.departureTime}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b">
                    <span className="text-gray-500">Seats</span>
                    <span className="font-medium">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b">
                    <span className="text-gray-500">Passengers</span>
                    <span className="font-medium">{passengers.length}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{totalAmount}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
                  <button onClick={handlePaymentClick} className="btn-primary">
                    {isUserLoggedIn ? `Pay ₹${totalAmount} via Razorpay` : `🔒 Login & Pay ₹${totalAmount}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card mb-4">
              <h3 className="font-bold text-gray-700 mb-3">Bus Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Bus</span><span className="font-medium">{schedule.bus?.busName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{schedule.bus?.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Seats left</span><span className="font-medium text-green-600">{schedule.availableSeats}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fare/seat</span><span className="font-bold text-blue-600">₹{schedule.fare}</span></div>
              </div>
            </div>

            <MapView
              source={schedule.route?.source}
              destination={schedule.route?.destination}
              stops={schedule.route?.stops || []}
              currentLocation={schedule.currentLocation}
              height="280px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
