import Image from "next/image";
export default function BrowseCategory() {
  const vendors = [
    { img: "/Event-img.png", name: "Event Photographers" },
    { img: "/Manager.png", name: "Venue Managers" },
    { img: "/Food-img.png", name: "Caterers" },
    { img: "/DJ-image.png", name: "DJs / Musicians" },
    { img: "/Flower-img.png", name: "Event Planners" },
    { img: "/Videograpgher-img.png", name: "Videographers" },
    { img: "/Decorator-img.png", name: "Decorators / Floral Designers" },
    { img: "/Artist-img.png", name: "Makeup Artists" },
    { img: "/Transport-img.png", name: "Transportation & Chauffeur Services" },
    { img: "/Technician-img.png", name: "Sound & Lighting Technicians" },
  ];

  return (
    <section className="bg-white w-full">
      <div className="container max-w-5xl mx-auto py-10 px-4 flex flex-col space-y-8">
        <p className="font-semibold text-lg ml-2 md:ml-0">Browse By Category</p>

        {/* Cards container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 lg:gap-12 justify-items-center">
          {vendors.map((vendor, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <Image
                src={vendor.img}
                alt={vendor.name}
                width={200}
                height={200}
                className="rounded-2xl object-cover"
              />

              <p className="font-normal text-xs text-[#4F4F4F] max-w-[80%] text-center">
                {vendor.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
