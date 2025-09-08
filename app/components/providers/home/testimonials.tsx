// components/Testimonials.jsx
"use client";

import Image from "next/image";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

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
    rating: 4.5,
    text: "We rented a Porsche 911 Cabriolet for our anniversary trip, and it made our vacation unforgettable. The car was delivered to our hotel right on time, and the team provided excellent guidance on scenic routes in the area.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-100">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 relative inline-block after:block after:w-20 after:h-1 after:bg-yellow-500 after:mx-auto after:mt-2">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-500">
            Testimonials from our satisfied customers
          </p>
        </div>

        {/* Swiper Slider */}
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={30}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 2 },
          }}
          className="pb-16"
        >
          {testimonials.map((t, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                {/* Header */}
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-4">
                    <Image
                      src={t.img}
                      alt={t.name}
                      width={60}
                      height={60}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex text-yellow-500 mb-4">
                  {Array.from({ length: Math.floor(t.rating) }).map((_, i) => (
                    <FaStar key={i} />
                  ))}
                  {t.rating % 1 !== 0 && <FaStarHalfAlt />}
                </div>

                {/* Content */}
                <p className="italic text-gray-700 relative">
                  <span className="absolute -top-4 -left-2 text-7xl text-yellow-200 opacity-30">
                    "
                  </span>
                  {t.text}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Button */}
        <button className="mt-8 mx-auto block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition">
          Leave a Review
        </button>
      </div>
    </section>
  );
}
