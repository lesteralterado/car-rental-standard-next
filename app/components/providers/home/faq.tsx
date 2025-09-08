"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    question: "What documents do I need to rent a vehicle?",
    answer:
      "To rent a vehicle from threebrothers, you'll need a valid driver's license, a major credit card in your name, and proof of insurance. For luxury and exotic cars, we require drivers to be at least 25 years old with a clean driving record. International customers need a valid passport and international driving permit in addition to their foreign license.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "For standard rentals, cancellations made 48 hours or more before the scheduled pickup time receive a full refund minus a $50 processing fee. Cancellations within 24-48 hours receive a 50% refund. Cancellations less than 24 hours before pickup are non-refundable. For exotic and special vehicles, we require 72 hours notice for a full refund (minus processing fee).",
  },
  {
    question: "Do you offer delivery and pickup services?",
    answer:
      "Yes, we offer convenient delivery and pickup services to your home, hotel, or the airport. Delivery within 10 miles of our location is complimentary for rentals of 3+ days. For locations beyond that radius or shorter rental periods, delivery fees start at $50 depending on distance. Airport deliveries include meet-and-greet service at baggage claim.",
  },
  {
    question: "What is included in the rental price?",
    answer:
      "Our rental prices include standard insurance coverage, 24/7 roadside assistance, and a specific mileage allowance (typically 100-200 miles per day depending on the vehicle). Additional miles can be purchased in advance at a discounted rate or will be charged at the standard rate upon return. Optional extras like additional drivers, GPS, child seats, and premium insurance are available for an additional fee.",
  },
  {
    question: "Can I extend my rental period?",
    answer:
      "Yes, rental extensions are possible subject to vehicle availability. Please contact us at least 24 hours before your scheduled return time to request an extension. Last-minute extension requests cannot be guaranteed and may incur additional fees. All extensions are charged at our current rates, which may differ from your original booking rate.",
  },
  {
    question: "What happens if the vehicle is damaged during my rental?",
    answer:
      "In the event of damage, please contact us immediately. All rentals include basic insurance coverage with a deductible that varies by vehicle type ($1,000-$5,000). You are responsible for damages up to the deductible amount. We offer premium insurance options that can reduce or eliminate the deductible. Note that insurance may not cover all situations, such as negligence, unauthorized drivers, or violations of the rental agreement.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-24 bg-slate-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold relative after:content-[''] after:block after:w-16 after:h-1 after:bg-yellow-500 after:mx-auto after:mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 mt-2">
            Find answers to common inquiries about our rental process
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg mb-5 shadow-md overflow-hidden transition-all duration-300 ${
                activeIndex === index ? "bg-gray-50" : ""
              }`}
            >
              <div
                className="flex items-center justify-between px-6 py-5 cursor-pointer transition-colors duration-300"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-medium">{faq.question}</h3>
                <FaChevronDown
                  className={`text-yellow-500 transform transition-transform duration-300 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
              <div
                className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${
                  activeIndex === index ? "max-h-96 pb-5" : "max-h-0"
                }`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
