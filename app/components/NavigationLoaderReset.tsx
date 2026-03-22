"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavigationLoader } from "@/app/components/NavigationLoaderProvider";

export default function NavigationLoaderReset() {
  const pathname = usePathname();
  const { stopLoading } = useNavigationLoader();

  useEffect(() => {
    stopLoading();
  }, [pathname, stopLoading]);

  return null;
}