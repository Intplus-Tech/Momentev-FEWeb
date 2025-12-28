import {
 
 
 
 
} from "lucide-react";
import Image from "next/image";

export default function PeopleFeel() {
  const vendors = [
    {
      img: "/Daniel-img.png",
      name: "Daniel White",
      location: "Liverpool",
      description: "“Booking vendors has never been this easy. Everything in one place.”",
      
    },
    {
      img: "/Amalia-img.png",
      name: "Amelia Samantha",
      location: "Birmingham",
      description: "“Booking vendors has never been this easy. Everything in one place.”",
     
    },
    {
      img: "/Alex-img.png",
      name: "Alex Carter",
      location: "London",
      description: "“Booking vendors has never been this easy. Everything in one place.”",
     
    },
    {
      img: "/Alice-img.png",
      name: "Alicia Roberts",
      location: "Manchester",
      description: "“Booking vendors has never been this easy. Everything in one place.”",
     
    },
  ];

  return (
    <section className="bg-[#b1afaf] w-full ">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 flex flex-col space-y-6">
        {/* Title + arrows */}
        <div className="flex items-center justify-center">
          <p className="font-semibold text-lg">What people feel with Momentev</p>

</div>

        {/* Cards container */}
        {/* Cards container */}
        <div className="flex flex-nowrap justify-center gap-5">
          {vendors.map((vendor, index) => (
            <div
              key={index}
              className="relative w-[258px] space-y-3 flex flex-col"
            >
              <Image
                src={vendor.img}
                alt={vendor.name}
                width={258}
                height={263}
                className="w-full h-auto rounded-2xl"
              />

              <p className="font-semibold text-base text-[#142141]">
                {vendor.name}
              </p>

              <div className="space-y-3">
                <p className="text-sm text-gray-700">{vendor.location}</p>

                <div className="text-[11px] text-gray-700 max-w-[100px] leading-tight overflow-hidden">
                  <p className="line-clamp-3">
                    {vendor.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Carousel indicators — MUST be outside */}
        <div className="flex justify-center items-center gap-3 pt-6">
          {vendors.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-4 w-4 rounded-full border border-primary transition
        ${index === 0 ? "bg-primary" : "bg-transparent"}
      `}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
