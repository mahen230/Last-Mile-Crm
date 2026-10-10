import { ProductDefinition } from '../types/models';

export const POSTAL_PRODUCTS: ProductDefinition[] = [
  {
    id: 'prod-ssa',
    code: 'SSA',
    name: 'Sukanya Samriddhi Yojana (SSA)',
    category: 'Child & Women Empowerment',
    tagline: 'Bright financial future and high tax-free returns for your daughter',
    description: 'A sovereign-guaranteed, high-interest savings scheme dedicated to empowering girl children in India with education and marriage funding support.',
    interestRateOrBonus: '8.2% p.a. (Highest Government Small Savings Rate)',
    minInvestment: '₹250 per financial year',
    maxInvestment: '₹1,50,000 per financial year',
    tenure: '21 years from account opening (deposits required for 15 years)',
    taxBenefits: 'Triple Tax Exemption (EEE) under Section 80C, interest & maturity 100% tax-free',
    isPopular: true,
    targetAudience: 'Parents/guardians of girl children aged between 0 and 10 years',
    eligibility: [
      'Girl child must be an Indian resident below 10 years of age at the time of opening',
      'Maximum of two girl children per family (allowed for twins/triplets as per rules)',
      'Account managed by natural/legal guardian until child turns 18'
    ],
    keyBenefits: [
      'Highest sovereign interest rate with annual compounding',
      'Exempt-Exempt-Exempt (EEE) status: Deposit, interest, and maturity are completely tax-free',
      'Partial withdrawal up to 50% of balance permitted after age 18 for higher education',
      'Account transferable across any post office branch throughout India'
    ],
    requiredDocuments: [
      'Girl Child Birth Certificate issued by municipal authority',
      'Identity proof of Parent/Guardian (Aadhaar Card / Voter ID / Passport)',
      'Address proof of Parent/Guardian (Aadhaar Card / Utility Bill)',
      '2 Passport size photographs of Guardian and Child'
    ],
    howToApply: [
      'Step 1: Fill out Form 1 at your local Post Office branch or submit callback request here.',
      'Step 2: Attach child birth certificate and KYC documents.',
      'Step 3: Deposit initial amount (min ₹250) via cash, cheque, or IPPB transfer.',
      'Step 4: Receive your dedicated SSA Passbook with tracking number.'
    ],
    faqs: [
      {
        question: 'Can I open an SSA account for my 7-year-old daughter?',
        answer: 'Yes, any girl child up to 10 years of age is eligible to open a Sukanya Samriddhi Account.'
      },
      {
        question: 'What happens if I miss depositing the minimum ₹250 in a year?',
        answer: 'The account can be regularized by paying a nominal penalty of ₹50 along with the minimum deposit of ₹250 for each lapsed year.'
      },
      {
        question: 'When can money be withdrawn for higher education?',
        answer: 'Up to 50% of the balance at the end of preceding financial year can be withdrawn once the child reaches 18 years of age or passes 10th standard.'
      }
    ]
  },
  {
    id: 'prod-ppf',
    code: 'PPF',
    name: 'Public Provident Fund (PPF)',
    category: 'Savings & Deposits',
    tagline: '15-year long-term wealth creation with 100% government security',
    description: 'A premier long-term savings cum tax-saving instrument backed by the Central Government of India, offering compounding tax-free returns and loan facilities.',
    interestRateOrBonus: '7.1% p.a. (Compounded Annually)',
    minInvestment: '₹500 per financial year',
    maxInvestment: '₹1,50,000 per financial year',
    tenure: '15 years (extendable in 5-year blocks indefinitely with or without deposits)',
    taxBenefits: 'EEE status under Section 80C (up to ₹1.5 Lakh/yr deduction; interest & maturity exempt)',
    isPopular: true,
    targetAudience: 'Salaried professionals, self-employed individuals, business owners, and conservative investors',
    eligibility: [
      'Any resident Indian individual in their own name',
      'Guardian on behalf of a minor child',
      'Only one PPF account per individual allowed nationwide'
    ],
    keyBenefits: [
      'Immunity from court attachment for debts and liabilities',
      'Flexible deposit schedule (lump-sum or monthly in multiples of ₹50)',
      'Loan facility available from 3rd to 6th financial year at nominal interest rate',
      'Partial withdrawal allowed from 7th financial year onwards'
    ],
    requiredDocuments: [
      'Account Opening Form (Form-A)',
      'Aadhaar Card and PAN Card (Mandatory)',
      'Address proof',
      '2 Recent passport size photographs'
    ],
    howToApply: [
      'Submit Form-A with KYC documents at your nearest Post Office.',
      'Deposit initial investment amount.',
      'Link with India Post Payments Bank (IPPB) for auto-debit and online monitoring.'
    ],
    faqs: [
      {
        question: 'Can I extend my PPF account after 15 years?',
        answer: 'Yes, you can extend your account in blocks of 5 years with or without fresh contributions.'
      },
      {
        question: 'Is the interest earned on PPF taxable?',
        answer: 'No, all interest earned and the final maturity proceed are 100% exempt from Income Tax.'
      }
    ]
  },
  {
    id: 'prod-pli-suraksha',
    code: 'PLI_SURAKSHA',
    name: 'Postal Life Insurance: Whole Life Assurance (Suraksha)',
    category: 'Postal Life Insurance',
    tagline: 'Maximum bonus rate & lowest premium life insurance protection in India',
    description: 'A whole life policy where the sum assured with accrued bonus is payable to the insured upon reaching age 80, or to the nominee in the event of earlier death.',
    interestRateOrBonus: '₹76 per thousand Sum Assured per year (Highest bonus among all life insurers)',
    minInvestment: 'Minimum Sum Assured ₹20,000; Maximum ₹50,00,000',
    tenure: 'Premium payable up to age 55, 58, or 60 years',
    taxBenefits: 'Tax deduction on premiums under Section 80C; death benefit/maturity tax-free under 10(10D)',
    isPopular: true,
    targetAudience: 'Central/State Govt employees, PSUs, teachers, doctors, engineers, banking staff, and qualified professionals',
    eligibility: [
      'Age between 19 and 55 years at entry',
      'Employees of Central/State Govts, Defence, Paramilitary, Banks, Universities, Govt-aided schools, Autonomous bodies, Listed company professionals'
    ],
    keyBenefits: [
      'Industry-leading bonus rate of ₹76/₹1,000 Sum Assured per year',
      'Option to convert into Endowment Assurance policy after 1 year and up to 57 years of age',
      'Loan facility available after 4 years of policy maintenance',
      'Surrender value available after 3 years'
    ],
    requiredDocuments: [
      'PLI Proposal Form',
      'Proof of Employment / Salary Slip / Professional Qualification Certificate',
      'Age proof (Birth Certificate / Class 10th Certificate)',
      'Medical Examination Report by authorized Medical Examiner'
    ],
    howToApply: [
      'Consult our certified Postal Field Agent or submit a proposal request.',
      'Submit identity, employment, and medical fitness form.',
      'Pay first premium at Post Office counter or online through IPPB.'
    ],
    faqs: [
      {
        question: 'Why does PLI have a higher bonus than private life insurance?',
        answer: 'PLI has extremely low administrative expense ratios and passes surplus profits back to policyholders as high bonuses.'
      },
      {
        question: 'Can private sector employees take PLI?',
        answer: 'Professionals with recognized degrees (Engineers, Doctors, Lawyers, CA, MBA, MCA, IT professionals) and employees of NSE/BSE listed companies are eligible.'
      }
    ]
  },
  {
    id: 'prod-pli-santosh',
    code: 'PLI_SANTOSH',
    name: 'Postal Life Insurance: Endowment Assurance (Santosh)',
    category: 'Postal Life Insurance',
    tagline: 'Guaranteed maturity payout with high annual bonus accumulation',
    description: 'An endowment policy where the insured person is given an assurance to the extent of the sum assured with accrued bonus on attaining predetermined maturity age.',
    interestRateOrBonus: '₹52 per thousand Sum Assured per year',
    minInvestment: 'Minimum Sum Assured ₹20,000; Maximum ₹50,00,000',
    tenure: 'Predetermined maturity at age 35, 40, 45, 50, 55, 58, or 60 years',
    taxBenefits: 'Section 80C rebate & Section 10(10D) tax exemption on claims and maturity',
    isPopular: true,
    targetAudience: 'Govt employees, educators, engineers, corporate professionals seeking disciplined maturity savings',
    eligibility: ['Age at entry: 19 to 55 years', 'Eligible professionals and government/corporate employees'],
    keyBenefits: [
      'Substantial annual bonus of ₹52/₹1,000 Sum Assured',
      'Loan facility accessible after 3 years',
      'Surrender facility available after 3 years',
      'Full Sum Assured + accrued bonus paid to family in case of unfortunate demise'
    ],
    requiredDocuments: ['Proposal Form', 'Identity & Address Proof', 'Employment Proof / Professional Degree', 'Medical Certificate'],
    howToApply: ['Submit proposal with KYC at Post Office', 'Undergo medical check-up if sum assured requires', 'Receive policy bond'],
    faqs: [
      { question: 'What is the minimum policy term?', answer: 'The term depends on entry age and chosen maturity age (minimum 5 years).' }
    ]
  },
  {
    id: 'prod-mis',
    code: 'MIS',
    name: 'Post Office Monthly Income Scheme (MIS)',
    category: 'Social Security & Pension',
    tagline: 'Guaranteed monthly cash flow into your savings account',
    description: 'A dependable government deposit scheme designed to provide steady monthly interest income directly deposited into your savings account for 5 years.',
    interestRateOrBonus: '7.4% p.a. (Paid Monthly)',
    minInvestment: '₹1,000 (Maximum ₹9 Lakh for Single; ₹15 Lakh for Joint Account)',
    tenure: '5 Years',
    taxBenefits: 'No TDS deducted at source; interest is taxable as per individual slab',
    isPopular: true,
    targetAudience: 'Retirees, senior citizens, housewives, and anyone seeking predictable monthly cash flow',
    eligibility: ['Single adult', 'Joint Account (up to 3 adults with equal share)', 'Guardian on behalf of minor'],
    keyBenefits: [
      'Predictable monthly dividend income credited automatically to Post Office / IPPB Savings Account',
      'Joint account holding up to ₹15,00,000 (monthly income of approx ₹9,250)',
      'Premature closure allowed after 1 year with nominal deduction',
      'Safe principal preservation with sovereign government guarantee'
    ],
    requiredDocuments: ['Account Opening Form', 'Aadhaar Card', 'PAN Card', '2 Photographs'],
    howToApply: ['Open a Post Office Savings Account', 'Deposit MIS application with cheque/cash', 'Set auto-credit for monthly income'],
    faqs: [
      { question: 'How much monthly income can a couple get from ₹15 Lakh?', answer: 'At 7.4% p.a., a ₹15,00,000 joint investment pays ₹9,250 every month.' }
    ]
  },
  {
    id: 'prod-scss',
    code: 'SCSS',
    name: 'Senior Citizen Savings Scheme (SCSS)',
    category: 'Social Security & Pension',
    tagline: 'High quarterly pension returns for senior citizens aged 60+',
    description: 'The highest-yielding retirement security scheme offering quarterly interest payouts and Section 80C tax deduction for individuals who have served the nation.',
    interestRateOrBonus: '8.2% p.a. (Paid Quarterly)',
    minInvestment: '₹1,000 (Maximum ₹30,00,000)',
    tenure: '5 Years (Extendable by 3 additional years)',
    taxBenefits: 'Investment eligible for Section 80C tax deduction up to ₹1.5 Lakh',
    isPopular: true,
    targetAudience: 'Individuals aged 60 years and above, retired defense personnel aged 50+, VRS retirees aged 55+',
    eligibility: [
      'Individual aged 60 years or more',
      'Civilian retirees above 55 years (within 1 month of retirement benefits receipt)',
      'Retired Defense personnel above 50 years'
    ],
    keyBenefits: [
      'Top-tier 8.2% p.a. sovereign interest paid on 1st of April, July, October, and January',
      'Investment limit expanded up to ₹30 Lakh per individual / couple',
      'Full capital security by Government of India',
      'Premature withdrawal allowed after 1 year'
    ],
    requiredDocuments: ['SCSS Opening Form', 'Aadhaar & PAN Card', 'Retirement & Age Proof (PPO / Pension Order for retirees)'],
    howToApply: ['Submit SCSS form at Post Office within 1 month of retirement benefit credit', 'Link with SB account for auto-credits'],
    faqs: [
      { question: 'Can husband and wife both invest ₹30 Lakh each?', answer: 'Yes, if both meet age eligibility, each spouse can open independent accounts up to ₹30 Lakh.' }
    ]
  },
  {
    id: 'prod-rd',
    code: 'RD',
    name: 'National Savings Recurring Deposit (5-Year RD)',
    category: 'Savings & Deposits',
    tagline: 'Disciplined monthly savings with quarterly compounded interest',
    description: 'A 5-year systematic savings vehicle where a fixed sum is invested every month, accumulating a healthy corpus with guaranteed returns.',
    interestRateOrBonus: '6.7% p.a. (Compounded Quarterly)',
    minInvestment: '₹100 per month (in multiples of ₹10, no upper limit)',
    tenure: '5 Years (60 monthly deposits, extendable for another 5 years)',
    taxBenefits: 'Standard interest rules; convenient systematic savings',
    isPopular: true,
    targetAudience: 'Small business owners, daily/monthly wage earners, students, and disciplined savers',
    eligibility: ['Any Indian resident adult', 'Joint Account (up to 3 adults)', 'Minor above 10 years in own name'],
    keyBenefits: [
      'Start with as little as ₹100 per month',
      'Loan against deposit up to 50% of credit balance available after 1 year',
      'Advance rebate available on paying 6 or 12 months in advance',
      'Can be automated via IPPB Mobile Banking Standing Instructions'
    ],
    requiredDocuments: ['RD Account Form', 'Aadhaar & PAN Card', '2 Photographs'],
    howToApply: ['Visit post office counter or setup online standing instruction via IPPB mobile app'],
    faqs: [
      { question: 'Can I pay advance installments in RD?', answer: 'Yes, rebate is granted on advance deposits of 6 or 12 months.' }
    ]
  },
  {
    id: 'prod-td',
    code: 'TD',
    name: 'Post Office Time Deposit (TD / Fixed Deposit)',
    category: 'Savings & Deposits',
    tagline: 'Guaranteed fixed deposit terms from 1 to 5 years',
    description: 'Term deposit offering sovereign security and quarterly compounding interest across 1, 2, 3, and 5-year tenures.',
    interestRateOrBonus: '1-Yr: 6.9%, 2-Yr: 7.0%, 3-Yr: 7.1%, 5-Yr: 7.5% p.a.',
    minInvestment: '₹1,000 (Multiples of ₹100, no maximum limit)',
    tenure: 'Choice of 1, 2, 3, or 5 Years',
    taxBenefits: '5-Year TD qualifies for Income Tax deduction under Section 80C',
    targetAudience: 'Conservative depositors seeking higher safety and competitive fixed returns',
    eligibility: ['Adult Indian residents', 'Minors represented by guardians', 'Joint holding up to 3 persons'],
    keyBenefits: [
      'High interest rate compounded quarterly and payable annually',
      '5-Year term qualifies for Section 80C rebate',
      'Pledging facility available for bank loan collateral'
    ],
    requiredDocuments: ['TD Opening Form', 'Aadhaar Card', 'PAN Card'],
    howToApply: ['Submit form with investment cheque/cash at any Post Office'],
    faqs: [
      { question: 'Is 5-year TD tax exempt?', answer: 'The deposit amount qualifies for 80C tax deduction up to ₹1.5 Lakh.' }
    ]
  },
  {
    id: 'prod-nsc',
    code: 'NSC',
    name: 'National Savings Certificate (NSC - VIII Issue)',
    category: 'Savings & Deposits',
    tagline: '5-year tax-saving capital growth with government guarantee',
    description: 'A popular certificate scheme offering assured cumulative growth over 5 years with annual compounding and Section 80C deduction.',
    interestRateOrBonus: '7.7% p.a. (Compounded Annually, paid at maturity)',
    minInvestment: '₹1,000 (No maximum ceiling)',
    tenure: '5 Years',
    taxBenefits: 'Qualifies under Section 80C; interest accrued is deemed reinvested and eligible for 80C deduction in initial 4 years',
    targetAudience: 'Taxpayers seeking safe fixed returns and loan collateral assets',
    eligibility: ['Any resident Indian individual'],
    keyBenefits: [
      '₹1,000 grows to ₹1,449.03 in 5 years with 100% safety',
      'Widely accepted by nationalized and commercial banks as loan security/collateral',
      'No Tax Deducted at Source (TDS)'
    ],
    requiredDocuments: ['NSC Application Form', 'Aadhaar & PAN Card'],
    howToApply: ['Purchase certificates in electronic/passbook mode at post office'],
    faqs: [
      { question: 'Can NSC be used for bank loans?', answer: 'Yes, NSC certificates are accepted as prime collateral by all commercial banks.' }
    ]
  },
  {
    id: 'prod-kvp',
    code: 'KVP',
    name: 'Kisan Vikas Patra (KVP)',
    category: 'Savings & Deposits',
    tagline: 'Guaranteed doubling of your money in 115 months',
    description: 'A government-backed savings certificate that doubles your principal amount upon maturity with sovereign guarantee and flexible liquidity.',
    interestRateOrBonus: '7.5% p.a. (Doubles investment in 115 months / 9 years 7 months)',
    minInvestment: '₹1,000 (No maximum limit)',
    tenure: '115 Months (Premature encashment allowed after 2 years and 6 months)',
    taxBenefits: 'No TDS; safe capital accumulation',
    targetAudience: 'Long-term wealth builders seeking assured doubling of funds without stock market volatility',
    eligibility: ['Indian resident adults and guardians on behalf of minors'],
    keyBenefits: [
      'Clear guaranteed doubling of initial investment amount',
      'Premature encashment permitted after 2.5 years',
      'Can be transferred from one person to another and across post offices'
    ],
    requiredDocuments: ['KVP Application Form', 'Aadhaar Card', 'PAN Card'],
    howToApply: ['Deposit funds at post office counter to receive KVP Certificate'],
    faqs: [
      { question: 'When can I prematurely withdraw KVP?', answer: 'Premature encashment is permitted anytime after 30 months (2.5 years).' }
    ]
  },
  {
    id: 'prod-ippb-banking',
    code: 'IPPB_BANKING',
    name: 'India Post Payments Bank (IPPB) Digital Account',
    category: 'Digital Banking & Aadhaar',
    tagline: 'Zero-balance instant digital banking with Doorstep Postman service',
    description: 'A cutting-edge modern digital savings account offering zero balance maintenance, mobile app transfers, QR cards, and AePS cash delivery right at your home.',
    interestRateOrBonus: 'Up to 2.5% to 3.0% p.a. on savings balance',
    minInvestment: '₹0 (Zero Balance Account)',
    tenure: 'Continuous digital account',
    taxBenefits: 'Standard savings interest exemption up to ₹10,000 under Section 80TTA',
    isPopular: true,
    targetAudience: 'Every citizen, rural households, students, senior citizens, and merchant shopkeepers',
    eligibility: ['Indian residents above 10 years of age with Aadhaar and Mobile number'],
    keyBenefits: [
      'Doorstep cash delivery through Postman / Grameen Dak Sevak via Aadhaar (AePS)',
      'Seamless linkage to Post Office schemes (SSA, PPF, RD, PLI premium payments)',
      'Virtual RuPay Debit Card for online shopping and UPI transactions',
      'Direct Benefit Transfer (DBT) subsidy receiver'
    ],
    requiredDocuments: ['Aadhaar Card', 'Registered Mobile Number (e-KYC with biometric fingerprint)'],
    howToApply: [
      'Call your local Postman or visit the Post Office.',
      'Instant paperless account opening within 5 minutes using biometric thumb impression.'
    ],
    faqs: [
      { question: 'Can Postman deliver cash at my home?', answer: 'Yes, using Aadhaar Enabled Payment System (AePS), Postman can deliver cash from any bank account to your doorstep.' }
    ]
  },
  {
    id: 'prod-celc-aadhaar',
    code: 'CELC_AADHAAR',
    name: 'Aadhaar & CELC Doorstep Services',
    category: 'Digital Banking & Aadhaar',
    tagline: 'Child Aadhaar enrolment (0-5 yrs) & Mobile update at your doorstep',
    description: 'Doorstep Aadhaar enrolment for children below 5 years (CELC) and mobile number linking/updating for citizens performed directly by certified Postal Operators.',
    interestRateOrBonus: 'Child Enrolment: FREE; Mobile Update: Government authorized ₹50 fee',
    minInvestment: '₹0 for Child Enrolment',
    tenure: 'On-demand service',
    taxBenefits: 'Essential identity service',
    isPopular: true,
    targetAudience: 'Newborns and children below 5 years, citizens needing mobile number updates for banking/Govt OTPs',
    eligibility: ['Child below 5 years with birth certificate', 'Any citizen holding Aadhaar'],
    keyBenefits: [
      'No need to stand in long queues at enrollment centres',
      'Child Aadhaar created with birth certificate and parent biometric authentication',
      'Quick mobile number linkage enabling DBT subsidies and digital OTP verification'
    ],
    requiredDocuments: ['Child Birth Certificate', 'Parent Aadhaar Card (For Child Enrolment)'],
    howToApply: ['Submit a callback/doorstep visit request through this portal or contact your beat Postman'],
    faqs: [
      { question: 'Are child fingerprints taken for 0-5 years?', answer: 'No biometric fingerprint is taken for children below 5 years; facial photo and parent authentication are used.' }
    ]
  }
];
