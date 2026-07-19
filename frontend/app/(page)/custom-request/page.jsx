"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomRequestPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/product-request");
  }, [router]);
  return null;
}
