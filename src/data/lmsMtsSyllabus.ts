export interface LMSTopicQuizQuestion {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  pyqTag?: string; // e.g., "[PYQ 2024 Exam Question]"
  ruleClause?: string;
}

export interface LMSTopicTheorySection {
  heading: string;
  clauseRef: string;
  bullets: string[];
  pyqHighlight?: string;
}

export interface LMSExtendedTopic {
  id: string;
  title: string;
  ruleReference: string;
  pyqBadge?: string;
  keyPoints: string[];
  detailedTheory: LMSTopicTheorySection[];
  topicQuiz: LMSTopicQuizQuestion[];
}

export interface LMSExtendedModule {
  id: string;
  categoryId: 'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA';
  paper: string;
  subject: string;
  marksWeightage: string;
  description: string;
  officialSyllabusBoundary: string;
  studyNotesSummary: string[];
  topics: LMSExtendedTopic[];
}

export const GDS_MTS_MODULES: LMSExtendedModule[] = [
  {
    id: 'MOD-MTS-01',
    categoryId: 'GDS_MTS',
    paper: 'Paper-I (Part A)',
    subject: 'Post Office Guide Part I (Clauses 1 to 57, Products & Prohibited Articles)',
    marksWeightage: '46 Marks (23 Questions × 2 Marks)',
    description:
      'Complete statutory coverage of PO Guide Part I: Organization of Department, Classes of POs, Business Hours, Payment of Postage, Franking Machines, Packing, Sealing, Method of Address, Post Boxes/Bags, Duties of Letter Box Peon, Official Postal Articles & Prohibited Articles.',
    officialSyllabusBoundary: 'Department of Posts LDCE MTS Syllabus — Paper-I Part A (Section 1: PO Guide Part I)',
    studyNotesSummary: [
      '[PYQ 2024 Exam Question] Apex Governing Body: Postal Services Board at Dak Bhawan, New Delhi, chaired by Secretary (Posts) with 6 Members (Operations, Technology, PLI, Banking & DBT, Personnel, Planning & HRD).',
      '[PYQ 2023 Exam Question] 23 Territorial Postal Circles headed by Chief Postmaster General (CPMG) + Base Circle headed by Additional Director General (APS) with 1 CBPO (56 APO New Delhi) & 2 CBPO (99 APO Kolkata).',
      '[PYQ 2022 Exam Question] Classes of Post Offices (Clause 2): Head Post Office (H.O.), Sub-Post Office (S.O.), and Extra-Departmental / Branch Post Office (B.O. — open minimum 4 hours and maximum 5 hours daily).',
      '[PYQ 2023 Exam Question] Night Post Offices (Clause 3): Working hours fixed by Head of Circle (CPMG) and may be extended up to 8:30 PM by Director General of Posts; open on Sundays & Postal Holidays.',
      '[PYQ 2024 Exam Question] Remotely Managed Franking Machine (RMFM - Clauses 11): License issued/renewed by Divisional Head (SP/SSPOs) for 5 years (Fee ₹375); Blue/Red impression valid; 3% rebate on minimum consumption of ₹5,000.',
      '[PYQ 2021 Exam Question] Post Box (Clause 55) & Post Bag (Clause 56): Only fully prepaid UNREGISTERED articles of letter mail (Letters, Postcards, ILC, Aerogramme, Registered Newspapers, Book Packets) are delivered through Post Box. Annual rent: ₹150 single / ₹250 combined.',
    ],
    topics: [
      {
        id: 'MTS-T1',
        title: '1. Organization of the Department of Posts & 23 Postal Circles',
        ruleReference: 'PO Guide Part I — Clauses 1 to 2',
        pyqBadge: '[PYQ 2021/2023/2024 Exam Question]',
        keyPoints: [
          'Administrative Control: Ministry of Communications, Department of Posts, Dak Bhawan (Sansad Marg, New Delhi - 110001).',
          'Secretary (Posts) is also Ex-Officio Director General Postal Services & Chairman of Postal Services Board.',
          '23 Postal Circles headed by CPMG; Rajasthan Circle HQ at Jaipur; Kerala Circle covers Lakshadweep; Maharashtra Circle covers Goa.',
          'Base Circle (Army Postal Service) headed by Addl. DG (APS) in rank of Major General: 1 CBPO (56 APO New Delhi) & 2 CBPO (99 APO Kolkata).',
        ],
        detailedTheory: [
          {
            heading: 'Clause 1: Control & Apex Structure',
            clauseRef: 'PO Guide Part I, Clause 1',
            bullets: [
              'The Department of Posts is under the administrative control of the Director General of Posts, New Delhi, and functions under the Ministry of Communications.',
              'The Postal Services Board (PSB) is the apex management body comprising the Chairman (Secretary Posts), 6 functional Members, and a Permanent Invitee (Additional Secretary & Financial Advisor).',
              'Each of the 23 Postal Circles is divided into Regions (headed by Postmaster General - PMG) and Divisions (Postal Divisions headed by SSP/SP; RMS Divisions headed by SSRM/SRM).',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "How many Postal Circles and Central Base Post Offices (CBPOs) function in India?" Answer: 23 Circles and 2 CBPOs (56 APO & 99 APO).',
          },
          {
            heading: 'Important Circle Headquarters & Overlapping Jurisdictions',
            clauseRef: 'PO Guide Part I, Schedule I',
            bullets: [
              'North Eastern Circle HQ: Shillong (covers 6 states: Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Tripura).',
              'West Bengal Circle HQ: Kolkata (also covers Sikkim and Andaman & Nicobar Islands).',
              'Punjab Circle HQ: Chandigarh; Haryana Circle HQ: Ambala; Himachal Pradesh Circle HQ: Shimla; Uttarakhand Circle HQ: Dehradun.',
            ],
            pyqHighlight: '[PYQ 2022 Exam Question] Asked: "Andaman & Nicobar Islands falls under the administrative jurisdiction of which Postal Circle?" Answer: West Bengal Circle (Kolkata).',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T1-1',
            topicId: 'MTS-T1',
            question: 'Who is the Ex-Officio Chairman of the Postal Services Board at Dak Bhawan, New Delhi?',
            options: ['Member (Operations)', 'Secretary (Department of Posts)', 'Additional DG (APS)', 'Chief Postmaster General, Delhi'],
            correctIndex: 1,
            explanation: 'Under Clause 1 of PO Guide Part I, the Secretary (Department of Posts) serves as the Chairman of the Postal Services Board and Director General Postal Services.',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 1',
          },
          {
            id: 'TQ-MTS-T1-2',
            topicId: 'MTS-T1',
            question: 'What is the headquarters of the Haryana Postal Circle and North Eastern Postal Circle respectively?',
            options: ['Gurugram & Guwahati', 'Ambala & Shillong', 'Chandigarh & Shillong', 'Rohtak & Agartala'],
            correctIndex: 1,
            explanation: 'Haryana Postal Circle HQ is located at Ambala Cantt, and North Eastern (NE) Postal Circle HQ is at Shillong (Meghalaya).',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 1',
          },
          {
            id: 'TQ-MTS-T1-3',
            topicId: 'MTS-T1',
            question: 'Which two Central Base Post Offices (CBPOs) handle mail for the Army Postal Service (APS)?',
            options: ['1 CBPO (56 APO New Delhi) & 2 CBPO (99 APO Kolkata)', '1 CBPO (Mumbai) & 2 CBPO (Chennai)', '56 APO (Pune) & 99 APO (Guwahati)', '1 CBPO (Ambala) & 2 CBPO (Siliguri)'],
            correctIndex: 0,
            explanation: '1 CBPO is 56 APO located at New Delhi and 2 CBPO is 99 APO located at Kolkata.',
            pyqTag: '[PYQ 2022 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 1',
          },
        ],
      },
      {
        id: 'MTS-T2',
        title: '2. Types of Post Offices (HO, SO, BO), Night PO, Mobile PO & Business Hours',
        ruleReference: 'PO Guide Part I — Clauses 2 to 9',
        pyqBadge: '[PYQ 2022/2023/2024 Exam Question]',
        keyPoints: [
          'Three classes of Post Offices: Head Post Office (H.O.), Sub-Post Office (S.O.), and Branch Post Office (B.O.).',
          'Branch Post Offices open for minimum 4 hours and maximum 5 hours daily.',
          'Night Post Offices: Extended up to 8:30 PM by DG Posts; on Sundays/Holidays they do NOT effect delivery or pay Money Orders/SB withdrawals.',
          'Business Hours (Clause 5): Reference/Inquiry & Sale of Stamps during entire working hours; Regd/Insured booking for 6-7 hours; SB/MO for 5 hours on weekdays & 3 hours on Saturdays.',
        ],
        detailedTheory: [
          {
            heading: 'Clauses 2 to 4: Classes of Post Offices, Night PO & Mobile PO',
            clauseRef: 'PO Guide Part I, Clauses 2–4',
            bullets: [
              'First-Class Head Post Office situated at Circle Headquarters and attached to CPMG office is called General Post Office (GPO), headed by Chief Postmaster / Director.',
              'Night Post Offices (Clause 3): Authorized by Head of Circle; extended hours fixed by DG Posts up to 8:30 PM. On Sundays, Night POs book Registered articles/Speed Post, sell stamps, and accept Telegraphic MOs, but do not perform delivery or Savings Bank/Cash Certificate work.',
              'Mobile Post Offices (Clause 4): Function on vans/vehicles visiting different fixed points in big cities to provide late-evening booking of unregistered & registered mail (excluding Insured and VPP); prohibited from booking Insured articles unless specifically authorized.',
            ],
            pyqHighlight: '[PYQ 2023 Exam Question] Asked: "Who has the authority to extend the working hours of a Post Office up to 8:30 PM and declare it a Night Post Office?" Answer: Director General of Posts.',
          },
          {
            heading: 'Clauses 5 to 9: Business Hours & Post Office Holidays',
            clauseRef: 'PO Guide Part I, Clauses 5–9',
            bullets: [
              'Clause 7 (Sundays & PO Holidays): Except Night POs, all post offices and mobile post offices are closed on Sundays and Postal Holidays; no clearance of street letter boxes is effected on Sundays.',
              'Late fee articles can be posted at RMS Mail Offices or designated Night PO counters.',
              'Clause 8: Total Post Office Holidays observed in a year = 17 holidays (14 Compulsory + 3 Circle-specific holidays notified by CPMG).',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "What are the minimum and maximum daily working hours of a Branch Post Office (B.O.)?" Answer: Minimum 4 hours, Maximum 5 hours.',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T2-1',
            topicId: 'MTS-T2',
            question: 'Who is empowered to extend the working hours of a Night Post Office up to 8:30 PM?',
            options: ['Divisional Superintendent (SP)', 'Postmaster General (PMG)', 'Director General of Posts (DG)', 'Head Postmaster'],
            correctIndex: 2,
            explanation: 'As per Clause 3 of PO Guide Part I, the working hours of Night Post Offices are generally fixed by the Head of Circle, and the Director General of Posts can extend them up to 8:30 PM.',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 3',
          },
          {
            id: 'TQ-MTS-T2-2',
            topicId: 'MTS-T2',
            question: 'Which transaction is generally NOT performed at a Mobile Post Office unless specially permitted?',
            options: ['Sale of Postage Stamps', 'Booking of Registered Letters', 'Booking of Insured & VPP Articles', 'Booking of Air Mail Articles'],
            correctIndex: 2,
            explanation: 'Under Clause 4 of PO Guide Part I, Mobile Post Offices sell stamps and book registered articles of letter mail, but do NOT book Insured or Value-Payable (VPP) articles.',
            pyqTag: '[PYQ 2022 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 4',
          },
          {
            id: 'TQ-MTS-T2-3',
            topicId: 'MTS-T2',
            question: 'During Sunday working hours, which of the following transactions is SUSPENDED even at a Night Post Office?',
            options: ['Sale of Postage Stamps', 'Booking of Registered Articles', 'Delivery of Mail & Savings Bank Transactions', 'Acceptance of Late Fee Letters'],
            correctIndex: 2,
            explanation: 'As per Clause 3 of PO Guide Part I, on Sundays and National Holidays, Night Post Offices do not perform mail delivery, Money Order payment, or Savings Bank / Cash Certificate work.',
            pyqTag: '[PYQ 2021 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 3',
          },
        ],
      },
      {
        id: 'MTS-T3',
        title: '3. Payment of Postage, Stamps, Revenue Stamps & Franking Machines (RMFM)',
        ruleReference: 'PO Guide Part I — Clauses 10 to 14',
        pyqBadge: '[PYQ 2021/2023/2024 Exam Question]',
        keyPoints: [
          'Prepayment of postage mandatory in cash, postage stamps, or Franking Machine impressions.',
          'Remotely Managed Franking Machine (RMFM): Blue impression (Digifrank), license issued by Divisional Head (SP/SSPOs) for 5 years (Fee ₹375).',
          'Rebate of 3% granted on franked value when minimum consumption is ₹5,000; machine articles can be posted at max 2 specified offices.',
          'Revenue Stamps cannot be used for payment of postage; manufacture/use of fictitious stamps is an offence under Section 263-A of IPC.',
        ],
        detailedTheory: [
          {
            heading: 'Clause 10 & 11: Franking Machines & RMFM Rules',
            clauseRef: 'PO Guide Part I, Clauses 10–11',
            bullets: [
              'Types of Franking Licenses: (a) Individual/Commercial License, (b) Government Department License, (c) SOM (Single Office Multi-user) License.',
              'Franking impression consists of two dies: Value Die (showing postage amount) and License Die (showing license number & office of posting).',
              'Cut-out labels with frank impressions cannot be affixed to articles, EXCEPT in case of bulky parcels where a single franked label may be pasted.',
              'Erroneously franked envelopes/wrappers can be refunded within 3 months of the date of impression after deducting 5% on face value.',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "What is the deduction percentage when claiming a refund for an erroneous/spoiled Franking Machine impression within 3 months?" Answer: 5% of face value.',
          },
          {
            heading: 'Clauses 12 to 14: Spoiled Stamps, Revenue Stamps & Fictitious Stamps',
            clauseRef: 'PO Guide Part I, Clauses 12–14',
            bullets: [
              'Postage stamps that have been obliterated, defaced, torn, cut, or separated from embossed envelopes cannot be recognized in payment of postage.',
              'Using already-used postage stamps with intent to cause loss to Government is punishable under Indian Penal Code (IPC).',
              'Section 263-A of IPC strictly prohibits making, knowingly uttering, dealing in, or selling any fictitious stamp.',
            ],
            pyqHighlight: '[PYQ 2023 Exam Question] Asked: "Under which section of the Indian Penal Code (IPC) is the manufacture or use of fictitious postage stamps punishable?" Answer: Section 263-A of IPC.',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T3-1',
            topicId: 'MTS-T3',
            question: 'Who is the licensing authority for issuing an Individual or Commercial Franking Machine (RMFM) license?',
            options: ['Sub-Postmaster', 'Head of Postal Division (SP / SSPOs)', 'Postmaster General (PMG)', 'Director General of Posts'],
            correctIndex: 1,
            explanation: 'Under Clause 11 of PO Guide Part I, the Head of the Postal Division (SP/SSPOs) issues and renews Individual and Commercial Franking Machine licenses.',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 11',
          },
          {
            id: 'TQ-MTS-T3-2',
            topicId: 'MTS-T3',
            question: 'Within what time limit and with what deduction can an allowance/refund be claimed for spoiled or erroneously franked impressions?',
            options: ['Within 1 month with 10% deduction', 'Within 3 months with 5% deduction', 'Within 6 months with 3% deduction', 'Within 15 days with 2% deduction'],
            correctIndex: 1,
            explanation: 'Allowance for spoiled/erroneous franking impressions may be claimed within 3 months of the date of impression, subject to a deduction of 5% of face value.',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 11',
          },
          {
            id: 'TQ-MTS-T3-3',
            topicId: 'MTS-T3',
            question: 'Possession, sale, or use of "Fictitious Postage Stamps" is a criminal offence under which section of the IPC?',
            options: ['Section 260 IPC', 'Section 263-A IPC', 'Section 420 IPC', 'Section 188 IPC'],
            correctIndex: 1,
            explanation: 'Clause 14 of PO Guide Part I states that manufacture and use of fictitious stamps is punishable under Section 263-A of the Indian Penal Code.',
            pyqTag: '[PYQ 2021 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 14',
          },
        ],
      },
      {
        id: 'MTS-T4',
        title: '4. Packing, Sealing, Posting, Method of Address & Duties of Letter Box Peon',
        ruleReference: 'PO Guide Part I — Clauses 15 to 34',
        pyqBadge: '[PYQ 2022/2024 Exam Question]',
        keyPoints: [
          'Stamps must be affixed to the right-hand top corner of the address side (Clause 23).',
          'Sender address should be written in the lower left-hand corner on the address side (Clause 26).',
          'Articles Requiring Special Treatment (Registered, Insured, VPP, Franked, Free Blind Literature) CANNOT be posted in Street Letter Boxes; if found in Letter Box, Registered/Insured articles are detained and presented carefully.',
          '6-digit PIN Code introduced on 15 August 1972 (8 Regional Zones + 1 Functional Zone 9 for APS).',
        ],
        detailedTheory: [
          {
            heading: 'Clauses 15 to 25: Packing, Sealing & Posting Rules',
            clauseRef: 'PO Guide Part I, Clauses 15–25',
            bullets: [
              'Every letter, packet, or parcel must be stamped with the date-stamp of at least two Post Offices (Office of Posting and Office of Delivery).',
              'Use of Sealing Wax: Should not be used on unregistered light letters except when necessary for protection; on insured articles, every joint must bear identical private seal impressions in wax.',
              'Coins, bullion, precious stones, jewelry, or currency notes can ONLY be sent by Post if INSURED (Clause 20).',
              'Letter Box Peon Duty: Clear letter boxes punctually at fixed hours, change changeable hour-plates showing next clearance time, and bring locked letter box bag to Post Office.',
            ],
            pyqHighlight: '[PYQ 2022 Exam Question] Asked: "Where should the postage stamp and sender’s address be placed on the face of an article?" Answer: Stamp at right-hand top corner; Sender address at lower left-hand corner.',
          },
          {
            heading: 'Clauses 26 to 34: Method of Address & Army Post Office Addressing',
            clauseRef: 'PO Guide Part I, Clauses 26–34',
            bullets: [
              'Zone 1: Delhi, Haryana, Punjab, HP, J&K, Chandigarh; Zone 2: UP, Uttarakhand; Zone 3: Rajasthan, Gujarat, Daman & Diu, Dadra & Nagar Haveli; Zone 4: Maharashtra, Goa, MP, Chhattisgarh.',
              'Zone 5: Andhra Pradesh, Telangana, Karnataka; Zone 6: Tamil Nadu, Kerala, Puducherry, Lakshadweep; Zone 7: West Bengal, Odisha, Assam, Sikkim, NE States, A&N Islands; Zone 8: Bihar, Jharkhand; Zone 9: Army Postal Service (APS).',
              'Articles for Defence Personnel (Clause 30): Must be addressed to No., Rank, Name, Unit, and "Care of 56 APO" or "Care of 99 APO" without writing the town name of destination.',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "In a 6-digit PIN Code (e.g., 324009), what do the first 3 digits represent?" Answer: 1st digit = Region/Zone, 2nd digit = Sub-Region/Circle, 3rd digit = Sorting District (first 3 digits together = Sorting District).',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T4-1',
            topicId: 'MTS-T4',
            question: 'In the 6-digit Postal Index Number (PIN) system introduced on 15 August 1972, which PIN Zone is allotted to Rajasthan and Gujarat?',
            options: ['PIN Zone 2', 'PIN Zone 3', 'PIN Zone 4', 'PIN Zone 7'],
            correctIndex: 1,
            explanation: 'PIN Zone 3 covers Rajasthan (starting with 30–34) and Gujarat (starting with 36–39).',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 26',
          },
          {
            id: 'TQ-MTS-T4-2',
            topicId: 'MTS-T4',
            question: 'According to Clause 30 of PO Guide Part I, what should NEVER be written in the address of an article meant for troops serving under 56 APO or 99 APO?',
            options: ['Regimental Number', 'Rank of the Soldier', 'Actual Place/Town of Posting of the Unit', 'C/o 56 APO or 99 APO'],
            correctIndex: 2,
            explanation: 'For operational security, the actual town or location of the military unit must never be written; mail must be addressed simply to C/o 56 APO or C/o 99 APO.',
            pyqTag: '[PYQ 2022 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 30',
          },
          {
            id: 'TQ-MTS-T4-3',
            topicId: 'MTS-T4',
            question: 'If an article marked "Registered" is found posted inside a Street Letter Box instead of being presented at the Post Office counter, how is it treated?',
            options: ['Destroyed immediately', 'Sent as an unregistered letter', 'Compulsorily registered and double registration fee is collected on delivery (less any registration fee prepaid)', 'Returned to sender without registration'],
            correctIndex: 2,
            explanation: 'If an article bearing the word "Registered" is found in a letter box, it is compulsorily registered and charged on delivery with a fee equal to double the usual registration fee less any fee prepaid.',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 21',
          },
        ],
      },
      {
        id: 'MTS-T5',
        title: '5. Post Boxes (Clause 55) & Post Bags (Clause 56) Rules & Rent',
        ruleReference: 'PO Guide Part I — Clauses 55 to 56',
        pyqBadge: '[PYQ 2021/2022/2023/2024 Exam Question]',
        keyPoints: [
          'Clause 55 (Post Box): Only fully prepaid UNREGISTERED articles of letter mail (Letters, Postcards, ILC, Newspapers, Book packets) addressed to the renter are placed in Post Box.',
          'Registered, Insured, VPP, Money Orders, or Unpaid/Insufficiently paid articles are NOT placed in Post Box (only intimation slip is placed).',
          'If renter fails to clear Post Box for 7 days after notice, non-cleared articles are delivered through Postman or returned.',
          'Rent: ₹150 per financial year (or ₹50 per quarter) for Post Box OR Post Bag alone; ₹250 per year (or ₹80 per quarter) for BOTH Post Box and Post Bag combined.',
        ],
        detailedTheory: [
          {
            heading: 'Clause 55: Conditions of Post Box System',
            clauseRef: 'PO Guide Part I, Clause 55',
            bullets: [
              'Period of tenancy starts from the 1st day of the month in which the Post Box is allotted.',
              'If key/lock is lost by renter, cost of new lock & key must be deposited before replacement.',
              'Application for renewal must be made before expiry of current period (or within 15 days of expiry if Postmaster is satisfied there was sufficient cause).',
              'Legitimate partners, family members, or employees residing/working with the renter can receive mail through the same Post Box with prior registration.',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "Which Clause of Post Office Guide Part I governs the Post Box facility and Post Bag facility respectively?" Answer: Clause 55 (Post Box) and Clause 56 (Post Bag).',
          },
          {
            heading: 'Clause 56: Post Bag System',
            clauseRef: 'PO Guide Part I, Clause 56',
            bullets: [
              'Under the Post Bag system, the renter provides the bag and lock with duplicate keys (one kept at PO, one with renter).',
              'Unlike Post Box which is only at designated POs, Post Bag facility is available at ANY delivery Post Office (whether Post Box system exists there or not).',
              'Locked Post Bag containing fully prepaid unregistered letter mail is handed over to the renter or messenger at the Post Office window during business hours.',
            ],
            pyqHighlight: '[PYQ 2022 Exam Question] Asked: "Can the Post Bag facility be availed at a delivery Post Office where Post Box cabinets are not installed?" Answer: Yes, Post Bag is available at all delivery Post Offices.',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T5-1',
            topicId: 'MTS-T5',
            question: 'Which Clauses of Post Office Guide Part I deal with "Post Boxes" and "Post Bags" respectively?',
            options: ['Clause 50 & Clause 51', 'Clause 55 & Clause 56', 'Clause 60 & Clause 61', 'Clause 67 & Clause 68'],
            correctIndex: 1,
            explanation: 'Clause 55 governs Post Boxes and Clause 56 governs Post Bags in PO Guide Part I.',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'PO Guide Part I — Clauses 55 & 56',
          },
          {
            id: 'TQ-MTS-T5-2',
            topicId: 'MTS-T5',
            question: 'What is the annual rent for renting BOTH a Post Box and a Post Bag together for one financial year?',
            options: ['₹150', '₹200', '₹250', '₹300'],
            correctIndex: 2,
            explanation: 'The annual rent for a Post Box or Post Bag alone is ₹150 (₹50 per quarter), and for both Post Box and Post Bag combined is ₹250 per year (₹80 per quarter).',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'PO Guide Part I — Clauses 55 & 56',
          },
          {
            id: 'TQ-MTS-T5-3',
            topicId: 'MTS-T5',
            question: 'Which of the following articles CAN be delivered directly inside a Post Box?',
            options: ['Registered Letters', 'Unpaid Postcards', 'Fully prepaid unregistered Letters & Inland Letter Cards', 'Insured Parcels'],
            correctIndex: 2,
            explanation: 'Only fully prepaid unregistered articles of the letter mail (Letters, Postcards, ILCs, Aerogrammes, Registered Newspapers, Book Packets) can be placed inside a Post Box.',
            pyqTag: '[PYQ 2021 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 55',
          },
        ],
      },
      {
        id: 'MTS-T6',
        title: '6. Official Postal Articles ("O.I.G.S.") & Prohibited Postal Articles',
        ruleReference: 'PO Guide Part I — Clauses 198 to 214',
        pyqBadge: '[PYQ 2022/2023/2024 Exam Question]',
        keyPoints: [
          'Official Postal Articles (Clause 198): Must bear super-scription "On India Government Service" (O.I.G.S.) or "On Service" supported by signature & official designation at lower left corner.',
          'Service Stamps can be used ONLY by Government officials authorized in PO Guide List.',
          'Unpaid or insufficiently paid Official Letter / Packet is charged with the USUAL (Single) deficiency on delivery (unlike private letters which pay double deficiency).',
          'Prohibited Articles (Clauses 209–214): Explosives, dangerous substances, sharp instruments not properly protected, lottery tickets (except state-organized), gold coin/bullion exceeding ₹1,00,000.',
        ],
        detailedTheory: [
          {
            heading: 'Clauses 198 to 208: Rules for Official Postal Articles',
            clauseRef: 'PO Guide Part I, Clauses 198–208',
            bullets: [
              'Official articles sent by Government officials NOT entitled to use Service Stamps must be prepaid in ordinary postage stamps.',
              'If an Official Postal Article is posted unpaid or insufficiently paid, the postage chargeable on delivery is the single prepaid rate or single deficiency (not double).',
              'Camp Bags sent to high officers on tour may be booked as Official Parcel / Air Parcel / Passenger Train luggages.',
            ],
            pyqHighlight: '[PYQ 2023 Exam Question] Asked: "How much postage is charged on delivery for an unpaid Official Postal Article (O.I.G.S.)?" Answer: Single prepaid rate (1× deficiency, whereas private unpaid letters are charged 2× double deficiency).',
          },
          {
            heading: 'Clauses 209 to 214: General & Local Prohibitions',
            clauseRef: 'PO Guide Part I, Clauses 209–214',
            bullets: [
              'Any living creature or noxious substance, explosive, inflammable, filthy, or deleterious substance is strictly prohibited by post.',
              'Tickets, proposals, or advertisements relating to unauthorized Lotteries (excluding Lotteries organized/authorized by Central/State Government) are prohibited.',
              'Coin, bullion, platinum, precious stones, jewelry, and currency notes must be insured; maximum value of gold coin or bullion or both transmitted by post shall not exceed ₹1,00,000.',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "What is the maximum permissible value limit for sending Gold Coin or Bullion through insured post?" Answer: ₹1,00,000.',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T6-1',
            topicId: 'MTS-T6',
            question: 'What is the postage charged on delivery for an UNPAID Official Postal Article bearing the superscription "On India Government Service" (O.I.G.S.)?',
            options: ['Double the prepaid rate', 'Single prepaid rate (usual rate)', 'Three times the prepaid rate', 'Delivered free of charge'],
            correctIndex: 1,
            explanation: 'Under Clause 201 of PO Guide Part I, unpaid Official Postal Articles are charged at the single usual prepaid rate (and insufficiently paid official articles at single deficiency), unlike private articles which are charged double.',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 201',
          },
          {
            id: 'TQ-MTS-T6-2',
            topicId: 'MTS-T6',
            question: 'What is the maximum value of Gold Coin or Bullion (or both) that can be sent by post (with mandatory insurance)?',
            options: ['₹20,000', '₹50,000', '₹1,00,000', '₹2,00,000'],
            correctIndex: 2,
            explanation: 'As per Clause 209 of PO Guide Part I, gold coin or bullion or both of value exceeding ₹1,00,000 is prohibited from transmission by post.',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 209',
          },
          {
            id: 'TQ-MTS-T6-3',
            topicId: 'MTS-T6',
            question: 'Up to what weight limit is a "Blind Literature Packet" exempted from payment of postage, registration fee, and fee for acknowledgment?',
            options: ['Up to 2 kg', 'Up to 5 kg', 'Up to 7 kg', 'Up to 10 kg'],
            correctIndex: 2,
            explanation: 'Blind Literature Packets (Braille) up to a maximum weight of 7 kg are exempt from postage, registration fee, and acknowledgment fee (Air mail surcharge applies if sent by air).',
            pyqTag: '[PYQ 2022 Exam Question]',
            ruleClause: 'PO Guide Part I — Clause 132',
          },
        ],
      },
    ],
  },
  {
    id: 'MOD-MTS-02',
    categoryId: 'GDS_MTS',
    paper: 'Paper-I (Part A)',
    subject: 'Postal Manual Volume V (Definitions & Operational Rules 1 to 60)',
    marksWeightage: '14 Marks (7 Questions × 2 Marks)',
    description:
      'Complete statutory definitions from Postal Manual Volume V: HO, SO, BO, GPO, Transit Office, TMO, Sorting Office, Account Bag, Cash Bag, Camp Bag, Special Bag, Due vs Unusual Mail, Beat, Face/Facing, Late vs Too Late Letters, Mis-sent vs Mis-directed Articles, and Trial Cards M-26(a).',
    officialSyllabusBoundary: 'Department of Posts LDCE MTS Syllabus — Paper-I Part A (Section 2: Postal Manual Volume V Definitions)',
    studyNotesSummary: [
      '[PYQ 2024 Exam Question] Head Office (Rule 1), Sub-Office (Rule 2), Branch Office (Rule 3), General Post Office (Rule 4 — First-class HO situated at Circle HQ attached to CPMG).',
      '[PYQ 2023 Exam Question] Transit Office (Rule 6) & Transit Mail Office / TMO (Rule 7): Deals ONLY with closed bags without opening them to sort contents.',
      '[PYQ 2022 Exam Question] Cash Bag (Rule 25): Used to enclose cash & stamps between HO and SO; NEVER dispatched loose — always enclosed inside an Account Bag or Registered Bag.',
      '[PYQ 2024 Exam Question] Account Bag (Rule 26): Exchanged between HO and SO; HO→SO contains S.O. Daily Account; SO→HO contains S.O. Slip, vouchers & Cash Bag. Always a DUE Bag.',
      '[PYQ 2023 Exam Question] Mis-sent vs Mis-directed Article (Rule 52): Mis-sent is erroneously sent contrary to routing; Mis-directed has wrong English destination written by office of posting.',
      '[PYQ 2021 Exam Question] Trial Card Form M-26(a) (Rule 57): Service postcard used to determine relative advantage of alternative mail routes or cause of detention.',
    ],
    topics: [
      {
        id: 'MTS-T7',
        title: '7. Definitions of Offices: HO, SO, BO, GPO, Transit Office, TMO, Sorting Office & RLO',
        ruleReference: 'Postal Manual Vol V — Rules 1 to 17',
        pyqBadge: '[PYQ 2021/2023/2024 Exam Question]',
        keyPoints: [
          'Rule 1 (Head Post Office): Chief office of a group of POs incorporating monetary accounts of itself and subordinate SOs/BOs.',
          'Rule 6 (Transit Office): Any Post Office situated on a mail line which receives and sorts bags intended for offices ahead without opening them.',
          'Rule 7 (Transit Mail Office - TMO): Branch of RMS where closed bags are received and dispatched without sorting of letters.',
          'Rule 8 (Sorting Office) & Rule 9 (Sorting Mail Office): Offices charged with opening mail bags received and sorting their contents.',
        ],
        detailedTheory: [
          {
            heading: 'Rules 1 to 5: Post Office Hierarchy & GPO',
            clauseRef: 'Postal Manual Vol V, Rules 1–5',
            bullets: [
              'Rule 1 (Head Post Office): The main accounting and administrative unit of a group of Post Offices; officer-in-charge is designated as Head Postmaster.',
              'Rule 2 (Sub-Post Office): An office subordinate to and in account with a Head Office; officer-in-charge is Sub-Postmaster (SPM).',
              'Rule 3 (Branch Post Office): An office of lower status than a Sub-Office, in direct account with a Head or Sub-Office (its Account Office); headed by Branch Postmaster (BPM).',
              'Rule 4 (General Post Office - GPO): The first-class Head Office situated at the headquarters of the Head of a Circle (or when there are more than one such HO, the one attached to the Circle HQ).',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "Which Rule of Postal Manual Vol V defines a General Post Office (GPO)?" Answer: Rule 4.',
          },
          {
            heading: 'Rules 6 to 17: Transit Office, TMO, Sorting Office, Nodal PO & RLO',
            clauseRef: 'Postal Manual Vol V, Rules 6–17',
            bullets: [
              'Rule 6 (Transit Office) & Rule 7 (TMO): Their primary purpose is to reduce the number of loose bags by enclosing forward bags into Transit Bags (TBs). They never open closed mail bags.',
              'Rule 11 (Nodal Post Office): Authorized to receive letters from neighboring POs and sort them according to sorting diagram configured by Head of Circle to reduce load on RMS.',
              'Rule 12 (Returned Letter Office - RLO): Established at the headquarters of a Postal Circle to deal with unclaimed, refused, and undecipherable/anonymous articles where sender cannot be located.',
            ],
            pyqHighlight: '[PYQ 2023 Exam Question] Asked: "Where is a Returned Letter Office (RLO) established and what articles does it handle?" Answer: Established at Circle Headquarters (Rule 12) to dispose of undeliverable/unclaimed articles whose senders cannot be traced.',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T7-1',
            topicId: 'MTS-T7',
            question: 'As per Rule 7 of Postal Manual Volume V, a branch of the RMS where ONLY closed bags are received and dispatched and no sorting of letters is done is called:',
            options: ['Sorting Mail Office', 'Transit Mail Office (TMO)', 'Returned Letter Office (RLO)', 'Sub-Record Office (SRO)'],
            correctIndex: 1,
            explanation: 'Rule 7 of Postal Manual Vol V defines a Transit Mail Office (TMO) as a branch of RMS where closed bags are received and dispatched without opening/sorting letters.',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'Postal Manual Vol V — Rule 7',
          },
          {
            id: 'TQ-MTS-T7-2',
            topicId: 'MTS-T7',
            question: 'Which office is established at the headquarters of a Postal Circle to deal with unclaimed and refused articles whose senders cannot be traced?',
            options: ['Central Bagging Unit', 'Returned Letter Office (RLO)', 'Nodal Post Office', 'Head Record Office'],
            correctIndex: 1,
            explanation: 'Rule 12 of Postal Manual Vol V defines the Returned Letter Office (RLO), situated at the Circle HQ to deal with undeliverable and anonymous/unclaimed articles.',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'Postal Manual Vol V — Rule 12',
          },
          {
            id: 'TQ-MTS-T7-3',
            topicId: 'MTS-T7',
            question: 'What is the monetary accounting office with which a Branch Post Office (B.O.) is in direct account called?',
            options: ['Record Office', 'Account Office (H.O. or S.O.)', 'Transit Office', 'Unit Bag Office'],
            correctIndex: 1,
            explanation: 'Under Rule 3 of Postal Manual Vol V, a Branch Post Office is in direct account with a Head or Sub-Post Office, which is termed its "Account Office".',
            pyqTag: '[PYQ 2021 Exam Question]',
            ruleClause: 'Postal Manual Vol V — Rule 3',
          },
        ],
      },
      {
        id: 'MTS-T8',
        title: '8. Types of Bags: Account Bag, Cash Bag, Registered Bag, Camp Bag, Due & Unusual Bags',
        ruleReference: 'Postal Manual Vol V — Rules 18 to 38',
        pyqBadge: '[PYQ 2021/2022/2023/2024 Exam Question]',
        keyPoints: [
          'Rule 21 (Registered Bag): Contains Registered List, heavy/insured registered articles, and Cash Bag (when no Account Bag is used). Always a DUE Bag.',
          'Rule 25 (Cash Bag): Contains remittances of cash and postage stamps; never sent loose (enclosed in Account Bag or Registered Bag). Unusual Bag.',
          'Rule 26 (Account Bag): Exchanged between H.O. and S.O.; always a DUE Bag.',
          'Rule 27 (Special Bag) & Rule 28 (Camp Bag): Camp Bag is used for official & private mail of high officers on tour (President, PM, Governor, CPMG); Special Bag is an Unusual Bag.',
          'Rule 29 (Due Mail/Bag) vs Rule 30 (Unusual Mail/Bag): Due Bags are dispatched regularly every day/fixed interval; Unusual Bags only when required.',
        ],
        detailedTheory: [
          {
            heading: 'Rules 21 to 28: Account Bag, Cash Bag, Special Bag & Camp Bag',
            clauseRef: 'Postal Manual Vol V, Rules 21–28',
            bullets: [
              'Account Bag (Rule 26): Dispatched from HO to SO containing the S.O. Daily Account (and Cash Bag if any); dispatched from SO to HO containing the S.O. Slip, vouchers, and Cash Bag.',
              'Camp Bag (Rule 28): Used to enclose office files and correspondence for high officers in Camp on tour; can be dispatched as Parcel Bag, Air Mail Bag, or with Passenger Train.',
              'Special Bag (Rule 27): Used to enclose correspondence of high officers (who are privileged to have Camp Bags) when they are at Headquarters, or correspondence of the Director General/CPMG.',
              'Due Bags List: Mail Bag, Registered Bag, Account Bag, and Transit Bag are DUE Bags.',
              'Unusual Bags List: Parcel Bag, Packet Bag, Cash Bag, Insured Bag, Special Bag, and Camp Bag are UNUSUAL Bags.',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "Which of the following bags is ALWAYS a Due Bag: Parcel Bag, Cash Bag, Account Bag, or Packet Bag?" Answer: Account Bag (Rule 26).',
          },
          {
            heading: 'Rules 29 to 38: Due Mails, Unusual Mails & Central Bagging Unit',
            clauseRef: 'Postal Manual Vol V, Rules 29–38',
            bullets: [
              'Rule 28-A (Central Bagging Unit / Bundling Center): Branch of RMS or PO where bundles prepared by POs/Mail Offices are grouped and enclosed into direct bags for distant offices.',
              'Air Mail Bag (Rule 26-A): Blue bag or bag with two blue stripes used for enclosing air mail articles and air mail bundles.',
              'Rule 37 (Orders of Superiors): Record Officer / Postmaster maintains Order Book and Error Book.',
            ],
            pyqHighlight: '[PYQ 2022 Exam Question] Asked: "When an Account Bag is dispatched from a Sub-Office (S.O.) to its Head Office (H.O.), what mandatory document does it contain?" Answer: S.O. Daily Account (from SO to HO) and when sent from HO to SO it contains the S.O. Slip.',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T8-1',
            topicId: 'MTS-T8',
            question: 'Which of the following is an "Unusual Bag" according to Postal Manual Volume V?',
            options: ['Mail Bag', 'Registered Bag', 'Account Bag', 'Parcel Bag & Cash Bag'],
            correctIndex: 3,
            explanation: 'Mail Bag, Registered Bag, Account Bag, and Transit Bag are Due Bags. Parcel Bag, Packet Bag, Cash Bag, Insured Bag, Special Bag, and Camp Bag are Unusual Bags.',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'Postal Manual Vol V — Rules 23, 25, 29 & 30',
          },
          {
            id: 'TQ-MTS-T8-2',
            topicId: 'MTS-T8',
            question: 'According to Rule 25 of Postal Manual Volume V, how is a "Cash Bag" transmitted between a Head Office and a Sub-Office?',
            options: ['Dispatched loose as an ordinary bag', 'Always enclosed inside an Account Bag or a Registered Bag', 'Enclosed inside a Packet Bag', 'Handed directly to the Railway Guard'],
            correctIndex: 1,
            explanation: 'Rule 25 stipulates that a Cash Bag is never dispatched loose; it must always be enclosed inside an Account Bag or a Registered Bag.',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'Postal Manual Vol V — Rule 25',
          },
          {
            id: 'TQ-MTS-T8-3',
            topicId: 'MTS-T8',
            question: 'When an Account Bag is dispatched from a Head Post Office (H.O.) to a Subordinate Sub-Post Office (S.O.), which primary accounting document does it contain?',
            options: ['S.O. Slip', 'S.O. Daily Account', 'H.O. Summary', 'B.O. Slip'],
            correctIndex: 0,
            explanation: 'Under Rule 26 of Postal Manual Vol V: When sent from H.O. to S.O., the Account Bag contains the S.O. Slip; when sent from S.O. to H.O., it contains the S.O. Daily Account.',
            pyqTag: '[PYQ 2022 Exam Question]',
            ruleClause: 'Postal Manual Vol V — Rule 26',
          },
        ],
      },
      {
        id: 'MTS-T9',
        title: '9. Face, Facing, Beat, Late Letters, Too Late Letters, Mis-sent & Trial Cards M-26(a)',
        ruleReference: 'Postal Manual Vol V — Rules 40 to 60',
        pyqBadge: '[PYQ 2021/2022/2023/2024 Exam Question]',
        keyPoints: [
          'Rule 50 (Late Letters): Posted after closing of mail but within permitted interval with full postage AND late fee affixed.',
          'Rule 51 (Too Late Letters): Posted within interval WITHOUT late fee; stamped "Detained Late Fee Not Paid" and held till next dispatch.',
          'Rule 52 (Mis-sent vs Mis-directed): Mis-sent = sent to wrong office contrary to routing; Mis-directed = wrong English destination written by office of posting on vernacular letter.',
          'Rule 53 (Face) & Rule 54 (Facing): Arranging articles with address-side upwards and addresses turned in the same direction.',
          'Rule 56 (Beat) & Rule 57 (Trial Cards — Form M-26a): Trial card determines relative advantage of alternative mail routes or cause of detention.',
        ],
        detailedTheory: [
          {
            heading: 'Rules 50 to 52: Late Letters, Too Late Letters, Mis-sent & Mis-directed Articles',
            clauseRef: 'Postal Manual Vol V, Rules 50–52',
            bullets: [
              'Late Letters (Rule 50): Letters presented at the window of a PO or Mail Office after the prescribed hour of closing mail, but within the interval allowed for posting with a Late Fee.',
              'Too Late Letters (Rule 51): Articles posted in letter boxes during the late-fee interval without having both full postage and late fee prepaid. They are impressed with "Detained Late Fee Not Paid" and detained until the next mail dispatch.',
              'Mis-sent Article (Rule 52): An article which has been erroneously forwarded by an office to an office other than the office of destination or proper route.',
              'Mis-directed Article (Rule 52): An inland article with address in a regional/vernacular language on which an incorrect destination has been transcribed in English by the office of posting.',
            ],
            pyqHighlight: '[PYQ 2023 Exam Question] Asked: "What stamp is impressed on a Too Late Letter under Rule 51 of Postal Manual Vol V?" Answer: "Detained, Late Fee Not Paid".',
          },
          {
            heading: 'Rules 53 to 60: Face, Facing, Beat & Trial Cards (Form M-26a)',
            clauseRef: 'Postal Manual Vol V, Rules 53–60',
            bullets: [
              'Rule 53 (Face): The "face" of an article is the side on which the address of the addressee is written.',
              'Rule 54 (Facing): "Facing" means arranging articles with the address-side upwards and the addresses turned in the same direction.',
              'Rule 55 (Sorting Case) & Rule 56 (Beat): "Beat" is used in relation to Postmen, Village Postmen, Overseer Postmen, and Letter Box Peons to denote the fixed locality/route assigned to each official.',
              'Rule 57 (Trial Cards — Form M-26a): Service postcards used by Inspecting Officers/Superintendents to test the relative advantage of alternative mail routes or find the cause of delay. Must NEVER be included in a Station Bundle — always placed on top of the Labelled Bundle or inside the Mail List.',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "What is the official form number of a Trial Card defined in Rule 57 of Postal Manual Vol V?" Answer: Form M-26(a).',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T9-1',
            topicId: 'MTS-T9',
            question: 'What is the official form number of a "Trial Card" used to determine the relative advantage of alternative mail routes (Rule 57, Postal Manual Vol V)?',
            options: ['Form MS-27', 'Form M-26(a)', 'Form M-42', 'Form ACG-61'],
            correctIndex: 1,
            explanation: 'Rule 57 of Postal Manual Volume V specifies Form M-26(a) as the Trial Card.',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'Postal Manual Vol V — Rule 57',
          },
          {
            id: 'TQ-MTS-T9-2',
            topicId: 'MTS-T9',
            question: 'An inland letter addressed in a regional language on which an incorrect destination has been written in English by the office of posting is defined under Rule 52 as:',
            options: ['Mis-sent Article', 'Mis-directed Article', 'Too Late Article', 'Redirected Article'],
            correctIndex: 1,
            explanation: 'Under Rule 52 of Postal Manual Vol V, when the office of posting writes an incorrect destination in English on a vernacular-addressed article, it is a "Mis-directed Article". If it is routed to the wrong bag/office despite a clear address, it is a "Mis-sent Article".',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'Postal Manual Vol V — Rule 52',
          },
          {
            id: 'TQ-MTS-T9-3',
            topicId: 'MTS-T9',
            question: 'How are "Too Late Letters" (Rule 51) treated when found in the letter box during the late-fee interval without the late fee paid?',
            options: ['Taxed with double late fee on delivery', 'Returned to sender immediately', 'Stamped "Detained, Late Fee Not Paid" and held till next dispatch', 'Forwarded by air without surcharge'],
            correctIndex: 2,
            explanation: 'As per Rule 51 of Postal Manual Vol V, Too Late Letters are stamped "Detained, Late Fee Not Paid" and detained until the next regular dispatch.',
            pyqTag: '[PYQ 2022 Exam Question]',
            ruleClause: 'Postal Manual Vol V — Rule 51',
          },
        ],
      },
    ],
  },
  {
    id: 'MOD-MTS-03',
    categoryId: 'GDS_MTS',
    paper: 'Paper-I (Part B)',
    subject: 'General Awareness, Ethics, Indian Geography, Constitution & Arithmetic (BODMAS to Time & Distance)',
    marksWeightage: '40 Marks (20 Questions × 2 Marks — 10 GK + 10 Arithmetic)',
    description:
      'Complete Paper-I Part B coverage: Indian Geography, Civics & Constitution, Freedom Struggle, Culture & Music, Ethics & Moral Study, and 8 core Arithmetic chapters (BODMAS, Percentage, Profit & Loss, Simple Interest, Average, Time & Work, Time & Distance, Unitary Method).',
    officialSyllabusBoundary: 'Department of Posts LDCE MTS & Postman Syllabus — Paper-I Part B (General Awareness & Basic Arithmetic)',
    studyNotesSummary: [
      '[PYQ 2024 Exam Question] Indian Constitution: Adopted on 26 Nov 1949, came into force on 26 Jan 1950; Part III = Fundamental Rights (Art 12–35); Part IV-A (Art 51A) = 11 Fundamental Duties (42nd & 86th Amendments).',
      '[PYQ 2023 Exam Question] Indian Geography: Longest river in India = Ganga (2,525 km); Dakshin Ganga = Godavari; Tropic of Cancer (23.5° N) passes through 8 Indian states (Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, WB, Tripura, Mizoram).',
      '[PYQ 2024 Exam Question] BODMAS Rule: Bracket () {} [] → Of → Division (÷) → Multiplication (×) → Addition (+) → Subtraction (−).',
      '[PYQ 2023 Exam Question] Profit, Loss & Discount: Profit% = (Profit / CP) × 100; Single equivalent discount for two successive discounts a% and b% = (a + b − ab/100)%.',
      '[PYQ 2022 Exam Question] Simple Interest & Speed: SI = (P × R × T)/100; Speed conversion: km/hr × (5/18) = m/sec; m/sec × (18/5) = km/hr.',
    ],
    topics: [
      {
        id: 'MTS-T10',
        title: '10. Indian Geography, Freedom Struggle, Civics, Constitution & Ethics',
        ruleReference: 'Paper-I Part B — General Awareness (10 Questions)',
        pyqBadge: '[PYQ 2021/2022/2023/2024 Exam Question]',
        keyPoints: [
          'Tropic of Cancer passes through 8 states (in Rajasthan: Banswara & Dungarpur districts).',
          'Fundamental Rights (Articles 12–35), Right to Constitutional Remedies (Art 32 — "Heart and Soul of Constitution" by Dr. B.R. Ambedkar), Fundamental Duties (Art 51A — Swaran Singh Committee, 42nd Amendment 1976).',
          'Freedom Struggle: 1857 Revolt, INC founded 1885 (A.O. Hume, W.C. Bonnerjee), Non-Cooperation (1920), Dandi March (12 Mar 1930), Quit India Movement (8 Aug 1942).',
          'Ethics & Moral Study: Integrity, Accountability, Empathy toward senior citizens/pensioners, Transparency, and Public Service Dedication.',
        ],
        detailedTheory: [
          {
            heading: 'Indian Geography & Culture High-Yield Pointers',
            clauseRef: 'Part B — Geography & Culture',
            bullets: [
              'Major National Parks: Ranthambore, Sariska & Keoladeo Ghana (Rajasthan); Kaziranga (Assam - One-horned Rhino); Gir (Gujarat - Asiatic Lion); Jim Corbett (Uttarakhand - oldest NP).',
              'Classical Dances of India: Bharatanatyam (Tamil Nadu), Kathak (North India/UP), Kathakali & Mohiniyattam (Kerala), Kuchipudi (Andhra Pradesh), Odissi (Odisha), Manipuri (Manipur), Sattriya (Assam); Folk Dance of Rajasthan: Ghoomar, Kalbelia.',
              'Longest coastline state in India: Gujarat; Southernmost point of India: Indira Point (Great Nicobar); Standard Meridian of India: 82°30′ E passing through Mirzapur (UP).',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "Which Article of the Indian Constitution deals with Fundamental Duties?" Answer: Article 51-A (Part IV-A).',
          },
          {
            heading: 'Civics, Polity & Ethics in Public Service',
            clauseRef: 'Part B — Civics & Ethics',
            bullets: [
              'Parliament consists of: The President of India, Rajya Sabha (Council of States - max 250 members, minimum age 30 yrs), and Lok Sabha (House of the People - minimum age 25 yrs).',
              'Panchayati Raj: 73rd Constitutional Amendment Act, 1992 (Part IX, 11th Schedule — 29 subjects); first inaugurated on 2 Oct 1959 at Nagaur (Rajasthan).',
              'Ethics & Moral Values: "Golden Rule" of ethical behavior, Citizen Charter adherence, non-partisanship, and zero tolerance to corruption.',
            ],
            pyqHighlight: '[PYQ 2023 Exam Question] Asked: "Where was the Three-Tier Panchayati Raj System first inaugurated in India on 2 October 1959?" Answer: Nagaur district, Rajasthan.',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T10-1',
            topicId: 'MTS-T10',
            question: 'By which Constitutional Amendment Act were the Fundamental Duties (Article 51-A) added to the Constitution of India on the recommendation of the Swaran Singh Committee?',
            options: ['42nd Amendment Act, 1976', '44th Amendment Act, 1978', '73rd Amendment Act, 1992', '86th Amendment Act, 2002'],
            correctIndex: 0,
            explanation: '10 Fundamental Duties were added in Part IV-A (Article 51-A) by the 42nd Constitutional Amendment Act, 1976 (11th duty added by 86th Amendment, 2002).',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'Paper-I Part B — Indian Constitution',
          },
          {
            id: 'TQ-MTS-T10-2',
            topicId: 'MTS-T10',
            question: 'Where was the Panchayati Raj system first inaugurated in India on 2 October 1959 by Pandit Jawaharlal Nehru?',
            options: ['Sabarmati (Gujarat)', 'Nagaur (Rajasthan)', 'Wardha (Maharashtra)', 'Hyderabad (Telangana)'],
            correctIndex: 1,
            explanation: 'Rajasthan was the first state to establish Panchayati Raj, inaugurated at Bagdari village in Nagaur district on 2 October 1959.',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'Paper-I Part B — Civics & Polity',
          },
          {
            id: 'TQ-MTS-T10-3',
            topicId: 'MTS-T10',
            question: 'Which river is known as "Dakshin Ganga" (or Vridha Ganga) and is the longest river of Peninsular India?',
            options: ['Kaveri', 'Krishna', 'Godavari', 'Narmada'],
            correctIndex: 2,
            explanation: 'The Godavari river (1,465 km), originating at Trimbakeshwar in Nashik (Maharashtra), is the largest peninsular river and is called Dakshin Ganga.',
            pyqTag: '[PYQ 2022 Exam Question]',
            ruleClause: 'Paper-I Part B — Indian Geography',
          },
        ],
      },
      {
        id: 'MTS-T11',
        title: '11. Arithmetic Part 1: BODMAS, Percentage, Profit & Loss, and Simple Interest',
        ruleReference: 'Paper-I Part B — Quantitative Aptitude (Chapters 1–4)',
        pyqBadge: '[PYQ 2021/2022/2023/2024 Exam Question]',
        keyPoints: [
          'BODMAS Hierarchy: Vinculum (Bar) → Brackets (), {}, [] → Of → Division (÷) → Multiplication (×) → Addition (+) → Subtraction (−).',
          'Percentage: x% of y = (x × y)/100; If A is R% more than B, then B is less than A by [R / (100 + R)] × 100%.',
          'Profit & Loss: SP = CP × (100 + Profit%)/100; CP = SP × 100 / (100 − Loss%); Discount% = [(MP − SP) / MP] × 100.',
          'Simple Interest: SI = (P × R × T) / 100; If a sum becomes N times in T years at SI, then Rate R = [(N − 1) × 100] / T.',
        ],
        detailedTheory: [
          {
            heading: 'BODMAS & Percentage Shortcuts',
            clauseRef: 'Part B — BODMAS & Percentage',
            bullets: [
              'Solved Example (BODMAS): Evaluate 48 ÷ 6 × 2 + 12 − (4 of 3). Step 1: (4 of 3) = 12. Step 2: 48 ÷ 6 = 8. Step 3: 8 × 2 = 16. Step 4: 16 + 12 − 12 = 16.',
              'Key Fractions: 1/4 = 25%, 1/5 = 20%, 1/8 = 12.5%, 1/6 = 16.67%, 3/8 = 37.5%.',
              'Net % Change Formula: If price increases by x% and then changes by y%, net % change = (x + y + xy/100)%.',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "Simplify: 72 − 12 ÷ 3 × 2 + (18 − 6) ÷ 4." Solution: (18−6)=12; 72 − 4 × 2 + 12 ÷ 4 = 72 − 8 + 3 = 67.',
          },
          {
            heading: 'Profit & Loss and Simple Interest Formulas',
            clauseRef: 'Part B — Profit/Loss & SI',
            bullets: [
              'When two articles are sold at the SAME Selling Price, one at x% gain and the other at x% loss, there is ALWAYS an overall loss of (x² / 100)%.',
              'Simple Interest (SI): Principal P = (100 × SI) / (R × T). If SI on a sum for 4 years at 7.5% p.a. is ₹1,200, then P = (100 × 1200) / (7.5 × 4) = 120000 / 30 = ₹4,000.',
            ],
            pyqHighlight: '[PYQ 2023 Exam Question] Asked: "At what rate of Simple Interest per annum will a sum of money double itself in 8 years?" Solution: R = (2 − 1) × 100 / 8 = 12.5% p.a.',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T11-1',
            topicId: 'MTS-T11',
            question: 'Evaluate using BODMAS rule: 72 − 12 ÷ 3 × 2 + (18 − 6) ÷ 4',
            options: ['61', '67', '55', '70'],
            correctIndex: 1,
            explanation: 'Bracket first: (18 − 6) = 12. Expression becomes 72 − 12 ÷ 3 × 2 + 12 ÷ 4. Division next: 12 ÷ 3 = 4 and 12 ÷ 4 = 3. Multiplication next: 4 × 2 = 8. Now 72 − 8 + 3 = 67.',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'Paper-I Part B — BODMAS',
          },
          {
            id: 'TQ-MTS-T11-2',
            topicId: 'MTS-T11',
            question: 'An article is bought for ₹800 and sold for ₹960. What is the profit percentage?',
            options: ['15%', '20%', '25%', '16.67%'],
            correctIndex: 1,
            explanation: 'Profit = SP − CP = 960 − 800 = ₹160. Profit % = (160 / 800) × 100 = 20%.',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'Paper-I Part B — Profit & Loss',
          },
          {
            id: 'TQ-MTS-T11-3',
            topicId: 'MTS-T11',
            question: 'What will be the Simple Interest on a deposit of ₹15,000 at 8% per annum for 3 years?',
            options: ['₹3,200', '₹3,600', '₹4,000', '₹3,000'],
            correctIndex: 1,
            explanation: 'SI = (P × R × T) / 100 = (15000 × 8 × 3) / 100 = ₹3,600.',
            pyqTag: '[PYQ 2022 Exam Question]',
            ruleClause: 'Paper-I Part B — Simple Interest',
          },
        ],
      },
      {
        id: 'MTS-T12',
        title: '12. Arithmetic Part 2: Average, Time & Work, Time & Distance, and Unitary Method',
        ruleReference: 'Paper-I Part B — Quantitative Aptitude (Chapters 5–8)',
        pyqBadge: '[PYQ 2021/2022/2023/2024 Exam Question]',
        keyPoints: [
          'Average = (Sum of all observations) / (Total number of observations); Average of first n natural numbers = (n + 1)/2.',
          'Time & Work: If A does a work in x days and B in y days, together they finish it in (x × y) / (x + y) days.',
          'Chain Rule / Unitary Method: (M1 × D1 × H1) / W1 = (M2 × D2 × H2) / W2.',
          'Time & Distance: Distance = Speed × Time; Average speed for equal distances at speeds u and v = (2uv) / (u + v).',
        ],
        detailedTheory: [
          {
            heading: 'Average & Unitary Method Exam Formulas',
            clauseRef: 'Part B — Average & Unitary Method',
            bullets: [
              'Average of first n even numbers = (n + 1); Average of first n odd numbers = n.',
              'Replacement Formula: New member weight = Replaced member weight + (Number of members × Increase in average).',
              'Unitary Method: If 12 Sorters can sort 2,400 letters in 4 hours, then 1 Sorter in 1 hour sorts 2400 / (12 × 4) = 50 letters.',
            ],
            pyqHighlight: '[PYQ 2024 Exam Question] Asked: "The average of 5 consecutive numbers is 24. What is the largest of these numbers?" Answer: Middle (3rd) number is 24, so numbers are 22, 23, 24, 25, 26; largest is 26.',
          },
          {
            heading: 'Time & Work and Time & Distance Shortcuts',
            clauseRef: 'Part B — Time & Work / Distance',
            bullets: [
              'If A can complete a beat survey in 10 days and B in 15 days, together they take (10 × 15) / (10 + 15) = 150 / 25 = 6 days.',
              'Train passing a pole/man: Distance = Length of train. Train passing a platform/bridge: Distance = Length of train + Length of platform.',
              'Conversion: 36 km/hr = 36 × (5/18) = 10 m/sec; 54 km/hr = 15 m/sec; 72 km/hr = 20 m/sec.',
            ],
            pyqHighlight: '[PYQ 2023 Exam Question] Asked: "A mail van travels at 54 km/hr. How many meters will it cover in 20 seconds?" Solution: Speed = 54 × (5/18) = 15 m/sec. Distance = 15 × 20 = 300 meters.',
          },
        ],
        topicQuiz: [
          {
            id: 'TQ-MTS-T12-1',
            topicId: 'MTS-T12',
            question: 'A can sort a bag of mail in 12 minutes and B can sort the same bag in 24 minutes. If both work together, how many minutes will they take to sort the bag?',
            options: ['6 Minutes', '8 Minutes', '9 Minutes', '10 Minutes'],
            correctIndex: 1,
            explanation: 'Combined time = (x × y) / (x + y) = (12 × 24) / (12 + 24) = 288 / 36 = 8 Minutes.',
            pyqTag: '[PYQ 2024 Exam Question]',
            ruleClause: 'Paper-I Part B — Time & Work',
          },
          {
            id: 'TQ-MTS-T12-2',
            topicId: 'MTS-T12',
            question: 'The average of 6 numbers is 30. If one number is excluded, the average becomes 28. What is the excluded number?',
            options: ['38', '40', '42', '36'],
            correctIndex: 1,
            explanation: 'Sum of 6 numbers = 6 × 30 = 180. Sum of remaining 5 numbers = 5 × 28 = 140. Excluded number = 180 − 140 = 40.',
            pyqTag: '[PYQ 2023 Exam Question]',
            ruleClause: 'Paper-I Part B — Average',
          },
          {
            id: 'TQ-MTS-T12-3',
            topicId: 'MTS-T12',
            question: 'A Mail Express train 150 meters long is running at a speed of 54 km/hr. In how many seconds will it cross a telegraph post?',
            options: ['8 Seconds', '10 Seconds', '12 Seconds', '15 Seconds'],
            correctIndex: 1,
            explanation: 'Speed in m/sec = 54 × (5/18) = 15 m/sec. Time to cross a post = Length of train / Speed = 150 / 15 = 10 Seconds.',
            pyqTag: '[PYQ 2022 Exam Question]',
            ruleClause: 'Paper-I Part B — Time & Distance',
          },
        ],
      },
    ],
  },
];
