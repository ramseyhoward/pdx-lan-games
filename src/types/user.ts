export interface User {
  steamId: string;
  displayName: string;
  avatarUrl: string;
  ownedGameIds: number[];
  votedGameIds: number[];
}