'use client';

import { motion } from 'framer-motion';
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const titleWords = "About Three Brother's".split(" ");

  return (
    <section id="about" className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex flex-col lg:flex-row items-center gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* About Content */}
          <motion.div
            className="flex-1 space-y-6"
            variants={itemVariants}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div variants={textVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-4 relative">
                {titleWords.map((word, index) => (
                  <motion.span
                    key={index}
                    variants={wordVariants}
                    className="inline-block mr-3"
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {word}
                  </motion.span>
                ))}
                <motion.div
                  className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-accent to-primary"
                  initial={{ width: 0 }}
                  whileInView={{ width: 80 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                />
              </h2>
            </motion.div>

            <motion.p
              className="text-lg text-muted-foreground"
              variants={itemVariants}
            >
              Luxury Car Rental Service Since 2010
            </motion.p>

            <motion.div className="space-y-4 text-muted-foreground" variants={containerVariants}>
              <motion.p variants={itemVariants} transition={{ duration: 0.6, delay: 0.2 }}>
                Three Brother's is a premier luxury car rental service
                dedicated to providing exceptional vehicles and outstanding
                customer experiences. Founded in 2010, we have built our
                reputation on offering meticulously maintained luxury automobiles
                for clients who expect nothing but the best.
              </motion.p>

              <motion.p variants={itemVariants} transition={{ duration: 0.6, delay: 0.4 }}>
                Our mission is simple: to provide you with an extraordinary
                driving experience in vehicles that represent the pinnacle of
                automotive engineering and design. Whether you need a
                sophisticated sedan for a business trip, a luxury SUV for a family
                vacation, or an exotic sports car for a special occasion, Three
                Brother's has the perfect vehicle to match your needs.
              </motion.p>

              <motion.p variants={itemVariants} transition={{ duration: 0.6, delay: 0.6 }}>
                What sets us apart is our attention to detail and commitment to
                customer satisfaction. From the moment you browse our fleet to the
                day you return your rental, our team of professionals is dedicated
                to ensuring your experience exceeds expectations.
              </motion.p>
            </motion.div>

            <motion.div variants={itemVariants} transition={{ duration: 0.6, delay: 0.8 }}>
              <Button
                asChild
                size="lg"
                className="mt-8 bg-primary hover:from-primary hover:to-blue-500 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <a href="#services" className="inline-flex items-center">
                  Explore Our Services
                  <motion.svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* About Image */}
          <motion.div
            className="flex-1"
            variants={itemVariants}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                viewport={{ once: true }}
              />
              <Image
                src="https://cdn.pixabay.com/photo/2019/07/07/14/03/fiat-4322521_1280.jpg"
                alt="About Three Brother's"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
