import Image from "next/image";

export default function StartEvent() {
  return (
    <section>
     <div className="flex ">

      <div>
       <div className="bg-primary w-121 h-97">
         <div className="flex items-center justify-center pt-5  ">
            <Image
            src="/Book-img.png"
            alt="rectangle image"
            width={400}
            height={200}
            className=" "
                    />
         </div>
         <div>

         </div>
       </div>
      </div>
     </div>

    </section>

  )
}