"use client";

import { useEffect } from "react";
import { initVkBridge, resizeVkWindow } from "@/lib/vk/vkBridge";

export default function VkInit() {
  useEffect(() => {
    void initVkBridge();
    const onResize = () => void resizeVkWindow();
    window.addEventListener("resize", onResize);
    const t1 = window.setTimeout(onResize, 300);
    const t2 = window.setTimeout(onResize, 1200);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return null;
}
