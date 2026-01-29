/**
 * Development utilities for AI Interview module
 * Access these via browser console for testing/debugging
 */

import { getAIInterviewSessions } from './aiInterviewStorage';
import { getInterviewReports, getReportComments } from './aiInterviewReportStorage';
import { validateAIInterviewData, getValidationSummary, findOrphanedRecords } from './dataValidation';
import { reinitializeMockData, clearAllAIInterviewData } from './initializeMockData';

// Expose utilities to window for console access in development
if (import.meta.env.DEV) {
  (window as any).aiInterviewDebug = {
    // Data inspection
    getSessions: getAIInterviewSessions,
    getReports: getInterviewReports,
    getComments: getReportComments,
    
    // Validation
    validate: validateAIInterviewData,
    validateSummary: () => console.log(getValidationSummary()),
    findOrphaned: findOrphanedRecords,
    
    // Data management
    reinitialize: reinitializeMockData,
    clearAll: clearAllAIInterviewData,
    
    // Stats
    stats: () => {
      const sessions = getAIInterviewSessions();
      const reports = getInterviewReports();
      const comments = getReportComments();
      
      console.log('AI Interview Data Statistics:');
      console.log('============================');
      console.log(`Sessions: ${sessions.length}`);
      console.log(`  - Scheduled: ${sessions.filter(s => s.status === 'scheduled').length}`);
      console.log(`  - In Progress: ${sessions.filter(s => s.status === 'in-progress').length}`);
      console.log(`  - Completed: ${sessions.filter(s => s.status === 'completed').length}`);
      console.log(`  - Cancelled: ${sessions.filter(s => s.status === 'cancelled').length}`);
      console.log(`  - No Show: ${sessions.filter(s => s.status === 'no-show').length}`);
      console.log(`\nReports: ${reports.length}`);
      console.log(`  - Draft: ${reports.filter(r => r.status === 'draft').length}`);
      console.log(`  - In Review: ${reports.filter(r => r.status === 'in-review').length}`);
      console.log(`  - Finalized: ${reports.filter(r => r.status === 'finalized').length}`);
      console.log(`\nComments: ${comments.length}`);
      
      const orphaned = findOrphanedRecords();
      if (orphaned.orphanedReports.length > 0 || orphaned.orphanedComments.length > 0) {
        console.log('\n⚠️  Orphaned Records Detected:');
        if (orphaned.orphanedReports.length > 0) {
          console.log(`  - Orphaned Reports: ${orphaned.orphanedReports.length}`);
        }
        if (orphaned.orphanedComments.length > 0) {
          console.log(`  - Orphaned Comments: ${orphaned.orphanedComments.length}`);
        }
      }
    },
    
    // Help
    help: () => {
      console.log('AI Interview Debug Utilities:');
      console.log('============================');
      console.log('aiInterviewDebug.getSessions()    - Get all interview sessions');
      console.log('aiInterviewDebug.getReports()     - Get all reports');
      console.log('aiInterviewDebug.getComments()    - Get all comments');
      console.log('aiInterviewDebug.validate()       - Validate data integrity');
      console.log('aiInterviewDebug.validateSummary()- Print validation summary');
      console.log('aiInterviewDebug.findOrphaned()   - Find orphaned records');
      console.log('aiInterviewDebug.stats()          - Print data statistics');
      console.log('aiInterviewDebug.reinitialize()   - Reset and regenerate all data');
      console.log('aiInterviewDebug.clearAll()       - Clear all AI interview data');
      console.log('aiInterviewDebug.help()           - Show this help message');
    }
  };

  console.log('🔧 AI Interview debug utilities loaded. Type aiInterviewDebug.help() for commands.');
}
