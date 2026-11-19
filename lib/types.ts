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
  button_fg: string;
  button_fg2: string;
  card_variant: "classic" | "compact" | "split";
  card_radius: number;
  badge_style: "bar" | "corner";
  pill_shape: "pill" | "square";
  show_logo: boolean;
  show_payments: boolean;
  font_heading: string;
  font_body: string;
  heading_size: number;
  badge_position: "tl" | "tr" | "bl" | "br";
  rating_position: "left" | "right";
  button_size: "sm" | "md" | "lg";
  button_align: "left" | "center" | "right";
  button_full: boolean;
  payments_align: "left" | "center" | "right";
  bonus_align: "left" | "center";
  logo_anim: "none" | "pulse" | "float" | "spin" | "glow";
  button_anim: "none" | "pulse" | "glow" | "shine" | "bounce";
  button_icon: string;
  button_icon_pos: "left" | "right";
  button_icon_size: number;
  button_icon_anim: "none" | "spin" | "pulse" | "bounce" | "glow";
}
