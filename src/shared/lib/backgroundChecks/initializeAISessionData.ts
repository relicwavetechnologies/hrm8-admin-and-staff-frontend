import { generateMockAISession } from './mockAISessionData';
import { saveAISession } from './aiReferenceCheckStorage';
import { getReferees, updateReferee } from './refereeStorage';

/**
 * Initialize mock AI session data for testing
 * Links AI sessions to existing referees
 */
export function initializeAISessionTestData() {
  const referees = getReferees();
  
  if (referees.length === 0) {
    console.log('No referees found, skipping AI session initialization');
    return;
  }

  // Create AI sessions for first 5 referees
  const refereesToProcess = referees.slice(0, Math.min(5, referees.length));
  
  refereesToProcess.forEach((referee, index) => {
    // Alternate between video and phone modes
    const mode = index % 2 === 0 ? 'video' : 'phone';
    
    // Mix of scheduled, in-progress, and completed sessions
    let status: 'scheduled' | 'in-progress' | 'completed';
    if (index === 0) {
      status = 'scheduled'; // First one is scheduled for testing
    } else if (index === 1) {
      status = 'in-progress';
    } else {
      status = 'completed';
    }
    
    const aiSession = generateMockAISession(
      referee.id,
      referee.candidateId,
      referee.backgroundCheckId,
      mode as any,
      status
    );
    
    // Save the AI session
    saveAISession(aiSession);
    
    // Update referee with AI session information
    updateReferee(referee.id, {
      preferredMode: mode as any,
      aiSessionId: aiSession.id
    });
    
    console.log(`Created ${mode} AI session (${status}) for referee ${referee.name}`);
  });
  
  console.log(`Initialized ${refereesToProcess.length} AI sessions`);
}
