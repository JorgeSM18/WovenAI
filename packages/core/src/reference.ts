// Reference data shared across features (seeded, read-only for users).
export type Category = {
  id: string;
  name: string;
};

export type Color = {
  id: string;
  name: string;
  hex: string;
};

export type Season = 'spring' | 'summer' | 'fall' | 'winter';
