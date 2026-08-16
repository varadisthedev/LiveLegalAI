export const RISK_LEVELS = ["Low", "Moderate", "High", "Unknown"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_LEVEL_STYLES: Record<
  RiskLevel,
  { label: string; badgeClass: string; dotClass: string }
> = {
  Low: {
    label: "Low Risk",
    badgeClass: "bg-risk-low/15 text-risk-low border-risk-low/30",
    dotClass: "bg-risk-low",
  },
  Moderate: {
    label: "Moderate Risk",
    badgeClass: "bg-risk-moderate/15 text-risk-moderate border-risk-moderate/30",
    dotClass: "bg-risk-moderate",
  },
  High: {
    label: "High Risk",
    badgeClass: "bg-risk-high/15 text-risk-high border-risk-high/30",
    dotClass: "bg-risk-high",
  },
  Unknown: {
    label: "Unknown",
    badgeClass: "bg-risk-unknown/15 text-risk-unknown border-risk-unknown/30",
    dotClass: "bg-risk-unknown",
  },
};

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  upload: "/upload",
  history: "/history",
  settings: "/settings",
  analysis: (documentId: string) => `/analysis/${documentId}`,
  chat: (id: string) => `/chat/${id}`,
} as const;
