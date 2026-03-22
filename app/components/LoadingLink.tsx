"use client";

import Link, { LinkProps } from "next/link";
import { MouseEvent, PropsWithChildren } from "react";
import { useNavigationLoader } from "@/app/components/NavigationLoaderProvider";

type LoadingLinkProps = PropsWithChildren<
  LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
>;

export default function LoadingLink({
  children,
  onClick,
  ...props
}: LoadingLinkProps) {
  const { startLoading } = useNavigationLoader();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    startLoading();
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}