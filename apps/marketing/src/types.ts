export interface TrafficSource {
  id: string;
  name: string;
  icon: string; // From lucide-react names or custom identifiers
  description: string;
  volume: string; // e.g. "1.5M+ daily"
  ctr: string; // e.g. "4.2%"
  roi: string; // e.g. "120-180%"
  color: string; // Color key for theme accents (e.g., 'rose', 'blue', etc.)
  keyFeatures: string[];
  conversionTrend: number[]; // Sparkline data values
}

export interface StatMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  description: string;
}

export interface UserLead {
  id: string;
  name: string;
  telegram: string;
  offerType: string;
  budget: string;
  message: string;
  createdAt: string;
}

export interface CaseStudy {
  id: string;
  vertical: string;
  source: string;
  roi: string;
  conversions: string;
  duration: string;
  description: string;
}
