import { Company, QuestionBankItem, CodingProblem, UserProfile } from '../types';

export const ROLE_TAXONOMY: Record<string, { requiredSkills: string[]; niceToHave: string[]; description: string }> = {
  'Software Developer': {
    requiredSkills: ['Data Structures', 'Algorithms', 'Java', 'SQL', 'Git', 'OOP'],
    niceToHave: ['Docker', 'CI/CD', 'REST APIs', 'Unit Testing'],
    description: 'Build robust, scalable software systems using core computer science fundamentals and object-oriented principles.'
  },
  'Frontend Developer': {
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Git'],
    niceToHave: ['Next.js', 'Tailwind CSS', 'Redux', 'Web Performance', 'Jest'],
    description: 'Design and implement intuitive, responsive, and performant user interfaces for web applications.'
  },
  'Backend Developer': {
    requiredSkills: ['Node.js', 'Python', 'SQL', 'REST APIs', 'Git', 'Database Design'],
    niceToHave: ['Docker', 'MongoDB', 'Redis', 'PostgreSQL', 'Microservices', 'AWS'],
    description: 'Develop high-performance server architectures, API contracts, and secure database solutions.'
  },
  'Full Stack Developer': {
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
    niceToHave: ['Next.js', 'PostgreSQL', 'Docker', 'MongoDB', 'GraphQL', 'Tailwind CSS'],
    description: 'Bridge client-side and server-side engineering to deliver end-to-end modern digital products.'
  },
  'Java Developer': {
    requiredSkills: ['Java', 'OOP', 'Spring Boot', 'SQL', 'Collections', 'Git'],
    niceToHave: ['Hibernate', 'Microservices', 'Maven', 'Docker', 'Kafka', 'JUnit'],
    description: 'Specialize in enterprise-grade software development using Java frameworks and multithreaded systems.'
  },
  'Python Developer': {
    requiredSkills: ['Python', 'OOP', 'Django', 'SQL', 'Git', 'REST APIs'],
    niceToHave: ['FastAPI', 'Flask', 'Pandas', 'PostgreSQL', 'Docker'],
    description: 'Create fast web APIs, backend automated pipelines, and scripting services using Python.'
  },
  'React Developer': {
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Git'],
    niceToHave: ['Redux Toolkit', 'Next.js', 'Tailwind CSS', 'React Query', 'Jest'],
    description: 'Specialize in component-driven frontend architecture, state orchestration, and modern React hooks.'
  },
  'Data Analyst': {
    requiredSkills: ['SQL', 'Python', 'Excel', 'Data Visualization', 'Statistics'],
    niceToHave: ['PowerBI', 'Tableau', 'Pandas', 'NumPy', 'Machine Learning Basics'],
    description: 'Analyze complex datasets to deliver actionable strategic insights and visual business intelligence.'
  }
};

