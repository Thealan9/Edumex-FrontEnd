export interface AdminDashboardResponse {
  stats: {
    users: number;
    active_users: number;
    services: number;
    income_month: number;
  };
  recent_activity: {
    message: string;
  }[];
}
