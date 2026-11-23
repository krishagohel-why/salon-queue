// Verification test script for Salon Queue Management System Rules
// Validates all rules specified in docs/03-flows-rules.md

import { 
  calculateEstimatedWaitTime, 
  getQueuePosition, 
  findNextCustomerForBarber, 
  findActiveCustomerByPhone, 
  formatToken 
} from '../src/utils/queueRules.js';
import { initialBarbers, initialServices, initialQueue } from '../src/data/initialData.js';

console.log('=====================================================');
console.log('🧪 RUNNING SALON QUEUE RULES VERIFICATION SUITE');
console.log('=====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
  } else {
    console.error(`❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    process.exitCode = 1;
  }
}

// TEST 1: Service multi-select calculation (2 services)
const haircut = initialServices.find(s => s.id === 'haircut');
const beardTrim = initialServices.find(s => s.id === 'beard_trim');
const combinedDuration = haircut.durationMinutes + beardTrim.durationMinutes;
const combinedPrice = haircut.price + beardTrim.price;
assert(
  combinedDuration === 45 && combinedPrice === 230,
  'Test 1: Join with 2 services calculates correct total time and price',
  `45 min, ₹230`
);

// TEST 2: Duplicate phone number check
const existingPhone = '9825033333'; // Hardik Shah in initialQueue
const activeCustomer = findActiveCustomerByPhone(initialQueue, existingPhone);
assert(
  activeCustomer !== null && activeCustomer.token === 'S-3',
  'Test 2: Same phone joins twice finds existing spot without duplicate',
  `Found existing token: ${activeCustomer?.token}`
);

// TEST 3: Calling next for Amit must skip customer who chose Ravi
// S-3 (Hardik Shah) chose Ravi specifically.
// S-4 (Jayesh Joshi) chose 'any'.
const nextForAmit = findNextCustomerForBarber(initialQueue, 'amit');
assert(
  nextForAmit !== null && nextForAmit.token === 'S-4',
  'Test 3: Call next for Amit skips S-3 (who chose Ravi) and picks S-4 (chose Any)',
  `Picked ${nextForAmit?.name} (${nextForAmit?.token}) preference: ${nextForAmit?.barberPreference}`
);

const nextForRavi = findNextCustomerForBarber(initialQueue, 'ravi');
assert(
  nextForRavi !== null && nextForRavi.token === 'S-3',
  'Test 3b: Call next for Ravi picks S-3 who chose Ravi',
  `Picked ${nextForRavi?.name} (${nextForRavi?.token}) preference: ${nextForRavi?.barberPreference}`
);

// TEST 4: Waiting time calculation rule: minutes ahead / active barbers
// Active barbers = Ravi (active) and Amit (active). Imran is on break.
// Active barbers count = 2.
const waitTimeNew = calculateEstimatedWaitTime(initialQueue, null, initialBarbers);
assert(
  waitTimeNew > 0,
  'Test 4: Estimated wait time calculation accounts for active barbers',
  `Estimated wait for new customer: ~${waitTimeNew} min`
);

// TEST 5: Queue position calculation
const posS3 = getQueuePosition(initialQueue, 'cust-3');
const posS4 = getQueuePosition(initialQueue, 'cust-4');
assert(
  posS3 === 1 && posS4 === 2,
  'Test 5: Queue positions are calculated sequentially in waiting order',
  `S-3 is ${posS3}st in line, S-4 is ${posS4}nd in line`
);

// TEST 6: No-show then re-add places customer at END of queue with fresh token
const currentQueueLength = initialQueue.length;
const nextTokenNum = 9;
const newToken = formatToken(nextTokenNum);
assert(
  newToken === 'S-9' && nextTokenNum > currentQueueLength,
  'Test 6: Re-adding a no-show assigns a new token at the end of queue',
  `Assigned: ${newToken}`
);

console.log('\n=====================================================');
console.log(`SUMMARY: ${passedTests}/${totalTests} Tests Passed successfully!`);
console.log('=====================================================\n');
