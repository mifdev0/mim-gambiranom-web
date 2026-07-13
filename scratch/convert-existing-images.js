const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
let sharp;

try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: "sharp" library is not installed yet. Please wait for npm install to finish.');
  process.exit(1);
}

// 1. Load env variables from .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('Initializing Supabase client...');
console.log('URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to download image to buffer
async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}. Status: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper to convert buffer to WebP buffer
async function convertToWebpBuffer(buffer) {
  return await sharp(buffer)
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

// Helper to upload WebP buffer to Supabase Storage
async function uploadToSupabase(buffer, folder, originalFilename) {
  const rand = Math.random().toString(36).substring(2);
  const cleanName = path.basename(originalFilename, path.extname(originalFilename));
  const storagePath = `${folder}/${cleanName}_${rand}.webp`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(storagePath, buffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(storagePath);

  return publicUrlData.publicUrl;
}

// Main migration runner
async function run() {
  console.log('\n--- STARTING WEBP CONVERSION FOR EXISTING IMAGES ---');

  // --- 1. HERO SETTINGS ---
  console.log('\nProcessing table "hero_settings"...');
  const { data: heroRows, error: heroError } = await supabase.from('hero_settings').select('*');
  if (heroError) {
    console.error('Error fetching hero_settings:', heroError);
  } else if (heroRows) {
    for (const row of heroRows) {
      const updates = {};
      const imageFields = ['image_url', 'hero_image_main', 'hero_image_float1', 'hero_image_float2'];

      for (const field of imageFields) {
        const url = row[field];
        if (url && url.startsWith('http') && !url.toLowerCase().endsWith('.webp')) {
          console.log(`Converting hero_settings [id=${row.id}] field "${field}": ${url}`);
          try {
            const buffer = await downloadImage(url);
            const webpBuffer = await convertToWebpBuffer(buffer);
            const newUrl = await uploadToSupabase(webpBuffer, 'hero', url);
            updates[field] = newUrl;
            console.log(`Success! Converted to: ${newUrl}`);
          } catch (e) {
            console.error(`Failed to convert ${url}:`, e.message);
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('hero_settings')
          .update(updates)
          .eq('id', row.id);
        if (updateError) {
          console.error(`Failed to update hero_settings row [id=${row.id}]:`, updateError);
        } else {
          console.log(`Updated database row [id=${row.id}] successfully!`);
        }
      }
    }
  }

  // --- 2. PROGRAMS (EKSTRAKURIKULER) ---
  console.log('\nProcessing table "programs" (Ekstrakurikuler)...');
  const { data: progRows, error: progError } = await supabase.from('programs').select('*');
  if (progError) {
    console.error('Error fetching programs:', progError);
  } else if (progRows) {
    for (const row of progRows) {
      const url = row.image_url;
      if (url && url.startsWith('http') && !url.toLowerCase().endsWith('.webp')) {
        console.log(`Converting programs [id=${row.id}] "image_url": ${url}`);
        try {
          const buffer = await downloadImage(url);
          const webpBuffer = await convertToWebpBuffer(buffer);
          const newUrl = await uploadToSupabase(webpBuffer, 'programs', url);

          const { error: updateError } = await supabase
            .from('programs')
            .update({ image_url: newUrl })
            .eq('id', row.id);

          if (updateError) {
            console.error(`Failed to update program row [id=${row.id}]:`, updateError);
          } else {
            console.log(`Success! Converted to: ${newUrl}`);
          }
        } catch (e) {
          console.error(`Failed to convert ${url}:`, e.message);
        }
      }
    }
  }

  // --- 3. PRESTASI ---
  console.log('\nProcessing table "prestasi"...');
  const { data: prestRows, error: prestError } = await supabase.from('prestasi').select('*');
  if (prestError) {
    console.error('Error fetching prestasi:', prestError);
  } else if (prestRows) {
    for (const row of prestRows) {
      const url = row.image_url;
      if (url && url.startsWith('http') && !url.toLowerCase().endsWith('.webp')) {
        console.log(`Converting prestasi [id=${row.id}] "image_url": ${url}`);
        try {
          const buffer = await downloadImage(url);
          const webpBuffer = await convertToWebpBuffer(buffer);
          const newUrl = await uploadToSupabase(webpBuffer, 'prestasi', url);

          const { error: updateError } = await supabase
            .from('prestasi')
            .update({ image_url: newUrl })
            .eq('id', row.id);

          if (updateError) {
            console.error(`Failed to update prestasi row [id=${row.id}]:`, updateError);
          } else {
            console.log(`Success! Converted to: ${newUrl}`);
          }
        } catch (e) {
          console.error(`Failed to convert ${url}:`, e.message);
        }
      }
    }
  }

  // --- 4. GURU ---
  console.log('\nProcessing table "guru"...');
  const { data: guruRows, error: guruError } = await supabase.from('guru').select('*');
  if (guruError) {
    console.error('Error fetching guru:', guruError);
  } else if (guruRows) {
    for (const row of guruRows) {
      const url = row.photo_url;
      if (url && url.startsWith('http') && !url.toLowerCase().endsWith('.webp')) {
        console.log(`Converting guru [id=${row.id}] "photo_url": ${url}`);
        try {
          const buffer = await downloadImage(url);
          const webpBuffer = await convertToWebpBuffer(buffer);
          const newUrl = await uploadToSupabase(webpBuffer, 'guru', url);

          const { error: updateError } = await supabase
            .from('guru')
            .update({ photo_url: newUrl })
            .eq('id', row.id);

          if (updateError) {
            console.error(`Failed to update guru row [id=${row.id}]:`, updateError);
          } else {
            console.log(`Success! Converted to: ${newUrl}`);
          }
        } catch (e) {
          console.error(`Failed to convert ${url}:`, e.message);
        }
      }
    }
  }

  console.log('\n--- WEBP CONVERSION COMPLETED ---');
}

run();
