// components/ContactSection.tsx
import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from "react-icons/fa";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-[100px]" // padding: 100px 0
    >
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Get in Touch</h2>
        <p className="section-subtitle text-center">
          Contact us for bookings, inquiries, or special requests
        </p>

        {/* Contact Info + Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[50px] mt-8">
          {/* Left Side - Contact Info */}
          <div className="pr-[30px]">
            {/* Item 1 */}
            <div className="flex items-start mb-[25px]">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-[20px] mr-[15px] flex-shrink-0">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h4 className="m-0 mb-[5px] text-[18px]">Our Location</h4>
                <p className="m-0 text-primary">
                  123 Luxury Drive, Beverly Hills, CA 90210
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start mb-[25px]">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-[20px] mr-[15px] flex-shrink-0">
                <FaPhoneAlt />
              </div>
              <div>
                <h4 className="m-0 mb-[5px] text-[18px]">Call Us</h4>
                <p className="m-0 text-primary">
                  +1 (800) THREE BROTHER'S
                </p>
                <p className="m-0 text-primary">
                  +1 (310) 555-1234
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start mb-[25px]">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-[20px] mr-[15px] flex-shrink-0">
                <FaEnvelope />
              </div>
              <div>
                <h4 className="m-0 mb-[5px] text-[18px]">Email Us</h4>
                <p className="m-0 text-primary">
                  bookings@threebrothers.com
                </p>
                <p className="m-0 text-primary">
                  info@threebrothers.com
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-start mb-[25px]">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-[20px] mr-[15px] flex-shrink-0">
                <FaClock />
              </div>
              <div>
                <h4 className="m-0 mb-[5px] text-[18px]">Business Hours</h4>
                <p className="m-0 text-primary">
                  Monday - Friday: 9:00 AM - 8:00 PM
                </p>
                <p className="m-0 text-primary">
                  Saturday - Sunday: 10:00 AM - 6:00 PM
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-[15px] mt-[30px]">
              {[
                <FaFacebookF />,
                <FaInstagram />,
                <FaTwitter />,
                <FaLinkedinIn />,
                <FaYoutube />,
              ].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 bg-[var(--light)] text-[var(--primary)] rounded-full flex items-center justify-center no-underline transition-all duration-300 ease-in-out hover:bg-blue-500 hover:text-white hover:-translate-y-[3px]"
                >
                  {Icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="rounded-[10px] overflow-hidden h-[400px] shadow-[0_15px_35px_rgba(0,0,0,0.1)]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26430.393553120906!2d-118.43209836323913!3d34.0771059378146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc04d6d147ab%3A0xd6c7c379fd081ed1!2sBeverly%20Hills%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1675887953669!5m2!1sen!2sus"
              width="600"
              height="450"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div
          className="mt-[50px] p-[30px] bg-white rounded-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
          data-aos="fade-up"
        >
          <h3 className="mb-[20px]">Send Us a Message</h3>
          <form id="contact-form">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="mb-[20px]">
                <label
                  htmlFor="name"
                  className="block mb-2 font-medium text-[var(--primary)]"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full py-3 px-4 border border-[#e2e8f0] rounded bg-[#f8fafc] transition-all duration-300 ease-in-out focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(219,161,28,0.1)]"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="mb-[20px]">
                <label
                  htmlFor="email"
                  className="block mb-2 font-medium text-[var(--primary)]"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full py-3 px-4 border border-[#e2e8f0] rounded bg-[#f8fafc] transition-all duration-300 ease-in-out focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(219,161,28,0.1)]"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <div className="mb-[20px]">
              <label
                htmlFor="phone"
                className="block mb-2 font-medium text-[var(--primary)]"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className="w-full py-3 px-4 border border-[#e2e8f0] rounded bg-[#f8fafc] transition-all duration-300 ease-in-out focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(219,161,28,0.1)]"
                placeholder="+1 (123) 456-7890"
                required
              />
            </div>
            <div className="mb-[20px]">
              <label
                htmlFor="subject"
                className="block mb-2 font-medium text-[var(--primary)]"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="w-full py-3 px-4 border border-[#e2e8f0] rounded bg-[#f8fafc] transition-all duration-300 ease-in-out focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(219,161,28,0.1)]"
                placeholder="Booking Inquiry"
                required
              />
            </div>
            <div className="mb-[20px]">
              <label
                htmlFor="message"
                className="block mb-2 font-medium text-[var(--primary)]"
              >
                Message
              </label>
              <textarea
                id="message"
                className="w-full min-h-[120px] py-3 px-4 border border-[#e2e8f0] rounded bg-[#f8fafc] transition-all duration-300 ease-in-out focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(219,161,28,0.1)] resize-y"
                placeholder="Tell us about your requirements..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn btn-accent"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
