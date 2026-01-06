export interface Node {
  id: string;
  ip: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  max_capacity: string; // Ex: "10 GB"
  used_capacity: number; // Ex: 2.5
  is_full: boolean;
}

export interface User {
  username: string;
  role: "ADMIN" | "USER";
  isAuthenticated: boolean;
}