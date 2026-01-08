import Image from "next/image";
import Link from "next/link";
import React from "react";

type LogoSmallProps = {
  url?: string;
  className?: string;
  size?: number;
};

const LogoSmall: React.FC<LogoSmallProps> = ({
  url = "/assets/svg/logo-small.svg",
  className,
  size = 40,
}) => {
  return (
    <Link href="/" className={className}>
      <Image src={url} alt="Momentev logo" width={size} height={size} />
    </Link>
  );
};

export default LogoSmall;
