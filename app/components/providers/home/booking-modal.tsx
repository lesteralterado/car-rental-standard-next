"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";
import useAuth from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import PaymentModal from "@/app/components/PaymentModal";
import LoginForm from "@/app/components/LoginForm";
import SignUpForm from "@/app/components/SignUpForm";
import { User } from "@supabase/supabase-js";

type CarCardProps = {
    isOpen: boolean;
    onClose: () => void;
    carModel: string;
};

export default function BookingModal({ isOpen, onClose, carModel }: CarCardProps) {
   const { user } = useAuth();
   const [step, setStep] = useState(1);
   const [loading, setLoading] = useState(false);
   const [showPaymentModal, setShowPaymentModal] = useState(false);
   const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
   const [formData, setFormData] = useState({
     name: "",
     email: "",
     phone: "",
     address: "",
     car: carModel || "",
     pickupDate: "",
     returnDate: "",
     location: "",
     customLocation: "",
     notes: "",
     driversLicense: null as File | null,
     licenseNumber: "",
   });

   useEffect(() => {
     if (isOpen && !user) {
       setStep(0);
     } else if (isOpen && user) {
       setStep(1);
     }
   }, [isOpen, user]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const checkCarAvailability = async (carId: string, pickupDate: string, returnDate: string): Promise<boolean> => {
    try {
      const { data: conflictingBookings, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('car_id', carId)
        .neq('status', 'rejected') // Don't count rejected bookings
        .neq('status', 'cancelled') // Don't count cancelled bookings
        .or(`and(pickup_date.lte.${returnDate},return_date.gte.${pickupDate})`);

      if (error) {
        console.error('Availability check error:', error);
        return false;
      }

      return conflictingBookings.length === 0;
    } catch (error) {
      console.error('Availability check error:', error);
      return false;
    }
  };

  const handlePaymentSuccess = async () => {
    // Update booking payment status
    // Note: In a real app, this would be handled by Stripe webhooks
    // For demo purposes, we'll just close the modals
    setShowPaymentModal(false);
    setStep(1);
    onClose();
    toast.success("Payment completed! Your booking is now active.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Find the car by model
      const { data: cars, error: carError } = await supabase
        .from('cars')
        .select('id, price_per_day, available')
        .eq('model', formData.car)
        .single();

      if (carError || !cars) {
        toast.error("Car not found");
        return;
      }

      if (!cars.available) {
        toast.error("This car is currently not available");
        return;
      }

      // Check availability for the selected dates
      const isAvailable = await checkCarAvailability(cars.id, formData.pickupDate, formData.returnDate);

      if (!isAvailable) {
        toast.error("This car is not available for the selected dates. Please choose different dates.");
        return;
      }

      // Calculate total price (simplified - just days * price_per_day)
      const pickupDate = new Date(formData.pickupDate);
      const returnDate = new Date(formData.returnDate);
      const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = days * cars.price_per_day;

      // Upload driver's license if provided
      let licenseUrl = null;
      if (formData.driversLicense) {
        const fileExt = formData.driversLicense.name.split('.').pop();
        const fileName = `${(user as User).id}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('licenses')
          .upload(fileName, formData.driversLicense);

        if (uploadError) {
          console.error('License upload error:', uploadError);
          toast.error("Failed to upload driver's license");
          return;
        }

        licenseUrl = uploadData.path;
      }

      // Update user profile with license info
      if (formData.licenseNumber || licenseUrl) {
        await supabase
          .from('profiles')
          .update({
            drivers_license_number: formData.licenseNumber,
            drivers_license_url: licenseUrl,
          })
          .eq('id', (user as User).id);
      }

      // Create booking as pending for admin approval
      const bookingStatus = isAvailable ? 'pending' : 'rejected';
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: (user as User).id,
          car_id: cars.id,
          pickup_date: formData.pickupDate,
          return_date: formData.returnDate,
          pickup_location: formData.location === 'custom' ? formData.customLocation : formData.location,
          total_price: totalPrice,
          status: bookingStatus,
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking error:', bookingError);
        toast.error("Failed to create booking");
        return;
      }

      if (isAvailable) {
        // Booking submitted for admin approval
        toast.success("Booking submitted! Waiting for admin approval.");
        setStep(1);
        onClose();
      } else {
        toast.error("Booking rejected. The car is not available for the selected dates. Please choose different dates.");
        setStep(1);
        onClose();
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        car: carModel || "",
        pickupDate: "",
        returnDate: "",
        location: "",
        customLocation: "",
        notes: "",
        driversLicense: null,
        licenseNumber: "",
      });

    } catch (error) {
      console.error('Submit error:', error);
      toast.error("An error occurred while submitting your booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] transition-all duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`bg-white w-full max-w-2xl rounded-lg p-10 relative transform transition-transform duration-300 ${
          isOpen ? "scale-100" : "scale-90"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>

        {/* Title */}
        <h2 className="text-center text-2xl font-bold mb-8">
          {step === 0 ? "Sign In to Book" : "Book Your Luxury Experience"}
        </h2>

        {/* Steps */}
        <div className="flex justify-between mb-8">
          {[0, 1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center relative flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold z-10 ${
                  s === step
                    ? "bg-blue-500 text-white"
                    : s < step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s === 0 ? "🔐" : s}
              </div>
              <span
                className={`text-sm mt-2 text-center ${
                  s === step ? "text-blue-500 font-medium" : "text-gray-500"
                }`}
              >
                {s === 0 && "Authentication"}
                {s === 1 && "Personal Info"}
                {s === 2 && "Rental Details"}
                {s === 3 && "License & Payment"}
                {s === 4 && "Confirmation"}
              </span>
              {s < 4 && (
                <div className="absolute top-4 right-[-50%] w-full h-[2px] bg-gray-200 z-0" />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 0 - Authentication */}
          {step === 0 && (
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Please Sign In to Continue Booking</h3>
              <p className="text-gray-600 mb-6">You need to be logged in to complete your car rental booking.</p>

              {authMode === 'login' ? (
                <div className="space-y-4">
                  <LoginForm />
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-blue-500 hover:underline"
                  >
                    Don&quot;t have an account? Sign up
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <SignUpForm />
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-blue-500 hover:underline"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (123) 456-7890"
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Address</label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your address"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Selected Vehicle</label>
                <input
                  type="text"
                  id="car"
                  value={formData.car}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <label className="block mb-1 font-medium">Pickup Date & Time</label>
                  <input
                    type="datetime-local"
                    id="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 pr-10"
                  />
                  <FaCalendarAlt className="absolute right-3 top-9 text-gray-500" />
                </div>
                <div className="flex-1 relative">
                  <label className="block mb-1 font-medium">Return Date & Time</label>
                  <input
                    type="datetime-local"
                    id="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 pr-10"
                  />
                  <FaCalendarAlt className="absolute right-3 top-9 text-gray-500" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Pickup/Return Location
                </label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select location</option>
                  <option value="office">Our Office - 123 Luxury Drive</option>
                  <option value="airport">LAX Airport</option>
                  <option value="hotel">Hotel Delivery</option>
                  <option value="custom">Custom Address</option>
                </select>
              </div>

              {formData.location === "custom" && (
                <div>
                  <label className="block mb-1 font-medium">Custom Location</label>
                  <input
                    type="text"
                    id="customLocation"
                    value={formData.customLocation}
                    onChange={handleChange}
                    placeholder="Enter address for delivery"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Driver&quot;s License Number</label>
                <input
                  type="text"
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter your license number"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">Upload Driver&quot;s License</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, driversLicense: file });
                  }}
                  required
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-sm text-gray-500 mt-1">Please upload a clear photo of your driver&quot;s license</p>
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-medium">Payment Information</label>
                <div className="border rounded p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Payment will be processed after admin approval</p>
                  <p className="text-sm font-medium">Total Amount: To be calculated after approval</p>
                </div>
              </div>

              <div>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" required />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="text-blue-500 underline">
                      terms and conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-500 underline">
                      privacy policy
                    </a>.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Special Requests</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special requests?"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-medium mb-2">Booking Summary</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Vehicle:</strong> {formData.car}</p>
                  <p><strong>Pickup:</strong> {formData.pickupDate} at {formData.location}</p>
                  <p><strong>Return:</strong> {formData.returnDate}</p>
                  <p><strong>License:</strong> {formData.licenseNumber}</p>
                  <p><strong>Total:</strong> To be calculated after approval</p>
                </div>
              </div>

              <div>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" required />
                  <span>
                    I confirm that all information provided is accurate and I agree to the rental terms.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Nav */}
          {step !== 0 && (
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Booking"}
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={0}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
