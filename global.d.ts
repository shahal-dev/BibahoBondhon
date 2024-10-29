// global.d.ts
import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

// This file needs to be a module, so export something
export {};
