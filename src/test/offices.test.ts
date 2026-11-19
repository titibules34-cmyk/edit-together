import { describe, expect, it } from "vitest";

import { OFFICES } from "@/lib/offices";

describe("Office locations", () => {
  const addresses = OFFICES.map((office) => office.address);

  it("lists the Fredericton office as a location", () => {
    expect(addresses).toContain("1381 Regent St, Fredericton, NB E3C 1A2, Canada");
  });

  it("keeps the London registered address as a location", () => {
    expect(addresses).toContain("Unit A1008, 4-6 Greatorex Street, London, United Kingdom, E1 5NF");
  });
});
