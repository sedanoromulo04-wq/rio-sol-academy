const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Romulobolado%401@db.ufzzvdvhijvlmnemygoj.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Conectando ao Supabase PostgreSQL...');
    await client.connect();
    console.log('Conectado com sucesso!');

    const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20260323134043_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executando migração...');
    await client.query(sql);
    console.log('Migração executada com sucesso!');

    // Verificar tabelas criadas
    const tablesResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('\nTabelas criadas:');
    tablesResult.rows.forEach(row => console.log('  + ' + row.table_name));

    // Verificar contagem de dados seed
    const contentCount = await client.query('SELECT count(*) FROM public.content');
    const settingsCount = await client.query('SELECT count(*) FROM public.system_settings');
    const profilesCount = await client.query('SELECT count(*) FROM public.profiles');
    console.log('\nDados seed:');
    console.log('  content: ' + contentCount.rows[0].count + ' registros');
    console.log('  system_settings: ' + settingsCount.rows[0].count + ' registros');
    console.log('  profiles: ' + profilesCount.rows[0].count + ' registros');

    // Verificar políticas RLS
    const policiesResult = await client.query(
      "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname"
    );
    console.log('\nPoliticas RLS (' + policiesResult.rows.length + '):');
    policiesResult.rows.forEach(row => console.log('  ' + row.tablename + ': ' + row.policyname));

    // Verificar trigger
    const triggerResult = await client.query(
      "SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public' OR event_object_schema = 'auth'"
    );
    console.log('\nTriggers:');
    triggerResult.rows.forEach(row => console.log('  ' + row.trigger_name));

    // Verificar indices
    const indexResult = await client.query(
      "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%' ORDER BY indexname"
    );
    console.log('\nIndices:');
    indexResult.rows.forEach(row => console.log('  ' + row.indexname));

  } catch (error) {
    console.error('Erro:', error.message);
    if (error.detail) console.error('Detalhe:', error.detail);
  } finally {
    await client.end();
    console.log('\nConexao encerrada.');
  }
}

runMigration();
