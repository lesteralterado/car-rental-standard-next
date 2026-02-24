// components/Testimonials.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Michael Johnson",
    role: "Business Executive",
    img: "https://cdn.pixabay.com/photo/2017/08/01/01/33/beanie-2562646_1280.jpg",
    rating: 5,
    text: "Three Brother's provided exceptional service for my business trip. The Mercedes S-Class was immaculate, and the booking process was seamless. I'll definitely use their services again for future trips.",
  },
  {
    name: "Sophia Reynolds",
    role: "Event Planner",
    img: "https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383_1280.jpg",
    rating: 5,
    text: "I rented an Audi R8 for my client's special event, and it was the highlight of the night! The car was stunning, and the team at Three Brother's was professional and accommodating with our scheduling needs.",
  },
  {
    name: "David Wilson",
    role: "Photographer",
    img: "https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg",
    rating: 5,
    text: "As a photographer specializing in automotive shoots, I frequently rent from Three Brother's. Their fleet is always in pristine condition, and they understand my specific requirements. The Range Rover I rented for my last project was perfect.",
  },
  {
    name: "Emma Thompson",
    role: "Vacation Traveler",
    img: "https://cdn.pixabay.com/photo/2019/11/03/20/11/portrait-4599553_1280.jpg",
    rating: 5,
    text: "We rented a Porsche 911 Cabriolet for our anniversary trip, and it made our vacation unforgettable. The car was delivered to our hotel right on time, and the team provided excellent guidance on scenic routes in the area.",
  },
];

export default function Testimonials() {
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

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Heading */}
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
            Testimonials
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="gradient-text">Clients</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Testimonials from our satisfied customers who experienced premium service
          </p>
        </motion.div>

        {/* Swiper Slider */}
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          spaceBetween={30}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 2 },
          }}
          className="pb-16"
        >
          {testimonials.map((t, index) => (
            <SwiperSlide key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 h-full"
              >
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 ring-4 ring-[#f4b400]/20">
                    <Image
                      src={t.img}
                      alt={t.name}
                      width={60}
                      height={60}
                      unoptimized
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex text-[#f4b400] mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FaStar key={i} className="w-5 h-5" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-600 leading-relaxed relative">
                  <span className="absolute -top-2 -left-1 text-6xl text-[#f4b400]/20 font-serif">
                    "
                  </span>
                  {t.text}
                </p>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom pagination styling */}
        <style jsx>{`
          :global(.swiper-pagination-bullet) {
            width: 12px;
            height: 12px;
            background: #d1d5db;
            opacity: 1;
          }
          :global(.swiper-pagination-bullet-active) {
            background: #f4b400;
            width: 30px;
            border-radius: 6px;
          }
          :global(.swiper-pagination) {
            bottom: 0;
          }
        `}</style>
      </div>
    </section>
  );
}
