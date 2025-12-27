import {
  MapPin,
  BriefcaseBusiness,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default function NewMomentev() {
  // Array of vendor data
  const vendors = [
    {
      img: "/Makeup-img.png",
      name: "The Glow Loft",
      location: "London, Oxford",
      profession: "Makeup Artist",
      rating: "5.0 [1,142]",
    },
    {
      img: "/Caterer-img.png",
      name: "Elite Catering Co.",
      location: "Manchester, spinningfield",
      profession: "caterers",
      rating: "5.0 [856]",
    },
    {
      img: "/Planner-img.png",
      name: "Harmony Weddings",
      location: "Birmingham, Broad Street",
      profession: "Caterer",
      rating: "5.0 [1,025]",
    },
    {
      img: "/sound-img.png",
      name: "City Sound & Lights",
      location: "Liverpool, Baltic Triangle",
      profession: "City Sound & Lighting",
      rating: "5.0 [732]",
    },
  ];

  return (
    <section className="bg-white w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-0 py-10 flex flex-col items-center space-y-6">

        {/* Title + arrows */}
        <div className="w-full max-w-5xl md:max-w-none flex items-center justify-between ">
          <p className="font-semibold text-lg ">New To Momentev</p>

          <div className="flex items-center gap-2 px-10">
            <ChevronLeft className="cursor-pointer border-2 rounded-2xl" />
            <ChevronRight className="cursor-pointer border-2 rounded-2xl" />
          </div>
        </div>

        {/* Cards container */}
        <div className="flex flex-wrap justify-center gap-5">
          {vendors.map((vendor, index) => (
           <div key={index} className="relative w-58 space-y-3 shrink-0">
                           <Image
                             src={vendor.img}
                             alt={vendor.name}
                             width={258}
                             height={263}
                             className="max-w-full h-auto rounded-2xl"
                           />
           
                           <div className="absolute bottom-25 right-3 bg-white/90 rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                             <Star className="w-4 h-4 text-black" />
                             <span className="text-sm font-medium text-black">{vendor.rating}</span>
                           </div>
           
                           <p className="font-semibold text-base text-[#142141]">{vendor.name}</p>
           
                           <div className="flex items-center gap-1 text-sm text-gray-700">
                             <MapPin className="w-4 h-4" />
                             <p>{vendor.location}</p>
                           </div>
           
                           <div className="flex items-center gap-1 text-sm text-gray-700">
                             <BriefcaseBusiness className="w-4 h-4" />
                             <p>{vendor.profession}</p>
                           </div>
                         </div>
          ))}
        </div>

      </div>
    </section>
  );
}
