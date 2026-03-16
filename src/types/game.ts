export interface Game {
  id: number;
  appId: number;
  title: string;
  headerUrl: string;
  coverUrl: string;
  steamUrl: string;
  finalPrice: string;
  initialPrice?: string;
  onSale: boolean;
  votes: number;
}

export interface DbGame {
  id: number;
  appId: number;
  votes: number;
  title?: string;
  headerUrl?: string;
  coverUrl?: string;
  steamUrl?: string;
  finalPrice?: string;
  initialPrice?: string;
  onSale: boolean;
}
