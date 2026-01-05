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
      <div className="max-w-6xl px-6 mx-auto  md:px-0 py-10 flex flex-col items-center space-y-6">
        <div className="max-w-7xl w-full  md:max-w-none flex    ">
          <p className="font-semibold text-lg md:pl-20">Browse By Category</p>
        </div>

        {/* Cards container */}
        <div className="flex flex-wrap justify-center gap-10 w-[950px]">
          {vendors.map((vendor, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 w-[157px]"
            >
              <Image
                src={vendor.img}
                alt={vendor.name}
                width={157}
                height={157}
                className="rounded-2xl object-cover"
              />

              <p className="font-normal text-[11px] text-[#4F4F4F] max-w-[80%]  h-[26px] text-center">
                {vendor.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
