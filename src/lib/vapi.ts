"use client";

import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export function getVapi(): Vapi {
  if (!vapiInstance) {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error(
        "NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set. Please add it to .env.local"
      );
    }
    vapiInstance = new Vapi(publicKey);
  }
  return vapiInstance;
}

export function resetVapi() {
  vapiInstance = null;
}

export default getVapi;
