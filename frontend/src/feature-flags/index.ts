import { Feature } from "./types";

const featuresMap: Record<Feature, boolean> = {
  jobDefinitions: process.env.NEXT_PUBLIC_INTERNAL === 'true'
}

export function isFeatureEnabled(feature: Feature) {
  return featuresMap[feature] || false;
}