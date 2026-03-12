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
   const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'bank'>('gcash');
   const [gcashRef, setGcashRef] = useState('');
   const [carPrice, setCarPrice] = useState<number>(3000); // Default price per day
   const [bankRef, setBankRef] = useState('');
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

   // Fetch car price when car model changes
   useEffect(() => {
     const fetchCarPrice = async () => {
       if (formData.car) {
         try {
           const { data: car } = await supabase
             .from('cars')
             .select('price_per_day')
             .eq('model', formData.car)
             .single();
           
           if (car) {
             setCarPrice(car.price_per_day || 3000);
           }
         } catch (error) {
           console.error('Error fetching car price:', error);
           toast.error('Could not fetch car price. Using default price.');
         }
       }
     };
     
     fetchCarPrice();
   }, [formData.car]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const nextStep = () => {
    // Validate payment details before proceeding from step 3
    if (step === 3) {
      if (paymentMethod === 'gcash') {
        // Validate GCash reference format - should be 13 digits
        const gcashRefClean = gcashRef.replace(/\s/g, '');
        if (!gcashRefClean.trim()) {
          toast.error('Please enter your GCash reference number');
          return;
        }
        if (!/^[A-Za-z0-9]{8,20}$/.test(gcashRefClean)) {
          toast.error('GCash reference must be 8-20 alphanumeric characters');
          return;
        }
      }
      if (paymentMethod === 'bank' && !bankRef.trim()) {
        toast.error('Please enter your bank reference number');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };
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
      
      // Build payment reference based on payment method
      let paymentReference = '';
      if (paymentMethod === 'gcash') {
        paymentReference = gcashRef;
      } else if (paymentMethod === 'bank') {
        paymentReference = bankRef;
      }
      // Note: Card details are NOT stored for security reasons
      
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
          payment_method: paymentMethod,
          payment_reference: paymentReference,
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
                {s === 0 && "🔐 Auth"}
                {s === 1 && "Personal"}
                {s === 2 && "Rental"}
                {s === 3 && "License & Pay"}
                {s === 4 && "Confirm"}
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

              {/* Payment Method Selection */}
              <div className="mb-4">
                <label className="block mb-2 font-medium">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* GCash Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={`border-2 rounded-lg p-3 flex flex-col items-center justify-center transition-all ${
                      paymentMethod === 'gcash' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">💚</span>
                    <span className="text-sm font-medium">GCash</span>
                  </button>

                  {/* Bank Transfer Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`border-2 rounded-lg p-3 flex flex-col items-center justify-center transition-all ${
                      paymentMethod === 'bank' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">🏦</span>
                    <span className="text-sm font-medium">Bank</span>
                  </button>
                </div>
              </div>

              {/* GCash Payment - Show QR Code */}
              {paymentMethod === 'gcash' && (
                <div className="mb-4 border-2 border-green-500 rounded-lg p-4 bg-green-50">
                  <div className="text-center">
                    <h4 className="font-semibold text-green-700 mb-3">Pay with GCash</h4>
                    
                    {/* GCash QR Code */}
                    <div className="mb-4">
                      <img 
                        src="/assets/QRCode.jpg" 
                        alt="Scan to pay with GCash" 
                        className="w-48 h-48 mx-auto rounded-lg border-2 border-white shadow-md"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Scan the QR code</strong> with your GCash app
                    </p>
                    
                    <div className="bg-white rounded p-3 mb-3">
                      <p className="text-xs text-gray-500">Or send payment to:</p>
                      <p className="font-bold text-lg">{process.env.NEXT_PUBLIC_GCASH_NUMBER || 'Contact Support'}</p>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      Amount to pay: <span className="font-bold text-green-700">₱{formData.car && formData.pickupDate && formData.returnDate ? 
                        Math.ceil((new Date(formData.returnDate).getTime() - new Date(formData.pickupDate).getTime()) / (1000 * 60 * 60 * 24)) * carPrice : '0'}</span>
                    </p>

                    {/* Reference Number Input */}
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">Enter GCash Reference No.</label>
                      <input
                        type="text"
                        value={gcashRef}
                        onChange={(e) => setGcashRef(e.target.value)}
                        placeholder="e.g., ABC123456789"
                        className="w-full border rounded px-3 py-2 text-center"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter the 13-digit reference number from your GCash transaction
                    </p>
                  </div>
                </div>
              )}

              {/* Bank Transfer */}
              {paymentMethod === 'bank' && (
                <div className="mb-4 border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-blue-700 mb-3">Bank Transfer Details</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>Bank:</strong> {process.env.NEXT_PUBLIC_BANK_NAME || 'BDO'}</p>
                    <p><strong>Account Name:</strong> {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'Car Rental Pro'}</p>
                    <p><strong>Account Number:</strong> {process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || 'Contact Support'}</p>
                    <p className="text-gray-600 mt-2">Please upload your deposit slip or enter reference number after transfer.</p>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">Reference/Deposit Slip No.</label>
                    <input
                      type="text"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      placeholder="Enter reference number"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              )}

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
