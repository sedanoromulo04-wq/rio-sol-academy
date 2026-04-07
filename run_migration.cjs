const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const defaultConnectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  'postgresql://postgres:Romulobolado%401@db.ufzzvdvhijvlmnemygoj.supabase.co:5432/postgres'

function getMigrationPath() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations')
  const explicitArg = process.argv[2]

  if (explicitArg) {
    return path.isAbsolute(explicitArg) ? explicitArg : path.join(__dirname, explicitArg)
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  if (!migrationFiles.length) {
    throw new Error('Nenhuma migration SQL foi encontrada em supabase/migrations.')
  }

  return path.join(migrationsDir, migrationFiles[migrationFiles.length - 1])
}

async function runMigration() {
  const migrationPath = getMigrationPath()
  const sql = fs.readFileSync(migrationPath, 'utf8')
  const client = new Client({
    connectionString: defaultConnectionString,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('Conectando ao Supabase PostgreSQL...')
    await client.connect()
    console.log('Conectado com sucesso!')
    console.log(`Executando migration: ${path.basename(migrationPath)}`)

    await client.query(sql)
    console.log('Migration executada com sucesso!')

    const tablesResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    )
    console.log('\nTabelas publicas:')
    tablesResult.rows.forEach((row) => console.log('  + ' + row.table_name))

    const learningProgressColumns = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'learning_progress'
      ORDER BY ordinal_position
    `)

    if (learningProgressColumns.rows.length) {
      console.log('\nColunas learning_progress:')
      learningProgressColumns.rows.forEach((row) => console.log('  - ' + row.column_name))
    }
  } catch (error) {
    console.error('Erro:', error.message)
    if (error.detail) console.error('Detalhe:', error.detail)
    process.exitCode = 1
  } finally {
    await client.end()
    console.log('\nConexao encerrada.')
  }
}

runMigration()
