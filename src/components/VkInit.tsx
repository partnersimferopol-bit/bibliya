"use client";

import { useEffect } from "react";
import { initVkBridge } from "@/lib/vk/vkBridge";

export default function VkInit() {
  useEffect(() => {
    void initVkBridge();
  }, []);

  return null;
}
