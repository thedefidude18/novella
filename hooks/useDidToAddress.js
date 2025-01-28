import { getAddressFromDid } from "@orbisclub/orbis-sdk/utils";

export function useDidToAddress(did) {
  if (!did) return { address: null, chain: null };
  try {
    const res = getAddressFromDid(did);
    return res;
  } catch (error) {
    console.error("Error getting address from DID:", error);
    return { address: null, chain: null };
  }
}