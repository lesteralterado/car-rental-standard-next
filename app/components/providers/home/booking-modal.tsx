"use client";
import { useState } from "react";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";

type CarCardProps = {
    isOpen: boolean;
    onClose: () => void;
    carModel: string;
};

export default function BookingModal({ isOpen, onClose, carModel }: CarCardProps) {
  const [step, setStep] = useState(1);
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("lastBookingInquiry", JSON.stringify(formData));
    alert("Thank you! We’ll contact you shortly.");
    setStep(1);
    onClose();
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
          Book Your Luxury Experience
        </h2>

        {/* Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
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
                {s}
              </div>
              <span
                className={`text-sm mt-2 ${
                  s === step ? "text-blue-500 font-medium" : "text-gray-500"
                }`}
              >
                {s === 1 && "Personal Info"}
                {s === 2 && "Rental Details"}
                {s === 3 && "Confirmation"}
              </span>
              {s < 3 && (
                <div className="absolute top-4 right-[-50%] w-full h-[2px] bg-gray-200 z-0" />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
                <label className="block mb-1 font-medium">Special Requests</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special requests?"
                  className="w-full border rounded px-3 py-2"
                />
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

          {/* Nav */}
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

            {step < 3 ? (
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
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit Booking
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
