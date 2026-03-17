import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
let connected = false;

export interface UserDocument {
  steamId: string;
  displayName: string;
  avatarUrl: string;
  profileVisible: boolean;
  ownedGameIds: number[];
  votedGameIds: number[];
}

export async function getGamesCollection() {
  if (!connected) {
    await client.connect();
    connected = true;
    const games = client.db('pdxlandata').collection('games');
    await games.createIndex({ appId: 1 }, { unique: true });
  }
  return client.db('pdxlandata').collection('games');
}

export async function getUsersCollection() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db('pdxlandata').collection<UserDocument>('users');
}