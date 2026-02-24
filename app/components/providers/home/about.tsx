'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from "next/image";
import { ArrowRight, Award, Users, Clock, Shield } from 'lucide-react';

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  
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

  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Meticulously maintained luxury vehicles for an exceptional driving experience.'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Professional staff dedicated to providing outstanding customer service.'
    },
    {
      icon: Clock,
      title: 'Quick Process',
      description: 'Streamlined booking process to get you on the road quickly.'
    },
    {
      icon: Shield,
      title: 'Fully Insured',
      description: 'Comprehensive insurance coverage for complete peace of mind.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section ref={sectionRef} id="about" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex flex-col lg:flex-row items-center gap-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* About Image with decorative elements */}
          <motion.div
            className="flex-1 relative"
            variants={itemVariants}
          >
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main image */}
              <Image
                src="https://cdn.pixabay.com/photo/2019/07/07/14/03/fiat-4322521_1280.jpg"
                alt="About Three Brothers'"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </motion.div>

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -bottom-8 -right-4 bg-white rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#f4b400] rounded-xl flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">15+</div>
                  <div className="text-sm text-gray-500">Years Experience</div>
                </div>
              </div>
            </motion.div>

            {/* Decorative circles */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -top-4 -left-4 w-24 h-24 bg-[#f4b400]/20 rounded-full -z-10"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute top-1/2 -left-8 w-16 h-16 bg-[#f4b400]/10 rounded-full -z-10"
            />
          </motion.div>

          {/* About Content */}
          <motion.div
            className="flex-1 space-y-8"
            variants={itemVariants}
          >
            <motion.div variants={itemVariants}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 bg-[#f4b400]/10 text-[#f4b400] rounded-full text-sm font-semibold mb-4"
              >
                About Us
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Three Brothers' <span className="gradient-text">Luxury</span> Car Rental
              </h2>
              
              <p className="text-lg text-[#f4b400] font-medium">
                Luxury Car Rental Service Since 2010
              </p>
            </motion.div>

            <motion.div className="space-y-4 text-gray-600" variants={containerVariants}>
              <motion.p variants={itemVariants}>
                Three Brothers' is a premier luxury car rental service
                dedicated to providing exceptional vehicles and outstanding
                customer experiences. Founded in 2010, we have built our
                reputation on offering meticulously maintained luxury automobiles
                for clients who expect nothing but the best.
              </motion.p>

              <motion.p variants={itemVariants}>
                Our mission is simple: to provide you with an extraordinary
                driving experience in vehicles that represent the pinnacle of
                automotive engineering and design. Whether you need a
                sophisticated sedan for a business trip, a luxury SUV for a family
                vacation, or an exotic sports car for a special occasion, Three
                Brothers' has the perfect vehicle to match your needs.
              </motion.p>

              <motion.p variants={itemVariants}>
                What sets us apart is our attention to detail and commitment to
                customer satisfaction. From the moment you browse our fleet to the
                day you return your rental, our team of professionals is dedicated
                to ensuring your experience exceeds expectations.
              </motion.p>
            </motion.div>

            {/* Feature cards */}
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 p-4 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <feature.icon className="w-6 h-6 text-[#f4b400] mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.a
                href="#services"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-[#f4b400] text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-[#d49b00] transition-all duration-300 btn-shine group"
              >
                Explore Our Services
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
