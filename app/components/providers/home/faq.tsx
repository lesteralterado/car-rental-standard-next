"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1, rootMargin: "-100px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} id="faqs" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 bg-[#f4b400]/10 text-[#f4b400] rounded-full text-sm font-semibold mb-4"
          >
            FAQ
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common inquiries about our rental process
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * index }}
              className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
                activeIndex === index ? "shadow-xl" : "shadow-md hover:shadow-lg"
              }`}
            >
              <div
                className="flex items-center justify-between px-6 py-5 cursor-pointer transition-colors duration-300"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 w-8 h-8 bg-[#f4b400]/10 rounded-full flex items-center justify-center"
                >
                  <FaChevronDown className="text-[#f4b400] w-4 h-4" />
                </motion.div>
              </div>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
