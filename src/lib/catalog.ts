/**
 * Options for the booking form.
 *
 * PLACEHOLDER DATA — replace with the real branches and the brands/models the
 * workshop services. Later this will come from the database (admin-managed).
 */

export type Branch = { id: string; name: string };

export const BRANCHES: Branch[] = [
  { id: "main", name: "Main Branch" },
  { id: "north", name: "North Branch" },
  { id: "south", name: "South Branch" },
];

export const BIKE_CATALOG: Record<string, string[]> = {
  Bajaj: ["Pulsar 150", "Pulsar NS200", "Pulsar N250", "Dominar 400", "Avenger Street 160"],
  Hero: ["Splendor Plus", "HF Deluxe", "Glamour", "Xtreme 160R", "Passion Pro"],
  Honda: ["Shine 125", "Unicorn", "SP 125", "Hornet 2.0", "CB350"],
  KTM: ["Duke 200", "Duke 250", "Duke 390", "RC 200"],
  "Royal Enfield": ["Classic 350", "Bullet 350", "Hunter 350", "Meteor 350", "Himalayan"],
  Suzuki: ["Gixxer", "Gixxer SF", "Access 125", "Burgman Street"],
  TVS: ["Apache RTR 160", "Apache RTR 200", "Raider 125", "Jupiter", "Ntorq 125"],
  Yamaha: ["FZ-S", "R15 V4", "MT-15", "Fascino 125"],
};

export const BRANDS = Object.keys(BIKE_CATALOG);
