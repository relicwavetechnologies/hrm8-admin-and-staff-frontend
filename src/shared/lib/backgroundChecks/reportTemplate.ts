import type { AITranscriptionSummary } from '@/shared/types/aiReferenceReport';

export function generateReportHTML(summary: AITranscriptionSummary): string {
  const categoryAnalysisHTML = summary.categoryBreakdown
    .map(
      (cat) => `
      <div class="category-section">
        <h4>${cat.category} - ${cat.score}/5</h4>
        <p>${cat.summary}</p>
        ${cat.evidence.length > 0 ? `
          <ul>
            ${cat.evidence.map((ev) => `<li>"${ev}"</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `
    )
    .join('');

  const highlightsHTML = summary.conversationHighlights
    .map(
      (highlight) => `
      <div class="highlight-section">
        <p><strong>Q:</strong> ${highlight.question}</p>
        <p><strong>A:</strong> ${highlight.answer}</p>
        <p><em>Significance:</em> ${highlight.significance}</p>
      </div>
    `
    )
    .join('');

  const redFlagsHTML =
    summary.redFlags.length > 0
      ? `
      <h2 id="red-flags">Red Flags & Concerns</h2>
      ${summary.redFlags
        .map(
          (flag) => `
        <div class="red-flag-section severity-${flag.severity}">
          <p><strong>[${flag.severity.toUpperCase()}]</strong> ${flag.description}</p>
          <p><em>Evidence:</em> "${flag.evidence}"</p>
        </div>
      `
        )
        .join('')}
    `
      : '<h2 id="red-flags">Red Flags & Concerns</h2><p>No significant red flags identified.</p>';

  const verificationHTML = summary.verificationItems
    .map(
      (item) => `
      <div class="verification-item">
        <p><strong>${item.verified ? '✓' : '○'}</strong> ${item.claim}</p>
        ${item.notes ? `<p><em>Notes:</em> ${item.notes}</p>` : ''}
      </div>
    `
    )
    .join('');

  return `
    <h1>Reference Check Report</h1>
    
    <div class="metadata">
      <p><strong>Candidate:</strong> ${summary.candidateName}</p>
      <p><strong>Referee:</strong> ${summary.refereeInfo.name} (${summary.refereeInfo.relationship})</p>
      <p><strong>Company:</strong> ${summary.refereeInfo.companyName}</p>
      ${summary.refereeInfo.yearsKnown ? `<p><strong>Years Known:</strong> ${summary.refereeInfo.yearsKnown}</p>` : ''}
      <p><strong>Interview Mode:</strong> ${summary.sessionDetails.mode}</p>
      <p><strong>Duration:</strong> ${Math.round(summary.sessionDetails.duration / 60)} minutes</p>
      <p><strong>Questions Asked:</strong> ${summary.sessionDetails.questionsAsked}</p>
    </div>

    <h2 id="executive-summary">Executive Summary</h2>
    <p>${summary.executiveSummary}</p>

    <h2 id="key-findings">Key Findings</h2>
    
    <h3>Strengths</h3>
    <ul>
      ${summary.keyFindings.strengths.map((s) => `<li>${s}</li>`).join('')}
    </ul>

    <h3>Concerns</h3>
    ${
      summary.keyFindings.concerns.length > 0
        ? `<ul>${summary.keyFindings.concerns.map((c) => `<li>${c}</li>`).join('')}</ul>`
        : '<p>No significant concerns identified.</p>'
    }

    <h3>Neutral Observations</h3>
    ${
      summary.keyFindings.neutralObservations.length > 0
        ? `<ul>${summary.keyFindings.neutralObservations.map((n) => `<li>${n}</li>`).join('')}</ul>`
        : '<p>No additional observations.</p>'
    }

    <h2 id="category-analysis">Category Analysis</h2>
    ${categoryAnalysisHTML}

    <h2 id="conversation-highlights">Conversation Highlights</h2>
    ${highlightsHTML}

    ${redFlagsHTML}

    <h2 id="verification">Verification Items</h2>
    ${verificationHTML}

    <h2 id="recommendation">Recommendation</h2>
    <div class="recommendation-section">
      <p><strong>Overall Score:</strong> ${summary.recommendation.overallScore}/100</p>
      <p><strong>Hiring Recommendation:</strong> ${summary.recommendation.hiringRecommendation.replace(/-/g, ' ').toUpperCase()}</p>
      <p><strong>Confidence Level:</strong> ${Math.round(summary.recommendation.confidenceLevel * 100)}%</p>
      <p>${summary.recommendation.reasoningSummary}</p>
    </div>
  `;
}
