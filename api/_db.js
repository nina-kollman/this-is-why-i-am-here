import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

export function countSentences(t) {
  return (t || '').split(/[.!?…]+/).map(x => x.trim()).filter(Boolean).length;
}
