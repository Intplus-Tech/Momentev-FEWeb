import Image from "next/image";
import Link from "next/link";

export default function BrowseCategory() {
  const vendors = [
    { img: "/Event-img.png", name: "Event Photographers", id: "photography" },
    // { img: "/Manager.png", name: "Venue Managers", id: "venue" },
    { img: "/Food-img.png", name: "Caterers", id: "caterer" },
    { img: "/DJ-image.png", name: "DJs / Musicians", id: "entertainment" },
    { img: "/Flower-img.png", name: "Event Planners", id: "planners" },
    { img: "/Videograpgher-img.png", name: "Videographers", id: "videography" },
    {
      img: "/Decorator-img.png",
      name: "Decorators / Floral Designers",
      id: "venue",
    },
    { img: "/Artist-img.png", name: "Makeup Artists", id: "makeup" },
    // {
    //   img: "/Transport-img.png",
    //   name: "Transportation & Chauffeur Services",
    //   id: "transport",
    // },
    {
      img: "/Technician-img.png",
      name: "Sound & Lighting Technicians",
      id: "technical",
    },
  ];

  return (
    <section className="bg-white w-full">
      <div className="container max-w-6xl mx-auto py-10 px-4 flex flex-col space-y-8">
        <p className="font-semibold text-lg ml-2 md:ml-0">Browse By Category</p>

        {/* Cards container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12 justify-items-center">
          {vendors.map((vendor, index) => (
            <Link
              href={`/search?category=${vendor.id}`}
              key={index}
              className="flex flex-col items-center space-y-2 group cursor-pointer"
            >
              <Image
                src={vendor.img}
                alt={vendor.name}
                width={200}
                height={200}
                className="rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <p className="font-normal text-xs text-[#4F4F4F] max-w-[80%] text-center group-hover:text-primary transition-colors">
                {vendor.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
