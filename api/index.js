import { createServer } from '../dist/index.js';

export default async function handler(req, res) {
  const server = await createServer();
  return server(req, res);
}

