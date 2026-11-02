import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

export type BirdDetails = {
  id: string;
  name: string;
  scientific: string;
  authority?: string;
  order: string;
  family: string;
  genus: string;
  region?: string;
  range?: {
    breedingRegion?: string;
    breeding?: string;
    nonbreeding?: string;
    "zh-Hans"?: string;
  };
  names?: Record<string, string | null>;
  traits?: {
    massG?: number;
    wingMm?: number;
    tailMm?: number;
    tarsusMm?: number;
    beakCulmenMm?: number;
    beakWidthMm?: number;
    beakDepthMm?: number;
    handWingIndex?: number;
    habitat?: string;
    habitatDensity?: number;
    migration?: string;
    trophicLevel?: string;
    trophicNiche?: string;
    primaryLifestyle?: string;
  };
  conservation?: {
    iucn?: string;
    cites?: string;
    chinaProtection?: string;
  };
  subspecies?: Array<{ name: string; authority?: string; range?: string }>;
  ids?: {
    wikidata?: string;
    ebird?: string;
    gbif?: string;
    inaturalist?: number;
  };
  path: string;
  kind?: string;
  score?: number;
  quality?: boolean;
  reference?: {
    type?: string;
    page?: string;
    author?: string;
    license?: string;
  };
};

type BirdFile = { species: BirdDetails[] };

let birdList: BirdDetails[] | undefined;
let birdLookup: Map<string, BirdDetails> | undefined;

export function getBirds() {
  if (!birdList) {
    const file = readFileSync(join(process.cwd(), "public", "data", "birds.json"), "utf8");
    birdList = (JSON.parse(file) as BirdFile).species;
    birdLookup = new Map(birdList.map((bird) => [bird.id, bird]));
  }
  return birdList;
}

export function getBirdById(id: string) {
  getBirds();
  return birdLookup?.get(id);
}

export function getBirdNeighbors(id: string) {
  const birds = getBirds();
  const index = birds.findIndex((bird) => bird.id === id);
  if (index < 0) return {};
  return {
    previous: index > 0 ? birds[index - 1] : birds[birds.length - 1],
    next: index < birds.length - 1 ? birds[index + 1] : birds[0],
  };
}

const regionNames: Record<string, string> = {
  AF: "Africa",
  AN: "Antarctica",
  AU: "Australasia",
  NA: "North America",
  NT: "Neotropics",
  OR: "South & Southeast Asia",
  PAL: "Europe, North Africa & temperate Asia",
  PO: "Pacific Ocean",
  AO: "Atlantic Ocean",
  IO: "Indian Ocean",
  SO: "Southern Ocean",
};

export function describeRegion(region?: string) {
  if (!region) return "Range not listed";
  return regionNames[region] ?? region.replace(/\b(PAL|AF|AN|AU|NA|NT|OR|PO|AO|IO|SO)\b/g, (code) => regionNames[code] ?? code);
}

const conservationLabels: Record<string, string> = {
  EX: "Extinct",
  EW: "Extinct in the wild",
  CR: "Critically endangered",
  EN: "Endangered",
  VU: "Vulnerable",
  NT: "Near threatened",
  LC: "Least concern",
  DD: "Data deficient",
  NE: "Not evaluated",
};

export function describeConservation(code?: string) {
  if (!code) return "Not listed";
  return conservationLabels[code] ?? code;
}
