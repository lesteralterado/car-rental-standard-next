'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight, Star, Shield, Clock, Fuel } from 'lucide-react'
import CarCard from '@/app/components/cars/car-card'
import { fetchCars, Car } from '@/types/car'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function FeaturedCars() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  useEffect(() => {
    const loadCars = async () => {
      const fetchedCars = await fetchCars()
      setCars(fetchedCars)
      setLoading(false)
    }
    loadCars()
  }, [])

  const featuredCars = cars.filter(car => car.featured)
  const itemsPerSlide = 3

  const totalSlides = Math.ceil(featuredCars.length / itemsPerSlide)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 6000)

    return () => clearInterval(timer)
  }, [totalSlides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  }

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-4"></div>
              <div className="h-12 bg-gray-300 rounded w-96 mx-auto mb-6"></div>
              <div className="h-4 bg-gray-300 rounded w-80 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="inline-block px-5 py-2 bg-[#f4b400]/10 text-[#f4b400] rounded-full text-sm font-semibold mb-4"
          >
            Premium Collection
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Featured <span className="gradient-text">Vehicles</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Discover our handpicked selection of premium vehicles, chosen for their exceptional quality, comfort, and performance.
          </motion.p>
        </motion.div>

        {featuredCars.length > 0 ? (
          <>
            {/* Cars Carousel */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl">
                <div
                  className="flex transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
                        {featuredCars
                          .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                          .map((car, index) => (
                            <motion.div
                              key={car.id}
                              variants={itemVariants}
                              whileHover={{ y: -10 }}
                              className="group"
                            >
                              <CarCard car={car} view="grid" />
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-4 shadow-xl transition-all hover:shadow-2xl z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={totalSlides <= 1}
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-4 shadow-xl transition-all hover:shadow-2xl z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={totalSlides <= 1}
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            </motion.div>

            {/* Slide Indicators */}
            {totalSlides > 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 }}
                className="flex justify-center mt-10 space-x-3"
              >
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-[#f4b400] w-12'
                        : 'bg-gray-300 w-3 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-gray-400 text-lg"
            >
              No featured cars available at the moment.
            </motion.div>
          </div>
        )}

        {/* View All Cars Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/cars"
            className="inline-flex items-center px-8 py-4 bg-[#f4b400] text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-[#d49b00] transition-all duration-300 btn-shine group"
          >
            View All Cars
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