export const COMMON_SKILLS_LIST = [
  'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'GitHub', 'HTML', 'CSS', 'C', 'C++',
  'Spring Boot', 'Django', 'FastAPI', 'Express', 'Tailwind CSS', 'Docker',
  'Data Structures', 'Algorithms', 'OOP', 'System Design', 'REST APIs', 'AWS',
  'Linux', 'Redux', 'GraphQL'
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'Zoho Corporation',
    logoText: 'Z',
    industry: 'Enterprise SaaS',
    location: 'Chennai / Austin / Remote',
    workType: 'Hybrid',
    companyType: 'Product',
    relevantRoles: ['Software Developer', 'Java Developer', 'Frontend Developer'],
    commonSkills: ['Java', 'C++', 'Data Structures', 'SQL', 'JavaScript', 'OOP'],
    careersUrl: 'https://www.zoho.com/careers/',
    description: 'Global SaaS leader building private, scalable software suites for over 100M+ enterprise users.'
  },
  {
    id: 'comp-2',
    name: 'Freshworks',
    logoText: 'FW',
    industry: 'Customer Engagement SaaS',
    location: 'Bengaluru / San Mateo / Hybrid',
    workType: 'Hybrid',
    companyType: 'Product',
    relevantRoles: ['Full Stack Developer', 'React Developer', 'Backend Developer'],
    commonSkills: ['React', 'TypeScript', 'Ruby', 'Node.js', 'SQL', 'AWS'],
    careersUrl: 'https://www.freshworks.com/company/careers/',
    description: 'Creates delightful, AI-powered customer and employee experience software for fast-growing companies.'
  },
  {
    id: 'comp-3',
    name: 'Razorpay',
    logoText: 'RZ',
    industry: 'Fintech & Payments',
    location: 'Bengaluru / Remote',
    workType: 'Flexible',
    companyType: 'Fintech',
    relevantRoles: ['Backend Developer', 'Software Developer', 'Full Stack Developer'],
    commonSkills: ['Node.js', 'Python', 'Go', 'SQL', 'Kafka', 'System Design', 'Git'],
    careersUrl: 'https://razorpay.com/jobs/',
    description: 'India’s payment infrastructure powerhouse enabling millions of businesses to accept and disburse funds.'
  },
  {
    id: 'comp-4',
    name: 'Atlassian',
    logoText: 'AT',
    industry: 'Developer Tools & Collaboration',
    location: 'Bengaluru / Remote / Sydney',
    workType: 'Remote',
    companyType: 'Product',
    relevantRoles: ['Software Developer', 'Frontend Developer', 'Java Developer'],
    commonSkills: ['Java', 'React', 'TypeScript', 'AWS', 'Microservices', 'Algorithms'],
    careersUrl: 'https://www.atlassian.com/company/careers',
    description: 'Makers of Jira, Confluence, and Trello powering agile team collaboration across every industry.'
  },
  {
    id: 'comp-5',
    name: 'Swiggy',
    logoText: 'SW',
    industry: 'On-Demand Commerce & Logistics',
    location: 'Bengaluru / Hyderabad',
    workType: 'Hybrid',
    companyType: 'Product',
    relevantRoles: ['Backend Developer', 'Data Analyst', 'Software Developer'],
    commonSkills: ['Go', 'Java', 'Python', 'SQL', 'Kafka', 'Redis', 'Algorithms'],
    careersUrl: 'https://careers.swiggy.com/',
    description: 'Pioneering hyperlocal convenience platform with real-time routing algorithms and rapid delivery network.'
  },
  {
    id: 'comp-6',
    name: 'Adobe',
    logoText: 'AD',
    industry: 'Digital Media & Creative Tech',
    location: 'Noida / Bengaluru / San Jose',
    workType: 'Hybrid',
    companyType: 'Product',
    relevantRoles: ['Software Developer', 'Frontend Developer', 'React Developer'],
    commonSkills: ['C++', 'JavaScript', 'React', 'Algorithms', 'WebAssembly', 'Git'],
    careersUrl: 'https://careers.adobe.com/',
    description: 'Changing the world through digital experiences across Creative Cloud, Document Cloud, and Experience Cloud.'
  },
  {
    id: 'comp-7',
    name: 'TCS (Tata Consultancy Services)',
    logoText: 'TCS',
    industry: 'IT Services & Consulting',
    location: 'Pan India / Global',
    workType: 'Onsite',
    companyType: 'Services',
    relevantRoles: ['Software Developer', 'Java Developer', 'Data Analyst'],
    commonSkills: ['Java', 'SQL', 'Python', 'OOP', 'HTML', 'CSS', 'Git'],
    careersUrl: 'https://www.tcs.com/careers',
    description: 'Global IT service powerhouse hiring thousands of fresh engineering graduates annually through National Qualifier Test.'
  },
  {
    id: 'comp-8',
    name: 'Infosys',
    logoText: 'INF',
    industry: 'Digital Transformation & Services',
    location: 'Bengaluru / Pune / Hyderabad',
    workType: 'Hybrid',
    companyType: 'Services',
    relevantRoles: ['Software Developer', 'Full Stack Developer', 'Java Developer'],
    commonSkills: ['Java', 'Python', 'Spring Boot', 'React', 'SQL', 'Cloud Basics'],
    careersUrl: 'https://www.infosys.com/careers.html',
    description: 'Global leader in next-generation digital services, cloud enablement, and campus recruitment programs.'
  },
  {
    id: 'comp-9',
    name: 'Zerodha',
    logoText: 'ZD',
    industry: 'Stock Brokerage & Fintech',
    location: 'Bengaluru',
    workType: 'Hybrid',
    companyType: 'Fintech',
    relevantRoles: ['Backend Developer', 'Frontend Developer', 'Python Developer'],
    commonSkills: ['Python', 'Go', 'PostgreSQL', 'Vue', 'React', 'Linux', 'Git'],
    careersUrl: 'https://zerodha.com/careers',
    description: 'Pioneered zero-brokerage trading in India with lean, open-source-first engineering architecture.'
  }
];

