export interface Bonus { id: number; bonus: string }
export interface Feature { id: number; feature: string }
export interface Payment { id: number; payment: string; payment_link: string | null }

export interface Casino {
  casino_id: number;
  title: string;
  link: string;
  logo_img: string | null;
  casino_rate: number;
  bonuses: Bonus[];
  features: Feature[];
  payments: Payment[];
}

export interface Theme {
  header_title: string;
  header_brand: string;
  tagline: string;
  pills: string[];
  badges: string[];
  logo_url: string | null;
  accent_color: string;
  bg_color: string;
  card_from: string;
  card_to: string;
  button_text: string;
  button_primary: string;
  button_secondary: string;
  card_variant: "classic" | "compact" | "split";
  card_radius: number;
  badge_style: "bar" | "corner";
  pill_shape: "pill" | "square";
  show_logo: boolean;
  show_payments: boolean;
}
