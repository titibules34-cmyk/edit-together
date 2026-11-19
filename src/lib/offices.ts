export type Office = {
  /** Two-letter country tag shown in the footer address chips. */
  badge: string;
  /** Country name shown in the office badges. */
  country: string;
  /** Label printed above the street address. */
  role: string;
  /** Full postal address, exactly as visitors should see it. */
  address: string;
};

export const OFFICES: Office[] = [
  {
    badge: "UK",
    country: "United Kingdom",
    role: "Official Registered Address",
    address: "Unit A1008, 4-6 Greatorex Street, London, United Kingdom, E1 5NF",
  },
  {
    badge: "CA",
    country: "Canada",
    role: "North American Office",
    address: "1381 Regent St, Fredericton, NB E3C 1A2, Canada",
  },
];
