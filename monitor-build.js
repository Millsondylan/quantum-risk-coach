#!/usr/bin/env node

/**
 * Monitor GitHub Actions build status for APK generation
 */

const https = require('https');

const REPO_OWNER = 'Millsondylan';
const REPO_NAME = 'quantum-risk-coach';
const WORKFLOW_NAME = 'build-apk.yml';

function checkWorkflowRuns() {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?workflow_id=${WORKFLOW_NAME}&per_page=5`,
    method: 'GET',
    headers: {
      'User-Agent': 'Quantum-Risk-Coach-Build-Monitor',
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const runs = JSON.parse(data);
        console.log('🔍 Checking GitHub Actions build status...\n');
        
        if (runs.workflow_runs && runs.workflow_runs.length > 0) {
          const latestRun = runs.workflow_runs[0];
          
          console.log(`📋 Latest Build Run:`);
          console.log(`   ID: ${latestRun.id}`);
          console.log(`   Status: ${latestRun.status}`);
          console.log(`   Conclusion: ${latestRun.conclusion || 'pending'}`);
          console.log(`   Created: ${new Date(latestRun.created_at).toLocaleString()}`);
          console.log(`   Updated: ${new Date(latestRun.updated_at).toLocaleString()}`);
          console.log(`   URL: ${latestRun.html_url}`);
          
          if (latestRun.status === 'completed') {
            if (latestRun.conclusion === 'success') {
              console.log('\n🎉 Build completed successfully!');
              console.log('📱 APK files should be available in the release.');
              console.log(`🔗 Release URL: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases`);
              console.log(`📥 Download APK: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`);
            } else {
              console.log('\n❌ Build failed!');
              console.log(`🔗 Check details: ${latestRun.html_url}`);
            }
          } else if (latestRun.status === 'in_progress') {
            console.log('\n⏳ Build is currently running...');
            console.log('Please wait for completion.');
          } else {
            console.log('\n⏸️ Build is queued or waiting...');
          }
        } else {
          console.log('❌ No workflow runs found');
        }
      } catch (error) {
        console.error('Error parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error checking workflow runs:', error.message);
  });

  req.end();
}

// Check immediately
checkWorkflowRuns();

// Check every 30 seconds
setInterval(checkWorkflowRuns, 30000);

console.log('🔄 Monitoring build status every 30 seconds...');
console.log('Press Ctrl+C to stop monitoring\n'); 