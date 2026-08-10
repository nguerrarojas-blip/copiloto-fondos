/** Corre las migraciones SQL en orden contra DATABASE_URL.
 * Uso:  npm run migrate   (dentro de la carpeta server/) */
import 'dotenv/config';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', '..', 'db', 'migrations');

async function run(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL');
  const client = new pg.Client({
    connectionString: url,
    ssl: url.includes('localhost') ? undefined : { rejectUnauthorized: false },
  });
  await client.connect();

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sql = readFileSync(join(migrationsDir, f), 'utf8');
    process.stdout.write(`→ ${f} ... `);
    await client.query(sql);
    console.log('ok');
  }
  await client.end();
  console.log(`Listo: ${files.length} migración(es) aplicada(s).`);
}

run().catch((e) => {
  console.error('Migración falló:', e);
  process.exit(1);
});
