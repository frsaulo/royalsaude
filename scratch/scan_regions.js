import pkg from 'pg';
import { parse } from 'pg-connection-string';
const { Client } = pkg;

const regions = [
  'sa-east-1',      // São Paulo
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'ca-central-1',   // Canada Central
  'eu-west-1',      // Ireland
  'eu-west-2',      // London
  'eu-west-3',      // Paris
  'eu-central-1',   // Frankfurt
  'eu-north-1',     // Stockholm
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'ap-south-1'      // Mumbai
];

const tenant = 'bxkwonqrflctvbjskhmj';
const password = 'Vnq3wB5ocsMQJW5d';

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const connectionString = `postgresql://postgres.${tenant}:${password}@${host}:6543/postgres?sslmode=require`;
  
  const config = parse(connectionString);
  config.ssl = { rejectUnauthorized: false };
  config.connectionTimeoutMillis = 5000;
  
  const client = new Client(config);
  try {
    await client.connect();
    await client.end();
    return { region, success: true, msg: 'Connected successfully!' };
  } catch (error) {
    return { region, success: false, msg: error.message || error.toString() };
  }
}

async function run() {
  console.log(`Starting concurrent scan of ${regions.length} regions for tenant: ${tenant}...`);
  const promises = regions.map(r => testRegion(r));
  const results = await Promise.all(promises);
  
  console.log('\n--- SCAN RESULTS ---');
  for (const res of results) {
    if (res.success) {
      console.log(`🚀 [SUCCESS] ${res.region}: ${res.msg}`);
    } else {
      const isNotFound = res.msg.toLowerCase().includes('not found');
      const isAuthFailed = res.msg.toLowerCase().includes('password authentication failed') || res.msg.toLowerCase().includes('autenticação');
      
      if (isAuthFailed) {
        console.log(`🔑 [FOUND REGION] ${res.region}: ${res.msg} (Password likely wrong but region is CORRECT)`);
      } else if (isNotFound) {
        // Apenas imprime de forma curta para não poluir
        console.log(`❌ [NOT FOUND] ${res.region}`);
      } else {
        console.log(`⚠️ [ERROR] ${res.region}: ${res.msg}`);
      }
    }
  }
  console.log('\nScan complete.');
}

run().catch(console.error);
