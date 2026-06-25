export const askHeroLaunchMarkets = [
  "Charlotte, NC",
  "Concord, NC",
  "Kannapolis, NC",
  "Davidson, NC",
  "Huntersville, NC",
  "Cornelius, NC",
  "Mooresville, NC",
  "Harrisburg, NC",
  "Matthews, NC",
  "Mint Hill, NC",
  "Pineville, NC",
  "Indian Trail, NC",
  "Waxhaw, NC",
  "Monroe, NC",
  "Gastonia, NC",
  "Belmont, NC",
  "Mount Holly, NC",
  "Denver, NC",
  "Lincolnton, NC",
  "Statesville, NC",
  "Salisbury, NC",
  "Rock Hill, SC",
  "Fort Mill, SC",
  "Tega Cay, SC",
  "Clover, SC",
  "Indian Land, SC",
  "York, SC",
] as const;

export type AskHeroLaunchMarket = (typeof askHeroLaunchMarkets)[number];

export function isAskHeroLaunchMarket(value: string) {
  return askHeroLaunchMarkets.includes(value as AskHeroLaunchMarket);
}
