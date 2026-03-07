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

// Shape stored in db.json — metadata fields populated lazily from Steam API
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
