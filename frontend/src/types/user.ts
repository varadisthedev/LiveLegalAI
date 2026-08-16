export interface UserProfile {
  id: string;
  email: string;
  name: string;
  provider: "credentials" | "google";
  avatarUrl: string;
  createdAt: string;
}

export interface AccountStats {
  userId: string;
  totalDocuments: number;
  totalChats: number;
  riskBreakdown: {
    high: number;
    moderate: number;
    low: number;
  };
  memberSince: string;
}
