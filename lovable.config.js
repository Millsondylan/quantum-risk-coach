module.exports = {
  projectName: 'Quantum Risk Coach',
  framework: 'React',
  buildTool: 'Vite',
  primaryLanguage: 'TypeScript',
  deployment: {
    type: 'SPA',
    buildCommand: 'npm run build',
    devCommand: 'npm run dev',
    outputDirectory: 'dist'
  },
  features: [
    'Mobile Development',
    'AI Integration',
    'Supabase Authentication',
    'Real-time Trading',
    'Performance Analytics'
  ],
  integrations: [
    'Supabase',
    'OpenAI',
    'Groq',
    'Binance API',
    'Socket.io'
  ],
  migrationNotes: {
    recommendedNextSteps: [
      'Consider migrating to Next.js',
      'Prepare for App Router conversion',
      'Review and update GitHub Actions if applicable'
    ]
  }
}; 