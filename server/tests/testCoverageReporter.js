/**
 * Test Coverage Analysis and Metrics Generation
 * Generates comprehensive testing coverage reports for UNIBEN AI Assistant
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestCoverageReporter {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
    this.reportsDir = path.join(this.projectRoot, 'test-reports');
    this.coverageDir = path.join(this.projectRoot, 'coverage');
  }

  /**
   * Initialize reports directory
   */
  initializeReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
    if (!fs.existsSync(this.coverageDir)) {
      fs.mkdirSync(this.coverageDir, { recursive: true });
    }
  }

  /**
   * Run tests with coverage
   */
  async runTestsWithCoverage() {
    console.log('Running tests with coverage analysis...');
    
    try {
      // Run Jest with coverage
      execSync('npm test -- --coverage --coverageDirectory=coverage --coverageReporters=html --coverageReporters=json --coverageReporters=text', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });
      
      console.log('Coverage analysis completed successfully!');
      return true;
    } catch (error) {
      console.error('Error running tests with coverage:', error.message);
      return false;
    }
  }

  /**
   * Analyze coverage data
   */
  analyzeCoverageData() {
    const coverageFile = path.join(this.coverageDir, 'coverage-final.json');
    
    if (!fs.existsSync(coverageFile)) {
      console.warn('Coverage file not found. Run tests with coverage first.');
      return null;
    }

    const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    
    const analysis = {
      total: {
        lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
        statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
        functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
        branches: { total: 0, covered: 0, skipped: 0, pct: 0 }
      },
      byFile: {},
      summary: {
        lowCoverage: [],
        mediumCoverage: [],
        highCoverage: [],
        excellentCoverage: []
      }
    };

    // Process coverage data
    for (const [filePath, fileData] of Object.entries(coverageData)) {
      if (fileData.total) {
        const fileName = path.basename(filePath);
        analysis.byFile[fileName] = {
          lines: fileData.lines,
          statements: fileData.statements,
          functions: fileData.functions,
          branches: fileData.branches,
          path: filePath
        };

        // Add to totals
        this.addToTotals(analysis.total, fileData.total);

        // Categorize by coverage level
        const avgCoverage = this.calculateAverageCoverage(fileData.total);
        if (avgCoverage < 60) {
          analysis.summary.lowCoverage.push({ file: fileName, coverage: avgCoverage });
        } else if (avgCoverage < 80) {
          analysis.summary.mediumCoverage.push({ file: fileName, coverage: avgCoverage });
        } else if (avgCoverage < 95) {
          analysis.summary.highCoverage.push({ file: fileName, coverage: avgCoverage });
        } else {
          analysis.summary.excellentCoverage.push({ file: fileName, coverage: avgCoverage });
        }
      }
    }

    return analysis;
  }

  /**
   * Add file coverage to totals
   */
  addToTotals(total, fileData) {
    total.lines.total += fileData.lines.total;
    total.lines.covered += fileData.lines.covered;
    total.lines.skipped += fileData.lines.skipped;
    
    total.statements.total += fileData.statements.total;
    total.statements.covered += fileData.statements.covered;
    total.statements.skipped += fileData.statements.skipped;
    
    total.functions.total += fileData.functions.total;
    total.functions.covered += fileData.functions.covered;
    total.functions.skipped += fileData.functions.skipped;
    
    total.branches.total += fileData.branches.total;
    total.branches.covered += fileData.branches.covered;
    total.branches.skipped += fileData.branches.skipped;
  }

  /**
   * Calculate average coverage percentage
   */
  calculateAverageCoverage(total) {
    const coverages = [];
    if (total.lines.total > 0) coverages.push((total.lines.covered / total.lines.total) * 100);
    if (total.statements.total > 0) coverages.push((total.statements.covered / total.statements.total) * 100);
    if (total.functions.total > 0) coverages.push((total.functions.covered / total.functions.total) * 100);
    if (total.branches.total > 0) coverages.push((total.branches.covered / total.branches.total) * 100);
    
    return coverages.length > 0 ? 
      coverages.reduce((sum, cov) => sum + cov, 0) / coverages.length : 0;
  }

  /**
   * Generate coverage summary report
   */
  generateCoverageReport(analysis) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        overallCoverage: {
          lines: `${analysis.total.lines.pct.toFixed(2)}%`,
          statements: `${analysis.total.statements.pct.toFixed(2)}%`,
          functions: `${analysis.total.functions.pct.toFixed(2)}%`,
          branches: `${analysis.total.branches.pct.toFixed(2)}%`,
          average: this.calculateAverageCoverage(analysis.total).toFixed(2) + '%'
        },
        totals: {
          lines: {
            total: analysis.total.lines.total,
            covered: analysis.total.lines.covered,
            uncovered: analysis.total.lines.total - analysis.total.lines.covered
          },
          statements: {
            total: analysis.total.statements.total,
            covered: analysis.total.statements.covered,
            uncovered: analysis.total.statements.total - analysis.total.statements.covered
          },
          functions: {
            total: analysis.total.functions.total,
            covered: analysis.total.functions.covered,
            uncovered: analysis.total.functions.total - analysis.total.functions.covered
          },
          branches: {
            total: analysis.total.branches.total,
            covered: analysis.total.branches.covered,
            uncovered: analysis.total.branches.total - analysis.total.branches.covered
          }
        },
        fileCoverage: {
          low: analysis.summary.lowCoverage,
          medium: analysis.summary.mediumCoverage,
          high: analysis.summary.highCoverage,
          excellent: analysis.summary.excellentCoverage
        },
        recommendations: this.generateRecommendations(analysis)
      }
    };

    return report;
  }

  /**
   * Generate recommendations based on coverage analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    const avgCoverage = this.calculateAverageCoverage(analysis.total);
    
    if (avgCoverage < 70) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Overall Coverage',
        message: 'Overall coverage is below 70%. Focus on writing tests for critical functionality.',
        action: 'Increase test coverage to at least 80% for reliable code quality.'
      });
    }

    if (analysis.summary.lowCoverage.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Low Coverage Files',
        message: `Found ${analysis.summary.lowCoverage.length} files with coverage below 60%.`,
        action: 'Prioritize adding tests for these files: ' + 
               analysis.summary.lowCoverage.map(f => f.file).join(', ')
      });
    }

    if (analysis.total.branches.covered / analysis.total.branches.total < 0.8) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Branch Coverage',
        message: 'Branch coverage is below 80%. Many conditional paths are not tested.',
        action: 'Add tests for different code paths and conditional logic.'
      });
    }

    if (analysis.total.functions.covered / analysis.total.functions.total < 0.9) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Function Coverage',
        message: 'Function coverage is below 90%. Some functions are not tested.',
        action: 'Ensure all public functions have corresponding test cases.'
      });
    }

    return recommendations;
  }

  /**
   * Generate test execution report
   */
  generateTestExecutionReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testFiles: [],
      summary: {
        totalFiles: 0,
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        totalDuration: 0,
        successRate: 0
      }
    };

    // Look for test results in different possible locations
    const resultFiles = [
      path.join(this.projectRoot, 'test-results.json'),
      path.join(this.projectRoot, 'junit.xml'),
      path.join(this.reportsDir, 'test-results.json')
    ];

    for (const resultFile of resultFiles) {
      if (fs.existsSync(resultFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
          if (data.testResults) {
            report.testFiles = data.testResults;
          }
        } catch (error) {
          // Try to parse as XML if JSON fails
          try {
            const xmlData = fs.readFileSync(resultFile, 'utf8');
            report.testFiles = this.parseJunitXml(xmlData);
          } catch (xmlError) {
            console.warn(`Could not parse test results file: ${resultFile}`);
          }
        }
        break;
      }
    }

    // Calculate summary if we have test results
    if (report.testFiles.length > 0) {
      report.testFiles.forEach(file => {
        report.summary.totalFiles += 1;
        report.summary.totalTests += file.assertionResults?.length || 0;
        report.summary.totalPassed += file.assertionResults?.filter(r => r.status === 'passed').length || 0;
        report.summary.totalFailed += file.assertionResults?.filter(r => r.status === 'failed').length || 0;
        report.summary.totalSkipped += file.assertionResults?.filter(r => r.status === 'skipped').length || 0;
        report.summary.totalDuration += file.duration || 0;
      });

      report.summary.successRate = report.summary.totalTests > 0 ? 
        (report.summary.totalPassed / report.summary.totalTests * 100).toFixed(2) : 0;
    }

    return report;
  }

  /**
   * Parse JUnit XML format
   */
  parseJunitXml(xmlData) {
    // Simple JUnit XML parsing (basic implementation)
    const testSuites = [];
    const regex = /<testsuite[^>]*>(.*?)<\/testsuite>/gs;
    let match;
    
    while ((match = regex.exec(xmlData)) !== null) {
      const suiteContent = match[1];
      const nameMatch = /name="([^"]*)"/.exec(match[0]);
      const testsMatch = /tests="([^"]*)"/.exec(match[0]);
      const failuresMatch = /failures="([^"]*)"/.exec(match[0]);
      const timeMatch = /time="([^"]*)"/.exec(match[0]);
      
      if (nameMatch) {
        const testCases = [];
        const caseRegex = /<testcase[^>]*\/>/gs;
        let caseMatch;
        
        while ((caseMatch = caseRegex.exec(suiteContent)) !== null) {
          const caseNameMatch = /name="([^"]*)"/.exec(caseMatch[0]);
          const caseTimeMatch = /time="([^"]*)"/.exec(caseMatch[0]);
          const caseStatus = caseMatch[0].includes('failure') ? 'failed' : 'passed';
          
          if (caseNameMatch) {
            testCases.push({
              title: caseNameMatch[1],
              status: caseStatus,
              duration: parseFloat(caseTimeMatch?.[1] || '0') * 1000
            });
          }
        }
        
        testSuites.push({
          name: nameMatch[1],
          assertionResults: testCases,
          duration: parseFloat(timeMatch?.[1] || '0') * 1000,
          testFilePath: nameMatch[1]
        });
      }
    }
    
    return testSuites;
  }

  /**
   * Generate comprehensive testing metrics
   */
  generateTestingMetrics() {
    const coverageAnalysis = this.analyzeCoverageData();
    const executionReport = this.generateTestExecutionReport();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      coverage: coverageAnalysis ? this.generateCoverageReport(coverageAnalysis) : null,
      execution: executionReport,
      quality: this.calculateQualityMetrics(executionReport, coverageAnalysis),
      recommendations: this.generateTestingRecommendations(coverageAnalysis, executionReport)
    };

    return metrics;
  }

  /**
   * Calculate quality metrics
   */
  calculateQualityMetrics(executionReport, coverageAnalysis) {
    const quality = {
      overall: {
        score: 0,
        grade: 'F',
        status: 'Poor'
      },
      aspects: {
        testCoverage: { score: 0, weight: 30 },
        testSuccess: { score: 0, weight: 25 },
        codeQuality: { score: 0, weight: 20 },
        testMaintainability: { score: 0, weight: 15 },
        performance: { score: 0, weight: 10 }
      }
    };

    // Calculate test coverage score
    if (coverageAnalysis) {
      const avgCoverage = this.calculateAverageCoverage(coverageAnalysis.total);
      quality.aspects.testCoverage.score = Math.min(avgCoverage, 100);
      quality.aspects.testCoverage.score = Math.max(0, quality.aspects.testCoverage.score);
    }

    // Calculate test success score
    if (executionReport.summary.totalTests > 0) {
      quality.aspects.testSuccess.score = parseFloat(executionReport.summary.successRate);
    }

    // Calculate code quality score (based on coverage distribution)
    if (coverageAnalysis) {
      const totalFiles = Object.keys(coverageAnalysis.byFile).length;
      const excellentFiles = coverageAnalysis.summary.excellentCoverage.length;
      quality.aspects.codeQuality.score = (excellentFiles / totalFiles) * 100;
    }

    // Calculate test maintainability (simplified - based on test organization)
    quality.aspects.testMaintainability.score = 85; // Placeholder for now

    // Calculate performance score
    if (executionReport.summary.totalTests > 0) {
      const avgTestTime = executionReport.summary.totalDuration / executionReport.summary.totalTests;
      quality.aspects.performance.score = avgTestTime < 100 ? 100 : Math.max(0, 100 - (avgTestTime - 100));
    }

    // Calculate weighted overall score
    let weightedScore = 0;
    for (const [aspect, data] of Object.entries(quality.aspects)) {
      weightedScore += data.score * (data.weight / 100);
    }
    quality.overall.score = Math.round(weightedScore);

    // Assign grade and status
    if (quality.overall.score >= 90) {
      quality.overall.grade = 'A';
      quality.overall.status = 'Excellent';
    } else if (quality.overall.score >= 80) {
      quality.overall.grade = 'B';
      quality.overall.status = 'Good';
    } else if (quality.overall.score >= 70) {
      quality.overall.grade = 'C';
      quality.overall.status = 'Satisfactory';
    } else if (quality.overall.score >= 60) {
      quality.overall.grade = 'D';
      quality.overall.status = 'Needs Improvement';
    } else {
      quality.overall.grade = 'F';
      quality.overall.status = 'Poor';
    }

    return quality;
  }

  /**
   * Generate testing recommendations
   */
  generateTestingRecommendations(coverageAnalysis, executionReport) {
    const recommendations = [];

    // Coverage recommendations
    if (coverageAnalysis) {
      const avgCoverage = this.calculateAverageCoverage(coverageAnalysis.total);
      
      if (avgCoverage < 70) {
        recommendations.push({
          category: 'Coverage',
          priority: 'HIGH',
          title: 'Increase Test Coverage',
          description: `Current coverage is ${avgCoverage.toFixed(1)}%. Target should be at least 80%.`,
          actionItems: [
            'Identify untested critical functions',
            'Add unit tests for missing coverage areas',
            'Focus on edge cases and error handling',
            'Implement integration tests for module interactions'
          ]
        });
      }

      // File-specific recommendations
      if (coverageAnalysis.summary.lowCoverage.length > 0) {
        recommendations.push({
          category: 'Coverage',
          priority: 'HIGH',
          title: 'Address Low Coverage Files',
          description: `${coverageAnalysis.summary.lowCoverage.length} files have coverage below 60%.`,
          actionItems: coverageAnalysis.summary.lowCoverage.map(file => 
            `Prioritize testing ${file.file} (${file.coverage.toFixed(1)}% coverage)`
          )
        });
      }
    }

    // Test execution recommendations
    if (executionReport.summary.totalFailed > 0) {
      recommendations.push({
        category: 'Test Quality',
        priority: 'HIGH',
        title: 'Fix Failing Tests',
        description: `${executionReport.summary.totalFailed} tests are currently failing.`,
        actionItems: [
          'Review and fix failing test cases',
          'Update assertions to match current implementation',
          'Fix broken test dependencies',
          'Add proper error handling in tests'
        ]
      });
    }

    // Performance recommendations
    if (executionReport.summary.totalTests > 0) {
      const avgTestTime = executionReport.summary.totalDuration / executionReport.summary.totalTests;
      if (avgTestTime > 200) {
        recommendations.push({
          category: 'Performance',
          priority: 'MEDIUM',
          title: 'Optimize Test Performance',
          description: `Average test execution time is ${avgTestTime.toFixed(0)}ms. Target should be under 100ms.`,
          actionItems: [
            'Reduce database operations in tests',
            'Use test doubles and mocks',
            'Optimize test data setup',
            'Implement parallel test execution'
          ]
        });
      }
    }

    // Maintainability recommendations
    recommendations.push({
      category: 'Maintainability',
      priority: 'MEDIUM',
      title: 'Improve Test Maintainability',
      description: 'Focus on writing maintainable and reliable tests.',
      actionItems: [
        'Use descriptive test names and descriptions',
        'Implement proper test data management',
        'Add test documentation and comments',
        'Follow consistent test patterns and conventions'
      ]
    });

    return recommendations;
  }

  /**
   * Generate and save comprehensive report
   */
  async generateAndSaveReport() {
    this.initializeReportsDirectory();
    
    console.log('Generating comprehensive testing metrics report...');
    
    const metrics = this.generateTestingMetrics();
    
    // Save main report
    const reportFile = path.join(this.reportsDir, `testing-metrics-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(metrics, null, 2));
    
    // Generate human-readable summary
    const summaryFile = path.join(this.reportsDir, `testing-summary-${new Date().toISOString().split('T')[0]}.md`);
    const summary = this.generateMarkdownSummary(metrics);
    fs.writeFileSync(summaryFile, summary);
    
    console.log(`Reports generated:`);
    console.log(`- JSON Report: ${reportFile}`);
    console.log(`- Markdown Summary: ${summaryFile}`);
    
    return {
      jsonReport: reportFile,
      markdownSummary: summaryFile,
      metrics: metrics
    };
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary(metrics) {
    const summary = `# UNIBEN AI Assistant - Testing Metrics Report

Generated: ${new Date(metrics.timestamp).toLocaleString()}

## Quality Overview

**Overall Grade**: ${metrics.quality.overall.grade} (${metrics.quality.overall.score}/100)
**Status**: ${metrics.quality.overall.status}

## Test Coverage

${metrics.coverage ? `
**Overall Coverage**: ${metrics.coverage.summary.overallCoverage.average}

| Metric | Coverage | Total | Covered | Uncovered |
|--------|----------|-------|---------|-----------|
| Lines | ${metrics.coverage.summary.overallCoverage.lines} | ${metrics.coverage.summary.totals.lines.total} | ${metrics.coverage.summary.totals.lines.covered} | ${metrics.coverage.summary.totals.lines.uncovered} |
| Statements | ${metrics.coverage.summary.overallCoverage.statements} | ${metrics.coverage.summary.totals.statements.total} | ${metrics.coverage.summary.totals.statements.covered} | ${metrics.coverage.summary.totals.statements.uncovered} |
| Functions | ${metrics.coverage.summary.overallCoverage.functions} | ${metrics.coverage.summary.totals.functions.total} | ${metrics.coverage.summary.totals.functions.covered} | ${metrics.coverage.summary.totals.functions.uncovered} |
| Branches | ${metrics.coverage.summary.overallCoverage.branches} | ${metrics.coverage.summary.totals.branches.total} | ${metrics.coverage.summary.totals.branches.covered} | ${metrics.coverage.summary.totals.branches.uncovered} |

### Coverage Distribution

- **Excellent Coverage (95%+)**: ${metrics.coverage.summary.fileCoverage.excellent.length} files
- **High Coverage (80-94%)**: ${metrics.coverage.summary.fileCoverage.high.length} files  
- **Medium Coverage (60-79%)**: ${metrics.coverage.summary.fileCoverage.medium.length} files
- **Low Coverage (<60%)**: ${metrics.coverage.summary.fileCoverage.low.length} files
` : 'Coverage data not available'}

## Test Execution

**Total Tests**: ${metrics.execution.summary.totalTests}
**Passed**: ${metrics.execution.summary.totalPassed}
**Failed**: ${metrics.execution.summary.totalFailed}
**Skipped**: ${metrics.execution.summary.totalSkipped}
**Success Rate**: ${metrics.execution.summary.successRate}%
**Total Duration**: ${(metrics.execution.summary.totalDuration / 1000).toFixed(2)}s

## Quality Aspects

| Aspect | Score | Weight | Status |
|--------|-------|--------|---------|
| Test Coverage | ${metrics.quality.aspects.testCoverage.score.toFixed(1)}% | ${metrics.quality.aspects.testCoverage.weight}% | ${metrics.quality.aspects.testCoverage.score >= 80 ? '✅' : '⚠️'} |
| Test Success | ${metrics.quality.aspects.testSuccess.score.toFixed(1)}% | ${metrics.quality.aspects.testSuccess.weight}% | ${metrics.quality.aspects.testSuccess.score >= 95 ? '✅' : '⚠️'} |
| Code Quality | ${metrics.quality.aspects.codeQuality.score.toFixed(1)}% | ${metrics.quality.aspects.codeQuality.weight}% | ${metrics.quality.aspects.codeQuality.score >= 80 ? '✅' : '⚠️'} |
| Test Maintainability | ${metrics.quality.aspects.testMaintainability.score.toFixed(1)}% | ${metrics.quality.aspects.testMaintainability.weight}% | ${metrics.quality.aspects.testMaintainability.score >= 80 ? '✅' : '⚠️'} |
| Performance | ${metrics.quality.aspects.performance.score.toFixed(1)}% | ${metrics.quality.aspects.performance.weight}% | ${metrics.quality.aspects.performance.score >= 80 ? '✅' : '⚠️'} |

## Recommendations

${metrics.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title} (${rec.priority} Priority)

**Category**: ${rec.category}
**Description**: ${rec.description}

**Action Items**:
${rec.actionItems.map(item => `- ${item}`).join('\n')}
`).join('\n')}

## Next Steps

1. **Immediate Actions**: Focus on high-priority recommendations
2. **Code Coverage**: Aim for 80%+ coverage across all metrics
3. **Test Quality**: Maintain high success rate (>95%)
4. **Performance**: Optimize slow tests for better CI/CD performance
5. **Monitoring**: Regular monitoring of these metrics in CI/CD pipeline

---

*This report is automatically generated by the Testing Framework*
`;

    return summary;
  }

  /**
   * Generate CI/CD compatible report
   */
  generateCICDReport() {
    const metrics = this.generateTestingMetrics();
    
    const ciReport = {
      timestamp: metrics.timestamp,
      quality: {
        overall: metrics.quality.overall,
        score: metrics.quality.overall.score,
        grade: metrics.quality.overall.grade,
        passed: metrics.quality.overall.score >= 70
      },
      coverage: metrics.coverage ? {
        lines: parseFloat(metrics.coverage.summary.overallCoverage.lines),
        statements: parseFloat(metrics.coverage.summary.overallCoverage.statements),
        functions: parseFloat(metrics.coverage.summary.overallCoverage.functions),
        branches: parseFloat(metrics.coverage.summary.overallCoverage.branches),
        average: parseFloat(metrics.coverage.summary.overallCoverage.average.replace('%', '')),
        passed: parseFloat(metrics.coverage.summary.overallCoverage.average.replace('%', '')) >= 80
      } : null,
      tests: {
        total: metrics.execution.summary.totalTests,
        passed: metrics.execution.summary.totalPassed,
        failed: metrics.execution.summary.totalFailed,
        skipped: metrics.execution.summary.totalSkipped,
        successRate: parseFloat(metrics.execution.summary.successRate),
        passed: parseFloat(metrics.execution.summary.successRate) >= 95
      }
    };

    return ciReport;
  }
}

module.exports = TestCoverageReporter;