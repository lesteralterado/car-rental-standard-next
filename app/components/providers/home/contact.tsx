// components/ContactSection.tsx
import { useEffect, useRef, useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane, FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ContactSection() {
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

  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      title: "Our Location",
      details: ["123 Luxury Drive, Beverly Hills", "CA 90210, United States"]
    },
    {
      icon: FaPhoneAlt,
      title: "Call Us",
      details: ["+1 (800) THREE BROTHERS", "+1 (310) 555-1234"]
    },
    {
      icon: FaEnvelope,
      title: "Email Us",
      details: ["bookings@threebrothers.com", "info@threebrothers.com"]
    },
    {
      icon: FaClock,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 8:00 PM", "Sat - Sun: 10:00 AM - 6:00 PM"]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-24 bg-white"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
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
            Contact Us
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Contact us for bookings, inquiries, or special requests
          </p>
        </motion.div>

        {/* Contact Info + Map */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
        >
          {/* Left Side - Contact Info */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Grid of contact items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-[#f4b400] text-white rounded-xl flex items-center justify-center text-xl mb-4">
                    <info.icon />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{info.title}</h4>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-gray-600 text-sm">{detail}</p>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <motion.div variants={itemVariants} className="flex gap-4 pt-4">
              {[
                { icon: FaFacebookF, href: "#" },
                { icon: FaInstagram, href: "#" },
                { icon: FaTwitter, href: "#" },
                { icon: FaLinkedinIn, href: "#" },
                { icon: FaYoutube, href: "#" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-[#f4b400] hover:text-white transition-colors"
                >
                  <social.icon />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Map */}
          <motion.div 
            variants={itemVariants}
            className="rounded-3xl overflow-hidden shadow-2xl h-[400px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26430.393553120906!2d-118.43209836323913!3d34.0771059378146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc04d6d147ab%3A0xd6c7c379fd081ed1!2sBeverly%20Hills%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1675887953669!5m2!1sen!2sus"
              width="100%"
              height="100%"
              className="border-0"
              loading="lazy"
              allowFullScreen
            ></iframe>
          </motion.div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-3xl mx-auto p-8 md:p-12 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Send Us a Message</h3>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full py-4 px-5 border border-gray-200 rounded-xl bg-white transition-all duration-300 focus:outline-none focus:border-[#f4b400] focus:shadow-[0_0_0_3px_rgba(244,180,0,0.1)]"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full py-4 px-5 border border-gray-200 rounded-xl bg-white transition-all duration-300 focus:outline-none focus:border-[#f4b400] focus:shadow-[0_0_0_3px_rgba(244,180,0,0.1)]"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block mb-2 font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className="w-full py-4 px-5 border border-gray-200 rounded-xl bg-white transition-all duration-300 focus:outline-none focus:border-[#f4b400] focus:shadow-[0_0_0_3px_rgba(244,180,0,0.1)]"
                placeholder="+1 (123) 456-7890"
                required
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block mb-2 font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="w-full py-4 px-5 border border-gray-200 rounded-xl bg-white transition-all duration-300 focus:outline-none focus:border-[#f4b400] focus:shadow-[0_0_0_3px_rgba(244,180,0,0.1)]"
                placeholder="Booking Inquiry"
                required
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block mb-2 font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="message"
                className="w-full min-h-[150px] py-4 px-5 border border-gray-200 rounded-xl bg-white transition-all duration-300 focus:outline-none focus:border-[#f4b400] focus:shadow-[0_0_0_3px_rgba(244,180,0,0.1)] resize-y"
                placeholder="Tell us about your requirements..."
                required
              ></textarea>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-[#f4b400] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#d49b00] transition-all duration-300 btn-shine flex items-center justify-center gap-2"
            >
              Send Message
              <FaPaperPlane />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
