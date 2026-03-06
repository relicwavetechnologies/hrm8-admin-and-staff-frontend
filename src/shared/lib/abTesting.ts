export interface ABTest {
  id: string;
  name: string;
  variantA: {
    name: string;
    emailType: string;
    message: string;
  };
  variantB: {
    name: string;
    emailType: string;
    message: string;
  };
  targetRecipients: string[];
  status: 'draft' | 'running' | 'completed';
  startDate: Date;
  endDate?: Date;
  results: {
    variantA: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    };
    variantB: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    };
  };
  winner?: 'A' | 'B' | 'tie';
  createdAt: Date;
}

const STORAGE_KEY = "ab_tests";

export function getABTests(): ABTest[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const tests = JSON.parse(saved);
    return tests.map((test: any) => ({
      ...test,
      startDate: new Date(test.startDate),
      endDate: test.endDate ? new Date(test.endDate) : undefined,
      createdAt: new Date(test.createdAt),
    }));
  } catch (error) {
    console.error("Error loading A/B tests:", error);
    return [];
  }
}

export function createABTest(test: Omit<ABTest, 'id' | 'createdAt' | 'results' | 'status' | 'winner'>): ABTest {
  const tests = getABTests();
  
  const newTest: ABTest = {
    ...test,
    id: `abtest-${Date.now()}`,
    status: 'draft',
    results: {
      variantA: { sent: 0, delivered: 0, opened: 0, clicked: 0 },
      variantB: { sent: 0, delivered: 0, opened: 0, clicked: 0 },
    },
    createdAt: new Date(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...tests, newTest]));
  return newTest;
}

export function updateABTest(id: string, updates: Partial<ABTest>): void {
  const tests = getABTests();
  const updatedTests = tests.map(test =>
    test.id === id ? { ...test, ...updates } : test
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTests));
}

export function deleteABTest(id: string): void {
  const tests = getABTests();
  const filteredTests = tests.filter(test => test.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTests));
}

export function startABTest(id: string): void {
  updateABTest(id, { status: 'running', startDate: new Date() });
}

export function completeABTest(id: string): void {
  const tests = getABTests();
  const test = tests.find(t => t.id === id);
  if (!test) return;

  // Calculate winner
  const aOpenRate = test.results.variantA.sent > 0 
    ? (test.results.variantA.opened / test.results.variantA.sent) * 100 
    : 0;
  const bOpenRate = test.results.variantB.sent > 0 
    ? (test.results.variantB.opened / test.results.variantB.sent) * 100 
    : 0;

  let winner: 'A' | 'B' | 'tie' = 'tie';
  if (Math.abs(aOpenRate - bOpenRate) > 5) { // 5% threshold
    winner = aOpenRate > bOpenRate ? 'A' : 'B';
  }

  updateABTest(id, { 
    status: 'completed', 
    endDate: new Date(),
    winner 
  });
}

export function recordABTestResult(
  testId: string, 
  variant: 'A' | 'B', 
  type: 'sent' | 'delivered' | 'opened' | 'clicked'
): void {
  const tests = getABTests();
  const test = tests.find(t => t.id === testId);
  if (!test) return;

  const variantKey = variant === 'A' ? 'variantA' : 'variantB';
  test.results[variantKey][type]++;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}
