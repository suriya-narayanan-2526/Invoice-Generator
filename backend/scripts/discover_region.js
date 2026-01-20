
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const REGIONS = [
    'aws-0-ap-south-1',      // Mumbai
    'aws-0-ap-southeast-1',  // Singapore
    'aws-0-us-east-1',       // N. Virginia
    'aws-0-eu-central-1',    // Frankfurt
    'aws-0-eu-west-1',       // Ireland
    'aws-0-eu-west-2',       // London
    'aws-0-us-west-1',       // California
    'aws-0-us-west-2',       // Oregon
    'aws-0-ap-northeast-1',  // Tokyo
    'aws-0-ap-northeast-2',  // Seoul
    'aws-0-sa-east-1',       // Sao Paulo
    'aws-0-ca-central-1',    // Canada
];

const PROJECT_REF = 'cazmhywurqrsrjwxccqb';
const DB_PASSWORD = 'Suriya@2526';

async function checkRegion(region) {
    const host = `${region}.pooler.supabase.com`;
    console.log(`Checking region: ${region}...`);

    // Object config avoids URL parsing issues
    const pool = new Pool({
        host: host,
        port: 6543, // Transaction mode
        user: `postgres.${PROJECT_REF}`,
        password: DB_PASSWORD,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000
    });

    try {
        const res = await pool.query('SELECT 1');
        console.log(`✅ SUCCESS! Found project in region: ${region}`);
        return region;
    } catch (error) {
        if (error.code === 'XX000' || error.message.includes('Tenant or user not found')) {
            // Wrong region
            return null;
        } else if (error.code === '28P01') {
            console.log(`⚠️  Region ${region} found, but Password Incorrect!`);
            return region; // Found it!
        } else {
            // Network timeout or other error
            // console.log(`   Error: ${error.message}`);
            return null;
        }
    } finally {
        // Force close to speed up
        await pool.end().catch(() => { });
    }
}

async function discover() {
    console.log('🌍 Starting Robust Region Discovery...');

    // Check all regions in parallel? No, valid connection might be rate limited if spamming
    // Sequential is safer
    for (const region of REGIONS) {
        const found = await checkRegion(region);
        if (found) {
            console.log(`\n🎉 MATCH FOUND: ${region}`);
            console.log(`Use this host: ${region}.pooler.supabase.com`);
            return;
        }
    }
    console.log('\n❌ No matching region found. (Double check Project Ref)');
}

discover();
