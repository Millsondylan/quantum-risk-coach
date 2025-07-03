#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function prepareLovableMigration() {
  console.log('🚀 Quantum Risk Coach - Lovable.dev Migration Preparation');
  
  // Check and update key configuration files
  const updates = [
    {
      file: 'tsconfig.json',
      updates: {
        compilerOptions: {
          target: 'es2020',
          module: 'esnext',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          moduleResolution: 'node',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx'
        }
      }
    },
    {
      file: 'vite.config.ts',
      updates: `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
      `
    }
  ];

  updates.forEach(update => {
    const filePath = path.join(process.cwd(), update.file);
    
    try {
      if (typeof update.updates === 'object') {
        // JSON-based updates
        const currentConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const newConfig = { ...currentConfig, ...update.updates };
        fs.writeFileSync(filePath, JSON.stringify(newConfig, null, 2));
      } else {
        // Direct file content replacement
        fs.writeFileSync(filePath, update.updates);
      }
      console.log(`✅ Updated ${update.file}`);
    } catch (error) {
      console.error(`❌ Error updating ${update.file}: ${error.message}`);
    }
  });

  // Generate migration report
  const migrationReport = {
    timestamp: new Date().toISOString(),
    status: 'Preparation Complete',
    recommendedActions: [
      'Review and test application thoroughly',
      'Backup current project before migration',
      'Verify all dependencies are compatible',
      'Test build and deployment processes'
    ]
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'lovable-migration-report.json'), 
    JSON.stringify(migrationReport, null, 2)
  );

  console.log('🏁 Migration Preparation Complete. Check lovable-migration-report.json for details.');
}

prepareLovableMigration(); 