import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* About Content */}
          <div
            className="flex-1"
            data-aos="fade-right"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-4 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-[3px] after:bg-accent">
              About Three Brother&apos;s
            </h2>
            <p className="text-lg text-gray-500 mb-10">
              Luxury Car Rental Service Since 2010
            </p>
            <p className="mb-4">
              Three Brother&apos;s is a premier luxury car rental service
              dedicated to providing exceptional vehicles and outstanding
              customer experiences. Founded in 2010, we have built our
              reputation on offering meticulously maintained luxury automobiles
              for clients who expect nothing but the best.
            </p>
            <p className="my-5">
              Our mission is simple: to provide you with an extraordinary
              driving experience in vehicles that represent the pinnacle of
              automotive engineering and design. Whether you need a
              sophisticated sedan for a business trip, a luxury SUV for a family
              vacation, or an exotic sports car for a special occasion, Three
              Brother&apos;s has the perfect vehicle to match your needs.
            </p>
            <p>
              What sets us apart is our attention to detail and commitment to
              customer satisfaction. From the moment you browse our fleet to the
              day you return your rental, our team of professionals is dedicated
              to ensuring your experience exceeds expectations.
            </p>
            <a
              href="#services"
              className="inline-block mt-8 bg-accent text-dark font-semibold px-6 py-3 rounded-md hover:bg-yellow-600 transition-colors duration-300"
            >
              Explore Our Services
            </a>
          </div>

          {/* About Image */}
          <div
            className="flex-1 rounded-lg overflow-hidden relative"
            data-aos="fade-left"
          >
            <Image
              src="https://cdn.pixabay.com/photo/2019/07/07/14/03/fiat-4322521_1280.jpg"
              alt="About Three Brother's"
              width={800}
              height={600}
              className="rounded-lg transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
