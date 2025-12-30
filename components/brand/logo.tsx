import Image from "next/image";
import Link from "next/link";
import React from "react";

type LogoProps = {
  url?: string;
  className?: string;
};

const Logo: React.FC<LogoProps> = ({
  url = "/assets/svg/logo.svg",
  className,
}) => {
  return (
    <Link href="/" className={className}>
      <Image src={url} alt="Momentev logo" width={160} height={40} />
    </Link>
  );
};

export default Logo;
