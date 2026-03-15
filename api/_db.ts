import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
let connected = false;

export async function getCollection() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db('pdxlandata').collection('games');
}