export const INITIAL_QUESTION_BANK: QuestionBankItem[] = [
  // HR Questions
  {
    id: 'q-hr-1',
    category: 'hr',
    difficulty: 'beginner',
    question: 'Tell me about yourself and your journey into technology.',
    keyConcepts: ['Background', 'Key Projects', 'Technical Passions', 'Career Objective'],
    sampleAnswerTips: 'Follow the Present-Past-Future framework: current status & skills, notable academic projects or internships, and why this role fits your future.',
    practiceCount: 342
  },
  {
    id: 'q-hr-2',
    category: 'hr',
    difficulty: 'beginner',
    question: 'Why should we hire you as a fresher / early career engineer?',
    keyConcepts: ['Core Competencies', 'Learning Agility', 'Culture Fit', 'Eagerness to Deliver'],
    sampleAnswerTips: 'Focus on your strong computer science foundation, proven self-driven project builds, and speed of adapting to new tech stacks.',
    practiceCount: 289
  },
  {
    id: 'q-hr-3',
    category: 'hr',
    difficulty: 'intermediate',
    question: 'What is a significant challenge you faced in a project and how did you overcome it?',
    keyConcepts: ['STAR Method', 'Root Cause Analysis', 'Resilience', 'Outcome'],
    sampleAnswerTips: 'Structure with Situation, Task, Action, and Result. Highlight the specific technical decision or debugging effort you led.',
    practiceCount: 215
  },
  {
    id: 'q-hr-4',
    category: 'hr',
    difficulty: 'beginner',
    question: 'What are your greatest technical strengths and one genuine area you are currently improving?',
    keyConcepts: ['Self-Awareness', 'Strengths with Evidence', 'Actionable Improvement Plan'],
    sampleAnswerTips: 'State a strength with an example. For weakness, choose a non-fatal skill you are actively learning (e.g., Docker containerization or public speaking) with steps taken.',
    practiceCount: 198
  },
  {
    id: 'q-hr-5',
    category: 'hr',
    difficulty: 'intermediate',
    question: 'Where do you envision your engineering career in three to five years?',
    keyConcepts: ['Depth of Knowledge', 'System Ownership', 'Mentorship', 'Impact'],
    sampleAnswerTips: 'Express enthusiasm to master core architecture, take end-to-end feature ownership, and mentor incoming juniors while contributing to scalable systems.',
    practiceCount: 176
  },

  // Java Questions
  {
    id: 'q-java-1',
    category: 'java',
    difficulty: 'beginner',
    question: 'Explain the four core principles of Object-Oriented Programming (OOP) with real-world software examples.',
    keyConcepts: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
    sampleAnswerTips: 'Give code-relatable analogies: Encapsulation (BankAccount with private balance and getter/setter), Abstraction (Vehicle interface vs Car), Polymorphism (Overloading vs Overriding).',
    practiceCount: 420
  },
  {
    id: 'q-java-2',
    category: 'java',
    difficulty: 'intermediate',
    question: 'How does HashMap internally work in Java 8? What happens during a hash collision?',
    keyConcepts: ['Hashing', 'Buckets', 'HashCode and Equals', 'LinkedList to Balanced Tree (Red-Black Tree)'],
    sampleAnswerTips: 'Mention the array of Node buckets, how hash code calculates index, chaining for collision, and treeification when bucket length exceeds threshold 8.',
    practiceCount: 310
  },
  {
    id: 'q-java-3',
    category: 'java',
    difficulty: 'advanced',
    question: 'Explain the difference between StringBuffer, StringBuilder, and String. Why is String immutable?',
    keyConcepts: ['String Pool', 'Thread Safety', 'Synchronization', 'Security and Caching'],
    sampleAnswerTips: 'String is immutable for caching, security, and thread safety. StringBuilder is mutable & unsynchronized (faster); StringBuffer is synchronized (thread-safe).',
    practiceCount: 260
  },

  // Python Questions
  {
    id: 'q-py-1',
    category: 'python',
    difficulty: 'beginner',
    question: 'Explain the differences between lists, tuples, sets, and dictionaries in Python.',
    keyConcepts: ['Mutability', 'Order', 'Indexing', 'Hashing and Lookup Time'],
    sampleAnswerTips: 'Highlight that lists are ordered & mutable; tuples are ordered & immutable; sets are unordered with unique elements; dicts store key-value pairs with O(1) average lookup.',
    practiceCount: 380
  },
  {
    id: 'q-py-2',
    category: 'python',
    difficulty: 'intermediate',
    question: 'What is the Global Interpreter Lock (GIL) in Python and how does it affect multi-threaded programs?',
    keyConcepts: ['GIL', 'CPython', 'CPU-Bound vs I/O-Bound', 'Multiprocessing vs Multithreading'],
    sampleAnswerTips: 'Explain that CPython uses a mutex to allow only one thread to execute Python bytecode at a time, making multiprocessing better for CPU-bound tasks.',
    practiceCount: 245
  },

  // JavaScript Questions
  {
    id: 'q-js-1',
    category: 'javascript',
    difficulty: 'beginner',
    question: 'Explain the difference between let, const, and var in modern JavaScript.',
    keyConcepts: ['Block Scope vs Function Scope', 'Hoisting', 'Temporal Dead Zone', 'Re-assignment'],
    sampleAnswerTips: 'Var is function-scoped and hoisted with undefined. Let and const are block-scoped and hoisted inside the TDZ; const requires initial value and forbids re-assignment.',
    practiceCount: 512
  },
  {
    id: 'q-js-2',
    category: 'javascript',
    difficulty: 'intermediate',
    question: 'How does the JavaScript Event Loop work? What is the difference between Macro-tasks and Micro-tasks?',
    keyConcepts: ['Call Stack', 'Callback Queue', 'Microtask Queue', 'Promises vs setTimeout'],
    sampleAnswerTips: 'Call stack runs synchronous code. Microtask queue (Promises, queueMicrotask) executes completely after each stack clearance before Macrotasks (setTimeout, setInterval).',
    practiceCount: 460
  },

  // React Questions
  {
    id: 'q-react-1',
    category: 'react',
    difficulty: 'beginner',
    question: 'What are React Hooks? Why were they introduced over class component lifecycle methods?',
    keyConcepts: ['useState', 'useEffect', 'Functional Components', 'Logic Reuse', 'Clean Composition'],
    sampleAnswerTips: 'Hooks allow functional components to maintain state and side effects without complex class hierarchies, avoiding "wrapper hell" and `this` binding bugs.',
    practiceCount: 490
  },
  {
    id: 'q-react-2',
    category: 'react',
    difficulty: 'intermediate',
    question: 'Explain the useEffect dependency array. What happens when it is omitted, empty, or populated?',
    keyConcepts: ['Dependency Array', 'Mounting', 'Update Lifecycle', 'Cleanup Function', 'Infinite Loop Prevention'],
    sampleAnswerTips: 'No array runs on every render; [] runs once on mount and cleans up on unmount; [deps] re-runs only when dependencies change by shallow equality comparison.',
    practiceCount: 395
  },

  // SQL Questions
  {
    id: 'q-sql-1',
    category: 'sql',
    difficulty: 'beginner',
    question: 'Explain the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN.',
    keyConcepts: ['Relational Sets', 'Null Handling', 'Matching Keys', 'Table Venn Diagrams'],
    sampleAnswerTips: 'INNER returns records matching in both tables. LEFT returns all left records + matching right. RIGHT is reverse. FULL returns all records with NULLs for non-matches.',
    practiceCount: 470
  },
  {
    id: 'q-sql-2',
    category: 'sql',
    difficulty: 'intermediate',
    question: 'What is the difference between WHERE and HAVING clauses in SQL? Give an example.',
    keyConcepts: ['Filter Before Aggregation', 'Filter After GROUP BY', 'Aggregate Functions'],
    sampleAnswerTips: 'WHERE filters rows before aggregation and cannot take aggregate functions (SUM, AVG). HAVING filters aggregated groups after GROUP BY.',
    practiceCount: 340
  },

  // Aptitude Questions
  {
    id: 'q-apt-1',
    category: 'aptitude',
    difficulty: 'beginner',
    question: 'Pipe A can fill a tank in 6 hours and Pipe B in 9 hours. How long will both take working together?',
    keyConcepts: ['Work & Time', 'Reciprocal Rates', 'LCM Method'],
    sampleAnswerTips: 'Rate of A = 1/6, Rate of B = 1/9. Combined rate = 1/6 + 1/9 = (3+2)/18 = 5/18 tank/hr. Total time = 18/5 = 3.6 hours (3 hours 36 minutes).',
    practiceCount: 220
  }
];

