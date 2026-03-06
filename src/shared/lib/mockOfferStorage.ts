import type { OfferLetter, OfferTemplate } from '@/shared/types/offer';

const OFFERS_KEY = 'hrm8_offers';
const TEMPLATES_KEY = 'hrm8_offer_templates';

const mockOffers: OfferLetter[] = [];

const systemTemplates: OfferTemplate[] = [
  {
    id: 'template-ft-001',
    name: 'Full-Time Employment Offer',
    description: 'Standard offer letter for full-time employees',
    category: 'full-time',
    content: `<p>Dear {{candidate_name}},</p>
<p>We are pleased to offer you the position of {{job_title}} at {{company_name}}, reporting to {{manager_name}}.</p>
<p><strong>Start Date:</strong> {{start_date}}</p>
<p><strong>Salary:</strong> {{salary}} {{currency}} per {{salary_period}}</p>
<p><strong>Work Location:</strong> {{work_location}}</p>
<p><strong>Work Arrangement:</strong> {{work_arrangement}}</p>
<p><strong>Benefits:</strong></p>
<ul>{{benefits}}</ul>
<p><strong>Vacation:</strong> {{vacation_days}} days per year</p>
{{#if probation_period}}<p><strong>Probation Period:</strong> {{probation_period}} months</p>{{/if}}
<p>Please sign and return this offer letter by {{expiry_date}}.</p>
<p>We look forward to welcoming you to our team!</p>
<p>Sincerely,<br/>{{sender_name}}<br/>{{sender_title}}</p>`,
    variables: [
      { key: '{{candidate_name}}', label: 'Candidate Name', type: 'text', required: true },
      { key: '{{job_title}}', label: 'Job Title', type: 'text', required: true },
      { key: '{{salary}}', label: 'Salary', type: 'currency', required: true },
      { key: '{{start_date}}', label: 'Start Date', type: 'date', required: true },
    ],
    isSystemTemplate: true,
    createdAt: new Date().toISOString(),
  },
];

function initializeStorage() {
  if (!localStorage.getItem(OFFERS_KEY)) {
    localStorage.setItem(OFFERS_KEY, JSON.stringify(mockOffers));
  }
  if (!localStorage.getItem(TEMPLATES_KEY)) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(systemTemplates));
  }
}

export function getOffers(): OfferLetter[] {
  initializeStorage();
  const data = localStorage.getItem(OFFERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getOfferById(id: string): OfferLetter | undefined {
  return getOffers().find(o => o.id === id);
}

export function getOffersByApplication(applicationId: string): OfferLetter[] {
  return getOffers().filter(o => o.applicationId === applicationId);
}

export function saveOffer(offer: OfferLetter): void {
  const offers = getOffers();
  offers.push(offer);
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

export function updateOffer(id: string, updates: Partial<OfferLetter>): void {
  const offers = getOffers();
  const index = offers.findIndex(o => o.id === id);
  if (index !== -1) {
    offers[index] = { ...offers[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
  }
}

export function deleteOffer(id: string): void {
  const offers = getOffers();
  const filtered = offers.filter(o => o.id !== id);
  localStorage.setItem(OFFERS_KEY, JSON.stringify(filtered));
}

export function getOfferTemplates(): OfferTemplate[] {
  initializeStorage();
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getOfferTemplateById(id: string): OfferTemplate | undefined {
  return getOfferTemplates().find(t => t.id === id);
}

export function saveOfferTemplate(template: OfferTemplate): void {
  const templates = getOfferTemplates();
  templates.push(template);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
