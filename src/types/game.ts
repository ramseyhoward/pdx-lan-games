export interface Game {
  id: number;
  appId: number;
  title: string;
  headerUrl: string;
  coverUrl: string;
  steamUrl: string;
  price: string;
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
  price?: string;
}
