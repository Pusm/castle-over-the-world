#!/usr/bin/env node

const GitHubPagesVerifier = require('./tests/deployment/github-pages-verification.test');
const SelfExpansionVerifier = require('./tests/deployment/self-expansion-verification.test');
const fs = require('fs-extra');

class DeploymentVerificationCLI {
  constructor() {
    this.baseUrl = null;
    this.results = {
      deployment: null,
      expansion: null,
      overall: null
    };
  }

  async run() {
    console.log('🏰 Castles Over The World - Deployment Verification');
    console.log('=================================================');
    
    // Get URL from arguments or environment
    this.baseUrl = process.argv[2] || 
                   process.env.GITHUB_PAGES_URL || 
                   (process.env.GITHUB_USERNAME && `https://${process.env.GITHUB_USERNAME}.github.io/castle-over-the-world`);
    
    if (!this.baseUrl) {
      console.log('❌ No GitHub Pages URL provided.');
      console.log('Usage:');
      console.log('  node verify-deployment.js <URL>');
      console.log('  OR set GITHUB_PAGES_URL environment variable');
      console.log('  OR set GITHUB_USERNAME environment variable');
      console.log('\nExample:');
      console.log('  node verify-deployment.js https://username.github.io/castle-over-the-world');
      process.exit(1);
    }

    console.log(`🔍 Testing deployment at: ${this.baseUrl}\n`);

    try {
      // Step 1: Basic deployment verification
      console.log('📡 Step 1: Basic Deployment Verification');
      console.log('----------------------------------------');
      await this.runBasicVerification();

      // Step 2: Self-expansion system verification
      console.log('\n🔄 Step 2: Self-Expansion System Verification');
      console.log('---------------------------------------------');
      await this.runExpansionVerification();

      // Step 3: Generate comprehensive report
      console.log('\n📊 Step 3: Generating Comprehensive Report');
      console.log('------------------------------------------');
      await this.generateFinalReport();

    } catch (error) {
      console.error('💥 Verification failed:', error.message);
      process.exit(1);
    }
  }

  async runBasicVerification() {
    try {
      const verifier = new GitHubPagesVerifier(this.baseUrl);
      this.results.deployment = await verifier.verifyDeployment();
      
      const { summary } = this.results.deployment;
      console.log(`✅ Tests Passed: ${summary.passed}/${summary.totalTests}`);
      console.log(`📈 Success Rate: ${summary.successRate}`);
      
      if (this.results.deployment.overallStatus === 'FAIL') {
        console.log('⚠️  Some deployment tests failed - see detailed report');
      }
      
    } catch (error) {
      console.log('❌ Basic verification failed:', error.message);
      throw error;
    }
  }

  async runExpansionVerification() {
    try {
      const verifier = new SelfExpansionVerifier(this.baseUrl);
      this.results.expansion = await verifier.verifySelfExpansion();
      
      const { summary, selfExpansionEvidence } = this.results.expansion;
      console.log(`✅ Tests Passed: ${summary.passed}/${summary.totalTests}`);
      console.log(`📈 Success Rate: ${summary.successRate}`);
      console.log(`🔄 System Working: ${selfExpansionEvidence.systemWorking ? 'YES' : 'NO'}`);
      
      if (!selfExpansionEvidence.systemWorking) {
        console.log('⚠️  Self-expansion system issues detected');
        selfExpansionEvidence.recommendedActions.forEach(action => {
          console.log(`   • ${action}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Expansion verification failed:', error.message);
      throw error;
    }
  }

  async generateFinalReport() {
    const timestamp = new Date().toISOString();
    
    // Calculate overall metrics
    const totalTests = (this.results.deployment?.summary.totalTests || 0) + 
                      (this.results.expansion?.summary.totalTests || 0);
    const totalPassed = (this.results.deployment?.summary.passed || 0) + 
                       (this.results.expansion?.summary.passed || 0);
    const totalFailed = totalTests - totalPassed;
    
    const overallSuccessRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
    const deploymentWorking = this.results.deployment?.overallStatus === 'PASS';
    const expansionWorking = this.results.expansion?.selfExpansionEvidence?.systemWorking || false;
    const overallStatus = deploymentWorking && expansionWorking && totalFailed === 0;
    
    this.results.overall = {
      timestamp,
      baseUrl: this.baseUrl,
      summary: {
        totalTests,
        passed: totalPassed,
        failed: totalFailed,
        successRate: `${overallSuccessRate}%`
      },
      status: {
        deploymentWorking,
        expansionWorking,
        overallWorking: overallStatus
      },
      deployment: this.results.deployment,
      expansion: this.results.expansion
    };

    // Save detailed report
    const reportFile = `deployment-verification-${Date.now()}.json`;
    await fs.writeFile(reportFile, JSON.stringify(this.results.overall, null, 2));
    
    // Print summary
    console.log('\n🎯 Final Verification Results');
    console.log('=============================');
    console.log(`📊 Overall Success Rate: ${overallSuccessRate}%`);
    console.log(`🌐 Site Accessible: ${deploymentWorking ? '✅ YES' : '❌ NO'}`);
    console.log(`🔄 Self-Expansion Working: ${expansionWorking ? '✅ YES' : '❌ NO'}`);
    console.log(`🎉 System Ready: ${overallStatus ? '✅ YES' : '❌ NO'}`);
    console.log(`📄 Detailed Report: ${reportFile}`);
    
    if (overallStatus) {
      console.log('\n🎉 Deployment verification successful!');
      console.log('Your Castles Over The World encyclopedia is live and functioning correctly.');
    } else {
      console.log('\n⚠️  Deployment verification found issues:');
      
      if (!deploymentWorking) {
        console.log('   • Basic site functionality problems detected');
      }
      if (!expansionWorking) {
        console.log('   • Self-expansion system not working as expected');
      }
      if (totalFailed > 0) {
        console.log(`   • ${totalFailed} test(s) failed - check detailed report`);
      }
      
      console.log('\nRecommended actions:');
      console.log('   1. Review the detailed report for specific issues');
      console.log('   2. Check GitHub Pages deployment logs');
      console.log('   3. Verify generate-and-grow.js is working locally');
      console.log('   4. Ensure all files were committed and pushed');
    }
    
    // Exit with appropriate code
    process.exit(overallStatus ? 0 : 1);
  }
}

// Run if called directly
if (require.main === module) {
  const cli = new DeploymentVerificationCLI();
  cli.run();
}

module.exports = DeploymentVerificationCLI;