export const INITIAL_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'code-1',
    title: 'Two Sum',
    difficulty: 'easy',
    category: 'Arrays & Hashing',
    targetRoles: ['Software Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'],
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    inputFormat: 'nums: number[], target: number',
    outputFormat: 'number[] (indices of the two numbers)',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.',
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] == 2 + 4 == 6.'
      }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums, target):
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int diff = target - nums[i];
            if (seen.count(diff)) return {seen[diff], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`
    },
    testCases: [
      {
        id: 'tc-1',
        input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }),
        expectedOutput: '[0,1]'
      },
      {
        id: 'tc-2',
        input: JSON.stringify({ nums: [3, 2, 4], target: 6 }),
        expectedOutput: '[1,2]'
      },
      {
        id: 'tc-3',
        input: JSON.stringify({ nums: [3, 3], target: 6 }),
        expectedOutput: '[0,1]'
      }
    ]
  },
  {
    id: 'code-2',
    title: 'Valid Anagram',
    difficulty: 'easy',
    category: 'Strings & Hashing',
    targetRoles: ['Software Developer', 'Frontend Developer', 'Backend Developer'],
    description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
    inputFormat: 's: string, t: string',
    outputFormat: 'boolean',
    constraints: '1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.',
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: 'true'
      },
      {
        input: 's = "rat", t = "car"',
        output: 'false'
      }
    ],
    starterCode: {
      javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const ch of s) count[ch] = (count[ch] || 0) + 1;
  for (const ch of t) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
}`,
      python: `def isAnagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    return sorted(s) == sorted(t)`,
      java: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] counts = new int[26];
        for (char c : s.toCharArray()) counts[c - 'a']++;
        for (char c : t.toCharArray()) {
            if (--counts[c - 'a'] < 0) return false;
        }
        return true;
    }
}`,
      cpp: `class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int count[26] = {0};
        for (char c : s) count[c - 'a']++;
        for (char c : t) if (--count[c - 'a'] < 0) return false;
        return true;
    }
};`
    },
    testCases: [
      {
        id: 'tc-2-1',
        input: JSON.stringify({ s: 'anagram', t: 'nagaram' }),
        expectedOutput: 'true'
      },
      {
        id: 'tc-2-2',
        input: JSON.stringify({ s: 'rat', t: 'car' }),
        expectedOutput: 'false'
      },
      {
        id: 'tc-2-3',
        input: JSON.stringify({ s: 'listen', t: 'silent' }),
        expectedOutput: 'true'
      }
    ]
  },
  {
    id: 'code-3',
    title: 'Maximum Subarray (Kadane’s Algorithm)',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    targetRoles: ['Software Developer', 'Backend Developer', 'Full Stack Developer'],
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    inputFormat: 'nums: number[]',
    outputFormat: 'number',
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: 'nums = [1]',
        output: '1'
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23'
      }
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
      python: `def maxSubArray(nums):
    max_sum = nums[0]
    curr_sum = nums[0]
    for n in nums[1:]:
        curr_sum = max(n, curr_sum + n)
        max_sum = max(max_sum, curr_sum)
    return max_sum`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        int max = nums[0], curr = nums[0];
        for (int i = 1; i < nums.length; i++) {
            curr = Math.max(nums[i], curr + nums[i]);
            max = Math.max(max, curr);
        }
        return max;
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSum = nums[0], curr = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            curr = max(nums[i], curr + nums[i]);
            maxSum = max(maxSum, curr);
        }
        return maxSum;
    }
};`
    },
    testCases: [
      {
        id: 'tc-3-1',
        input: JSON.stringify({ nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }),
        expectedOutput: '6'
      },
      {
        id: 'tc-3-2',
        input: JSON.stringify({ nums: [1] }),
        expectedOutput: '1'
      },
      {
        id: 'tc-3-3',
        input: JSON.stringify({ nums: [5, 4, -1, 7, 8] }),
        expectedOutput: '23'
      }
    ]
  }
];

export const DEMO_USER_PROFILE: UserProfile = {
  id: 'usr_demo_101',
  email: 'karthik.cs@campus.edu',
  fullName: 'Karthik Akash',
  avatarUrl: '',
  location: 'Bengaluru, India',
  role: 'student',
  education: {
    college: 'National Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science and Engineering',
    graduationYear: 2026,
    cgpaOrPercentage: '8.7 CGPA'
  },
  career: {
    targetRole: 'Full Stack Developer',
    experienceLevel: 'fresher',
    preferredLocation: 'Bengaluru / Remote',
    workPreference: 'hybrid'
  },
  skills: ['Java', 'JavaScript', 'React', 'HTML', 'CSS', 'SQL', 'Git', 'OOP'],
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  createdAt: '2026-09-01T10:00:00.000Z'
};
