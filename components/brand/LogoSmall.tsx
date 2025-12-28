import Image from "next/image";
import Link from "next/link";
import React from "react";

type LogoSmallProps = {
  url?: string;
  className?: string;
};

const LogoSmall: React.FC<LogoSmallProps> = ({
  url = "/assets/svg/logo-small.svg",
  className,
}) => {
  return (
    <Link href="/" className={className}>
      <Image src={url} alt="Momentev logo" width={40} height={40} />
    </Link>
  );
};

export default LogoSmall;
