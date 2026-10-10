import { Customer } from '../types/models';

export const RAW_MASTER_CSV_DATA = `Master ID,Name,Mobile,WhatsApp,Area,Sector,House No.,Address,Pincode,Beat No,Office ID,Property ID,Household ID,Occupation,Existing Banking,Financial Interest,Lead Score,Follow-up Status,Remarks,Verification Status,Last Visit,Next Follow-up,Source
UM-00001,Rajendra Dabhai,9351460069.0,9351460069.0,,,,,,,,,HH-GD-RAJENDRA,,,,,,"Govind Dham, Kishorpura, 324009",Field Confirmed,,,Project conversation
UM-00002,Rohit Yadav,917878615426.0,917878615426.0,Patel Nagar,,817,"817, Patel Nagar",324009.0,2.0,DADABARI_SO,PATEL-NAGAR-817,HH-PATEL-NAGAR-817,,,,,,Old address chhod chuke hain. New address not available.,Field Confirmed,2026-08-24,,User update
UM-00003,Princy Sharma,8094373464.0,8094373464.0,Keshavpura,6,KH 3,"KH 3, Keshavpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-KH003,HH-KP-S6-KH003,,,,,,Status: Field Confirmed / Initial Entry. Other person: Sanjay Sharma.,Field Confirmed,2026-08-24,,User update
UM-00004,Shanti Nagar,9929824778.0,9929824778.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00005,Harish Kumar Banjara,9782176029.0,9782176029.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00006,Hemant Yadav,9649734725.0,9649734725.0,Keshavpura,6,KH 222,"KH 222, Keshavpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-KH222,HH-KP-S6-KH222,,,,,,Existing Hemant Yadav contact linked to KH 222; no new duplicate customer created.,Field Confirmed,,,Project conversation
UM-00007,Suraj Gunsaria,8503811624.0,8503811624.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00008,Kuldeep Mahawar,8529727985.0,8529727985.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00009,Piyush Gaur,9509301110.0,9509301110.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00010,Dheeraj Jain,8740051555.0,8740051555.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00011,Rudra Mani Pandey,895204117.0,895204117.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00012,Kamlesh Sen,8107051455.0,8107051455.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00013,Kamlesh Sen / household,8529209762.0,8529209762.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00014,Latoor Lal Verma,9462840348.0,9462840348.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00015,Sanu Prajapati,9799858764.0,9799858764.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00016,Aryan / Aditya Harijan household,9660069595.0,9660069595.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00017,Mahaveer Verma,9001836079.0,9001836079.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00018,Prithviraj Jangid,8824283193.0,8824283193.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00019,Bisan Lal,8696646679.0,8696646679.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00020,Aman Singh,8000621937.0,8000621937.0,,,,,,,,,,,,,,,Beat 2 unless otherwise noted.,Field Confirmed,,,User consolidated register
UM-00445,Sohan Lal Nama,8104674458.0,8104674458.0,,,,,,,,,HH-KP-S7-705-SOHAN-NAMA,,,,,,H. No. 705 Keshavpura Sector 7. Gayti books bundle received.,Field Confirmed,,,User field input
UM-00516,Mahaveer Prasad Arya,9680412247.0,9680412247.0,Keshpura,,563,563 Sector 7 Keshpura,,,,,,,,,,,Address Status: Unknown | Updated 2026-08-20: Existing mobile match found; update existing record,Field Confirmed,,,Project conversation
UM-00576,Lodha Ji 605 Sec 7 Sec KDA,9460176474.0,9460176474.0,Keshavpura,7,,"P0605, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0605,HH-KP-S7-P0605,,,,,,,Field Confirmed,,,User field input
UM-00651,Pooja Meena,7878604830.0,7878604830.0,,,,,,,,,HH-KP-S7-H256-POOJA,,,,,,"Merged with Pooja Meea Atru Kota (7976402657). Confirmed address: 256, Keshavpura Sector 7, near Santoshi Nagar Circle.",Field Confirmed,,,contacts.vcf
UM-01448,Badal Soni Tea Stall,8005692402.0,8005692402.0,Keshavpura,4,323 A,"323 A, Rajput, Keshpura Sector 4, landmark Ashok Soni",324009.0,6.0,DADABARI_SO,KP-S4-H0323A,,,,,,,Updated from project chat; Beat 6; landmark Ashok Soni,Field Confirmed,,,Project conversation
UM-01730,Rajendra Solanki,9462725512.0,9462725512.0,Keshpura,Sector 7,2F-20,Teacher Colony,6.0,6.0,DADABARI_SO,KP-S7-H881-RAJENDRA,HH-KP-S7-H881-RAJENDRA,,,,,,"Address Left; New Address: House No. 2F-20, Teacher Colony",Imported - Unverified,,,User chat final correction 2026-08-19
UM-01747,Bhavna Prajapati,8504990002.0,8504990002.0,,,,,,,,,HH-SANTOSHI-B-H654,,,,,,Same 654-B household. Separate mobile number not supplied; household contact 8504990002 retained.,Field Confirmed,,,User field input
UM-02312,Kanishk Vairagi,919460237051.0,919460237051.0,,,,,,,,,HH-KP-S7-P3,,,,,,"Old Plot 3, Keshavpura Sector 7. New address supplied by user.",Field Confirmed,,,User field input
UM-02327,Rajendra Merota,8209227500.0,8209227500.0,Santoshi Nagar,,648 B,"648 B Santoshi Nagar, corner house, before Lokesh e-Mitra",,,,,,,,,,,Existing verified Rajendra Merota record; 20-Aug-2026 address confirmed. Pulkit Maratha reported as household member sharing this mobile.,Field Confirmed,,,Project conversation
UM-02364,Sunil Kumar Nagar,9929873554.0,9929873554.0,,,,,,,,,HH-SANTOSHI-B-H538B,,,,,,S/o Amar Lal Nagar; 538-B Santoshi Nagar B Block; near Hanuman Mandir.,Field Confirmed,,,User field input
UM-02475,Gourav Nama,9660153601.0,9660153601.0,,,,,,,,,HH-KP-S6-H305,,,,,,"Property 305, Keshavpura Sector 6; Address Left",Field Confirmed,,,User field input
UM-02672,Kuldeep Meena,9887079568.0,9887079568.0,,,,,,,,,HH-KULDEEP-MEENA,,,,,,PLI interested; daily follow-up required.,Field Confirmed,,,User field input
UM-02783,Manan Singh,8390976032.0,8390976032.0,,,,,,,,,HH-KP-S6-KH179,,,,,,"Property KH 179, Keshavpura Sector 6; Unknown",Field Confirmed,,,User field input
UM-02784,Bhuvanesh Jaiswal,9166203500.0,9166203500.0,,,,,,,,,HH-KP-S6-H235,,,,,,"Property 235, Keshavpura Sector 6; Unknown",Field Confirmed,,,User field input
UM-02785,Kamlesh Jain,9950448999.0,9950448999.0,,,,,,,,,HH-KP-S7-UIT106,,,,,,,Field Confirmed,,,User field input
UM-02786,Bhanu Jain,8442095782.0,8442095782.0,,,,,,,,,HH-KP-S7-H308,,,,,,,Field Confirmed,,,User field input
UM-02787,Surendra Kumar,9352515020.0,9352515020.0,,,,,,,,,HH-KP-S7-H426,,,,,,,Field Confirmed,,,User field input
UM-02789,Sanjay Kumar Sharma,9829203917.0,9829203917.0,,,,,,,,,HH-KP-S6-H178B,,,,,,"178-B Kumhar Mohalla, Keshavpura Sector 6; Beat 2.",Field Confirmed,,,User field input
UM-02790,Aryan Mehta,9672036419.0,9672036419.0,,,,,,,,,HH-KP-S7-UIT100,,,,,,S/o Suresh Mehta; contact 9672036419.,Field Confirmed,,,User field input
UM-02791,Sonali Pareta,7976273079.0,7976273079.0,,,,,,,,,HH-KP-S7-H112,,,,,,W/o Rahul Pareta; moved from 112 Sector 7.,Field Confirmed,,,User field input
UM-02792,Mohit Sarda,9928463599.0,9928463599.0,,,,,,,,,HH-KP-S7-UIT167-168,,,,,,"UIT 167-168, Keshavpura Sector 7; near Vasundra Park; works at LBS.",Field Confirmed,,,User field input
UM-02793,Kunal Sharma,9829982728.0,9829982728.0,,,,,,,,,HH-KP-S7-UIT234,,,,,,"UIT 234, Sector 7; Near Vasundra Park. RS-CIT Centre",Field Confirmed,,,User field input
UM-02794,Beena Parihar,7976041318.0,7976041318.0,,,,,,,,,HH-KP-S7-UIT237,,,,,,"UIT 237, Sector 7; Near Vasundra Park",Field Confirmed,,,User field input
UM-02798,Devendra Kumar Gautam,9929779369.0,9929779369.0,,,,,,,,,HH-KP-S7-H484,,,,,,"484, Keshavpura Sector 7; Beat 2.",Field Confirmed,,,User field input
UM-02799,Shubham Gocher,8003922602.0,8003922602.0,,,,,,,,,HH-KP-S7-H503,,,,,,"503, Keshavpura Sector 7; Beat 2.",Field Confirmed,,,User field input
UM-02800,Kela Bai,8005787233.0,8005787233.0,,,,,,,,,HH-SANTOSHI-H470B,,,,,,Kela Bai — old address 470-B Santoshi Nagar; new address reported as Naya Gaon.,Field Confirmed,,,User field input
UM-02801,Shard Sharma / Ashok Sharma,9610774670.0,9610774670.0,,,,,,,,,HH-SANTOSHI-B-H521,,,,,,"521-B Santoshi Nagar, near Hanuman Mandir. House No: UIT 2 A, Sector 7 Keshavpura, front of UIT 110, Advocate Dheeraj Jain Ji ke Samne.",Field Confirmed,,,User update 2026-08-24
UM-02802,Ashok Sharma,9653774670.0,9653774670.0,,,,,,,,,HH-SANTOSHI-B-H521,,,,,,"521 Santoshi Nagar, Hanuman Ji Ka Mandir. House No: UIT 2 A, Sector 7 Keshavpura, front of UIT 110, Advocate Dheeraj Jain Ji ke Samne.",Document Confirmed,,,User update 2026-08-24
UM-02803,Mayank Nagar,9829206585.0,9829206585.0,,,,,,,,,HH-KP-S6-KH60,,,,,,"KH 60, Keshavpura Sector 6; Beat 2.",Field Confirmed,,,User field input
UM-02804,Gaurav Kumar Haldar,7891269235.0,7891269235.0,,,,,,,,,HH-KP-S6-KH117,,,,,,"KH 117, Keshavpura Sector 6; Beat 2.",Field Confirmed,,,User field input
UM-02805,Anjana Kanwar,8279253305.0,8279253305.0,,,,,,,,,HH-KP-S6-KH178,,,,,,"KH 178, Keshavpura Sector 6; Beat 2.",Field Confirmed,,,User field input
UM-02809,Reena Kumawat,9352660665.0,9352660665.0,,,,,,,,,HH-KP-S7-H702,,,,,,Contact 9352660665; earlier Anjali entry at same property preserved pending relationship verification.,Field Confirmed,,,User field input
UM-02810,Renu Sharma,7023513792.0,7023513792.0,,,,,,,,,HH-KP-S7-H738,,,,,,"738, Keshavpura Sector 7. Associated: Shiv Prakash Sharma",Field Confirmed,,,User field input
UM-02811,Rajesh Ji Nandana,9414558114.0,9414558114.0,,,,,,,,,HH-KP-S7-H790,,,,,,"790, Keshavpura Sector 7.",Field Confirmed,,,User field input
UM-02812,Pratibha Shtoriya,9982829001.0,9982829001.0,,,,,,,,,HH-KP-S7-H818C,,,,,,"818-C, Keshavpura Sector 7.",Field Confirmed,,,User field input
UM-02814,Om Prakash Sen,8233727783.0,8233727783.0,,,,,,,,,HH-SANTOSHI-H78A,,,,,,78-A Santoshi Nagar; Beat 2.,Field Confirmed,,,User field input
UM-02822,Arshad Khan / Mohamad Zahid,9351475053.0,9351475053.0,,,,,,,,,HH-KP-S6-H162,,,,,,Multiple names at same property,Field Confirmed,,,User field input
UM-02828,Shiv Prasad Sen,9784485264.0,9784485264.0,,,,,,,,,HH-SANTOSHI-B-H631,,,,,,"631-B, Santoshi Nagar",Field Confirmed,,,User field input
UM-02832,Radhika Prajapati / Vishnu Kumar Prajapati,9928762238.0,9928762238.0,,,,,,,,,HH-SANTOSHI-A-H129A,,,,,,User supplied two names; exact relationship not specified. Landmark: Near Akashya Kirana.,Field Confirmed,,,User field input
UM-02836,Sangeeta Mahawar,9509686922.0,9509686922.0,,,,,,,,,HH-KP-S6-H114,,,,,,"H. No. 114, Keshavpura Sector 6; mobile confirmed.",Field Confirmed,,,User field input
UM-02837,Harshit Rathore,9928757314.0,9928757314.0,,,,,,,,,HH-KP-S6-H40,,,,,,"S/o Jagdish Rathore; H. No. 40, Keshavpura Sector 6. Mobile updated.",Field Confirmed,,,User field input
UM-02840,Pushpa Bai,9829213625.0,9829213625.0,,,,,,,,,HH-SANTOSHI-B-H417,,,,,,H. No. 417 Santoshi Nagar B Block; near Mahima Welding.,Field Confirmed,,,User field input
UM-02842,Sunil Kumar,9799037520.0,9799037520.0,,,,,,,,,HH-SANTOSHI-H590,,,,,,"H. No. 590, Santoshi Nagar.",Field Confirmed,,,User field input
UM-02843,Akshay Pandey,9829647899.0,9829647899.0,,,,,,,,,HH-KP-S7-PLOT108,,,,,,"Plot 108, Keshavpura Sector 7.",Field Confirmed,,,User field input
UM-02844,Kusum Mehra,9785615137.0,9785615137.0,,,,,,,,,HH-SANTOSHI-A-H162,,,,,,"162-A, Santoshi Nagar. S/o Manoj",Field Confirmed,,,User field input
UM-02845,Sunita Yadav,9509650837.0,9509650837.0,,,,,,,,,HH-SANTOSHI-H652,,,,,,"652, Santoshi Nagar. Landmark: Mahima Welding",Field Confirmed,,,User field input
UM-02846,Santosh Mehta,8104826001.0,8104826001.0,,,,,,,,,HH-SANTOSHI-B-H603,,,,,,"603-B, Santoshi Nagar. Landmark: Pratap School ki line",Field Confirmed,,,User field input
UM-02847,Seema,6377740207.0,6377740207.0,,,,,,,,,HH-SANTOSHI-A-H326,,,,,,"326-A, Santoshi Nagar.",Field Confirmed,,,User field input
UM-02848,Pinki Yadav / Mahendra Yadav,7339932876.0,7339932876.0,,,,,,,,,HH-SANTOSHI-A-H181,,,,,,"181-A, Santoshi Nagar. Two names supplied for same property; relationship not specified",Field Confirmed,,,User field input
UM-02849,Gita Bai,7891203757.0,7891203757.0,,,,,,,,,HH-SANTOSHI-H284,,,,,,"284, Santoshi Nagar.",Field Confirmed,,,User field input
UM-02850,Deepak Rathore,9079370875.0,9079370875.0,,,,,,,,,HH-SANTOSHI-H331,,,,,,H. No. 331 Santoshi Nagar. Child contact through parent/guardian.,Field Confirmed,,,User field input
UM-02852,Pooja Narwal,6377359390.0,6377359390.0,,,,,,,,,HH-SANTOSHI-POOJA-6377259390,,,,,,"Husband: Dileep Narwal. Address: first gali from TVS Circle, near Keshav Milk Parlour wali gali, Santoshi Nagar.",Field Confirmed,,,User field input
UM-02853,Ren Suwalka,9887949965.0,9887949965.0,,,,,,,,,HH-KP-S6-H266,,,,,,Contact 9887949965.,Field Confirmed,,,User field input
UM-02856,Archna Akodia,8302191578.0,8302191578.0,,,,,,,,,HH-KP-S7-H324,,,,,,Contact 8302191578.,Field Confirmed,,,User field input
UM-02858,Ashish Arora,9772305777.0,9772305777.0,,,,,,,,,HH-KP-S7-H647,,,,,,Contact 9772305777.,Field Confirmed,,,User field input
UM-02860,Gajendra Meena,9760840595.0,9760840595.0,Keshavpura,7,,"P0825, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0825,HH-KP-S7-P0825,,,,,,,Field Confirmed,,,User field input
UM-02861,Shubham Soni,9509173996.0,9509173996.0,,,,,,,,,HH-KP-S7-H912,,,,,,,Field Confirmed,,,User field input
UM-02862,Premanand Bhatia,9001681700.0,9001681700.0,,,,,,,,,HH-KP-S7-H987-988,,,,,,,Field Confirmed,,,User field input
UM-02863,Dinesh Rawal,8058037805.0,8058037805.0,,,,,,,,,HH-SANTOSHI-H3A-DINESH,,,,,,,Field Confirmed,,,User field input
UM-02864,Mukesh Mahawar,9024839639.0,9024839639.0,,,,,,,,,HH-SANTOSHI-H31A-MUKESH,,,,,,,Field Confirmed,,,User field input
UM-02865,Laxmi Kumari,8955389405.0,8955389405.0,,,,,,,,,HH-SANTOSHI-H160-LAXMI,,,,,,,Field Confirmed,,,User field input
UM-02866,Gurumaanshu Suman,6376833150.0,6376833150.0,Santoshi Nagar,,279-A,"279-A, Santoshi Nagar, near Purwani Medical se pehle wali gali",324009.0,2.0,DADABARI_SO,SANTOSHI-H279A-GURUMAANSHU,HH-SANTOSHI-H279A-GURUMAANSHU,,,Father: Late Akash Suman; near Purwani Medical. Conflict: existing mobile 6376833150 preserved; user supplied 8561991673 on 2026-08-21.,,,Household member | Updated 2026-08-21.,Field Confirmed,,,User field input
UM-02867,Manish Pareta,8107913677.0,8107913677.0,,,,,,,,,HH-SANTOSHI-H315-MANISH,,,,,,S/o Ramesh Chandra Pareta,Field Confirmed,,,User field input
UM-02868,Devki Nandan Vijay,7014237558.0,7014237558.0,,,,,,,,,HH-SANTOSHI-H350E-DEVKI,,,,,,Near Mamta Kirana se pehle wali gali,Field Confirmed,,,User field input
UM-02872,Meena Yadav,8209776091.0,8209776091.0,,,,,,,,,HH-SANTOSHI-H524B-MEENA,,,,,,,Field Confirmed,,,User field input
UM-02873,Neha Yadav,9799920815.0,9799920815.0,,,,,,,,,HH-SANTOSHI-H605B-NEHA,,,,,,Landmark: Near Mahima Welding.,Field Confirmed,,,User field input
UM-02875,Asha Prajapati,8290144765.0,8290144765.0,,,,,,,,,HH-SANTOSHI-H675-ASHA,,,,,,Wife of Bajrang Lal Prajapati; H. No. 675 Santoshi Nagar.,Field Confirmed,,,User field input
UM-02876,Suraj Harijan,7742239527.0,7742239527.0,,,,,,,,,HH-SANTOSHI-H104A-SURAJ,,,,,,"S/o Mukesh Harijan; 104-A Santoshi Nagar, near TVS Circle.",Field Confirmed,,,User field input
UM-02877,Golu Meghwal,7742251336.0,7742251336.0,,,,,,,,,HH-RAJNAGAR-GOLU-MEGHWAL,,,,,,Raj Nagar. Parent of two daughters. Sukanya + Aadhaar follow-up for both daughters.,Field Confirmed,,,User field input
UM-02878,Chetan Porwal,9799344952.0,9799344952.0,,,,,,,,,,,,,,,"BPM, Mandaliya BO under Mandana S.O., Kota Division; CELC Operator.",Field Confirmed,,,User field input
UM-02879,Nand Bihari Prajapati,9929304352.0,9929304352.0,,,,,,,,,HH-NAND-BIHARI-PRAJAPATI,,,,,,Reference by Parmanand Ji. Interest: I and RD. Urgent daily follow-up.,Field Confirmed,,,User field input
UM-02880,Surendra Jangid,9887541336.0,9887541336.0,,,,,,,,,HH-KP-221-SURENDRA-JANGID,,,,,,H. No. 221 Keshavpura. S/o Babu Lal Ji. Sector not defined.,Field Confirmed,,,User field input
UM-02881,Kiran Parwani,9782175978.0,9782175978.0,,,,,,,,,HH-KP-S7-UIT175-KIRAN,,,,,,"UIT 175, Keshavpura Sector 7, near Vasundra Park. Chandra Prakash Parwani recorded as related person.",Field Confirmed,,,User field input
UM-02882,Chandra Deep Singh Asoliya,7737336701.0,7737336701.0,,,,,,,,,HH-KP-S7-H244-CHANDRA-DEEP,,,,,,H. No. 244 Keshavpura Sector 7.,Field Confirmed,,,User field input
UM-02883,Reena Kumari Bhumliya,8005620206.0,8005620206.0,,,,,,,,,HH-SANTOSHI-573B-REENA-BHUMLIYA,,,,,,573-B Santoshi Nagar; gali behind Hanuman Mandir.,Field Confirmed,,,User field input
UM-02884,Hemaraj,9928915499.0,9928915499.0,,,,,,,,,HH-SANTOSHI-404-HEMARAJ,,,,,,H. No. 404 Santoshi Nagar. S/o Mathura Lal.,Field Confirmed,,,User field input
UM-02885,Manoj Prajapati,850499002.0,850499002.0,,,,,,,,,HH-SANTOSHI-654B-MANOJ-BHAVNA,,,,,,654-B Santoshi Nagar. Address left; new address pending.,Field Confirmed,,,User field input
UM-02886,Bhavna Prajapati,9772966757.0,9772966757.0,,,,,,,,,HH-SANTOSHI-654B-MANOJ-BHAVNA,,,,,,654-B Santoshi Nagar. Address left; new address pending.,Field Confirmed,,,User field input
UM-02887,Naveen Khandelwal,9950936413.0,9950936413.0,,,,,,,,,HH-KP-S7-299-HARSHA-NAVEEN,,,,,,"Contact person for Harsha Khandelwal, proprietor. H. No. 299 Sector 7 Keshavpura. Dak address incomplete.",Field Confirmed,,,User field input
UM-02889,Mukesh Prajapati,6377216907.0,6377216907.0,,,,,,,,,HH-KP-S7-UIT86-MUKESH-PRAJAPATI,,,,,,"UIT 86 Sector 7 Keshavpura, front of Babu Lal Ji Rathore, near Akada.",Field Confirmed,,,User field input
UM-02890,Dharmendra Kumar Nirvikar,9414187799.0,9414187799.0,,,,,,,,,HH-KP-S7-448-DHARMENDRA-NIRVIKAR,,,,,,Dharmendra Kumar Nirvikar. Contact 9414187799.,Field Confirmed,,,User field input
UM-02892,Nirmal Nagar,9649757428.0,9649757428.0,,,,,,,,,HH-KP-S6-219-NIRMAL-NAGAR,,,,,,Near Dimple Collection,Field Confirmed,,,User field input
UM-02893,Mahaveer Jhadia,7976052126.0,7976052126.0,,,,,,,,,HH-KP-S6-407-MAHAVEER-JHADIA,,,,,,"Near Muktidham, Santoshi Nagar Road",Field Confirmed,,,User field input
UM-02894,Manish Gaur,9828378200.0,9828378200.0,,,,,,,,,HH-KP-S6-417-MANISH-GAUR,,,,,,"Corner house, Santoshi Nagar Road; last H. No. in Sector 6",Field Confirmed,,,User field input
UM-02895,Dinesh Bairwa,9782650743.0,9782650743.0,,,,,,,,,HH-KP-S6-4-5-DINESH-BAIRWA,,,,,,,Field Confirmed,,,User field input
UM-02896,Kusum Mahawar,8504803113.0,8504803113.0,,,,,,,,,HH-KP-S6-254-KUSUM-MAHAWAR,,,,,,,Field Confirmed,,,User field input
UM-02898,Gunjan Inani,9929777571.0,9929777571.0,,,,,,,,,HH-KP-S6-358-GUNJAN-INANI,,,,,,H. No. 358 Keshavpura Sector 6.,Field Confirmed,,,User field input
UM-02901,Shilpa Saini,9799032425.0,9799032425.0,,,,,,,,,HH-KP-S6-KH160-SHILPA-SAINI,,,,,,"H. No. KH 160, Keshavpura Sector 6; near Shitla Mata Mandir.",Field Confirmed,,,User field input
UM-02903,Seema Sharma,9829750121.0,9829750121.0,,,,,,,,,HH-KP-S6-KH22-SEEMA-SHARMA,,,,,,,Field Confirmed,,,User field input
UM-02904,Akash Soni,9351789864.0,9351789864.0,,,,,,,,,HH-KP-S6-KH231-AKASH-SONI,,,,,,,Field Confirmed,,,User field input
UM-02905,Mahaveer Prasad Rathore,9887885100.0,9887885100.0,,,,,,,,,HH-KP-S6-KH18-MAHAAVEER-RATHORE,,,,,,Near/landmark not supplied,Field Confirmed,,,User field input
UM-02907,Kunal Thani,8955019361.0,8955019361.0,,,,,,,,,HH-PATEL-NAGAR-756-KUNAL-THANI,,,,,,Shifted to Mumbai for job; old address 756 Patel Nagar; Sector D block corner reference.,Field Confirmed,,,User field input
UM-02908,Karina,7742047700.0,7742047700.0,,,,,,,,,HH-SANTOSHI-623B-KARINA,,,,,,H. No. 623-B Santoshi Nagar; near Raghuveer Mehra.,Field Confirmed,,,User field input
UM-02910,Kirti Duliya,9216591944.0,9216591944.0,,,,,,,,,HH-SANTOSHI-555-KIRTI-DULIYA,,,,,,B Block,Field Confirmed,,,User field input
UM-02911,Balram,9079727750.0,9079727750.0,,,,,,,,,HH-SANTOSHI-639-BALRAM-YADAV,,,,,,S/o Lakshmi Narayan,Field Confirmed,,,User field input
UM-02913,Arvind Kumar,8005687653.0,8005687653.0,,,,,,,,,HH-SANTOSHI-473B-ARVIND-KUMAR,,,,,,S/o Laxman Singh; B Block; front of Hanuman Mandir gali; Advocate ji ka makan,Field Confirmed,,,User field input
UM-02914,Abhishek Prajapati,9351540361.0,9351540361.0,,,,,,,,,HH-SANTOSHI-410B-ABHISHEK-PRAJAPATI,,,,,,"S/o Ramesh Chandra Prajapati. Old landmark: Kamal Ice Cream wali line. Address left. New address: Dhanraj Chesi ke paas, Devnarayan Mandir ki dukan ke paas, Dabukda, Devnarayan Mandir. Contact 9351540361.",Field Confirmed,,,User field input
UM-02915,Rajkumar Mahawar,8824655925.0,8824655925.0,,,,,,,,,HH-SANTOSHI-13-RAJKUMAR-MAHAWAR,,,,,,"Son of Babu Lal Ji. Ward 14, Santoshi Nagar.",Field Confirmed,,,User field input
UM-02917,Rajendra Kumar Regar,9784550758.0,9784550758.0,,,,,,,,,HH-SANTOSHI-158B-RAJENDRA-REGAR,,,,,,Son of Bhanwar Lal Regar. Near Pani ki Tani. Near Sharma Tyres.,Field Confirmed,,,User field input
UM-02923,Paras Bairwa,7976390380.0,7976390380.0,Keshavpura,4,167,Ram Janki Mandir ke paas,324009.0,2.0,DADABARI_SO,KP-S4-167-PARAS-BAIRWA,HH-KP-S4-167-PARAS-BAIRWA,,,Banking benefits,,,"H. No. 167, Sector 4. Contact 7976390380. PM Vishwakarma toolkit/kit received; banking benefits opportunity to be followed up.",Field Confirmed,2026-08-17 00:00:00,,User field input
UM-03187,Bhanu Pratap Singh,8696761843.0,,Keshpura,Sector 7,303,"Keshpura, Sector 7",,,,,,,,,,,,,,,User chat 2026-08-19
UM-03190,Raghvendra Shringi,9460045044.0,,Keshpura,Sector 7,Plot No. 29,"Keshpura, Sector 7",,,,,,,,,,,,,,,User chat 2026-08-19
UM-03191,Neha Sharda,9166075778.0,,Keshavpura,Sector 7,UIT 167-168,"Near Vasundhra Park, Keshavpura, Sector 7",,,,,,,,,,,,,,,User chat 2026-08-19
UM-03193,Rahul Sahu,8005894597.0,,Keshavpura,Sector 7,384,"Keshavpura, Sector 7",,,,,,,,,,,,,,,User chat 2026-08-19
UM-03195,Purushottam Kumar Mittal,8209591278.0,,Keshpura,Sector 7,578,"Keshpura, Sector 7",,,,,,,,,,,,,,,User chat 2026-08-19
UM-03200,Kanhaiya Lal Ji Meghwal,8290854147.0,,Santoshi Nagar,,H. No 253 A,"H. No 253 A Santoshi Nagar, Pahla Chauk, Jyoti Dry Cleaner Wala; left-side block",,,,,,,,,,,,,,,User chat 2026-08-19
UM-03201,Bhagwan Swaroop Meghwal,9928718810.0,,Santoshi Nagar,,H. No 253 A,"H. No 253 A Santoshi Nagar, Pahla Chauk, Jyoti Dry Cleaner Wala; left-side block",,,,,,,,,,,,,,,User chat 2026-08-19
UM-03205,Narendra Kumar Nagar,9929198347.0,9929198347.0,Santoshi Nagar,,571-B,,324009.0,2.0,DADABARI_SO,SANTOSHI-H571B-NARENDRA-KUMAR-NAGAR,HH-SANTOSHI-H571B-NARENDRA-KUMAR-NAGAR,,,,,,"571-B, Santoshi Nagar, Kota - 324009. DOB 24/07/1972. DOB: 24/07/1972.",Field Confirmed,,,User field input
UM-03206,Tanisha Gawariya,8529561725.0,8529561725.0,Santoshi Nagar,,250-A,TVS Circle Road,324009.0,2.0,DADABARI_SO,SANTOSHI-H250A-TANISHA-GAWARIYA,HH-SANTOSHI-H250A-TANISHA-GAWARIYA,,,,,,"250-A, Santoshi Nagar, Kota - 324009, TVS Circle Road.",Field Confirmed,,,User field input
UM-03207,Varsha Yadav,7828891885.0,7828891885.0,Santoshi Nagar,,22-A,Shiv Mandir ke pass,324009.0,2.0,DADABARI_SO,SANTOSHI-H22A-VARSHA-YADAV,HH-SANTOSHI-H22A-VARSHA-YADAV,,,,,,"22-A, Santoshi Nagar, Kota - 324009, Shiv Mandir ke pass.",Field Confirmed,,,User field input
UM-03208,Renu Pareta,8503813532.0,8503813532.0,Santoshi Nagar,,316-A,Sarkari School ke samne ki gali,324009.0,2.0,DADABARI_SO,SANTOSHI-H316A-RENU-PARETA,HH-SANTOSHI-H316A-RENU-PARETA,,,,,,"316-A, Santoshi Nagar, Kota - 324009, Sarkari School ke samne ki gali. DOB: 10/01/2002.",Field Confirmed,,,User field input
UM-03209,Pragya Bairwa,7062221164.0,7062221164.0,Santoshi Nagar,,167,Hanuman ji ke mandir ke pass,324009.0,2.0,DADABARI_SO,SANTOSHI-H167-PRAGYA-BAIRWA,HH-SANTOSHI-H167-PRAGYA-BAIRWA,,,,,,"167, Santoshi Nagar, Kota - 324009, Hanuman ji ke mandir ke pass. Block not verified.",Field Confirmed,,,User field input
UM-03210,Gajendra Prajapat,8955806970.0,8955806970.0,Santoshi Nagar,,1-A,Real Public School ke pass; Shiv Mandir,324009.0,2.0,DADABARI_SO,SANTOSHI-H1A-GAJENDRA-PRAJAPAT,HH-SANTOSHI-H1A-GAJENDRA-PRAJAPAT,,,,,,"1-A, Santoshi Nagar, Kota - 324009, Real Public School ke pass; Shiv Mandir.",Field Confirmed,,,User field input
UM-03211,Pooja Dagar,8000774071.0,8000774071.0,Santoshi Nagar,,594-B,,324009.0,2.0,DADABARI_SO,SANTOSHI-H594B-POOJA-DAGAR,HH-SANTOSHI-H594B-POOJA-DAGAR,,,,,,"594-B, Santoshi Nagar, Kota - 324009. Landmark not verified.",Field Confirmed,,,User field input
UM-03212,Depti Mehra,9660717644.0,9660717644.0,Keshavpura,7,Plot 95,Near Shree Ram School,324009.0,2.0,DADABARI_SO,KP-S7-PLOT095,HH-KP-S7-PLOT095,,,,,,"Plot number 95 Keshpura Sector 7, Kota - 324009, Near Shree Ram School. Shobha Kumar Mehra. Noted",Field Confirmed,,,User field input
UM-03213,Pravesh Suman,8058934802.0,8058934802.0,Keshavpura,6,342,Corner ka makan 295 ke samne,324009.0,2.0,DADABARI_SO,KP-S6-H342,HH-KP-S6-H342,,,,,,"342 Sector 6 Keshpura, Kota - 324009, Corner ka makan 295 ke samne. Mamta Suman.",Field Confirmed,,,User field input
UM-03214,Santosh Kasyap,9929563164.0,9929563164.0,Keshavpura,6,384,Near Parmani Properties,324009.0,2.0,DADABARI_SO,KP-S6-H384,HH-KP-S6-H384,,,,,,"384, MD Mission Main Road, Sector 6 Keshpura, Kota - 324009, Near Parmani Properties. Vinod Singh.",Field Confirmed,,,User field input
UM-03215,Neelam Kumari Prajapati,8947841115.0,8947841115.0,Keshavpura,6,KH 164,Shitla Mata Mandir side,324009.0,2.0,DADABARI_SO,KP-S6-KH164,HH-KP-S6-KH164,,,,,,"KH 164 Sector 6 Keshavpura, Kota - 324009, Shitla Mata Mandir side. Jogendra Kumar Prajapati / Chittar Lal Prajapati. Interested in PLI and FD/TD; follow-up required",Field Confirmed,,,User field input
UM-03216,Atul Prajapati,9928402829.0,9928402829.0,Keshavpura,6,171,,324009.0,2.0,DADABARI_SO,KP-S6-H171,HH-KP-S6-H171,,,,,,"171 Sector 6 Keshavpura, Kota - 324009. Ramratan Prajapati. Landmark not verified",Field Confirmed,,,User field input
UM-03217,Himanshu / Brijraj,9530453052.0,9530453052.0,Keshavpura,6,110,,324009.0,2.0,DADABARI_SO,KP-S6-H110,HH-KP-S6-H110,,,,,,"110 Sector 6 Keshpura, Kota - 324009. Brijraj added.",Field Confirmed,,,User field input
UM-03218,Satish Sen / Satyanarayana Sen,9782010309.0,9782010309.0,Keshavpura,7,UIT 162,"UIT 162, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-UIT162,HH-KP-S7-UIT162,,,,,,Satish Sen and Satyanarayana Sen; corner house at UIT 162; Vasundra Park landmark.,Field Confirmed,,,User field input
UM-03219,Ashish Soni,9672226132.0,9672226132.0,Keshavpura,7,688,"688, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-H0688,HH-KP-S7-H0688,,,,,,Household also includes Govind Lal Soni and Monika Soni.,Field Confirmed,,,User field input
UM-03220,Monika Soni,7850874768.0,7850874768.0,Keshavpura,7,688,"688, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-H0688,HH-KP-S7-H0688,,,,,,Household member; Govind Lal Soni also at address.,Field Confirmed,,,User field input
UM-03221,Shailja Agarwal,6375676331.0,6375676331.0,Keshavpura,7,445,"445, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-H0445,HH-KP-S7-H0445,,,,,,Shyam Bihari Agarwal also at address.,Field Confirmed,,,User field input
UM-03222,Aman Singh Sisodiya,8209466257.0,8209466257.0,Keshavpura,4,7,"House No. 7, Ganesh Printing Press wali gali, Gali No. 2, Keshavpura Sector 4, Kota - 324009",324009.0,6.0,DADABARI_SO,KP-S4-H7,HH-KP-S4-H7,,,,,,Beat 6 coverage noted separately under Ram Kishan Meghwal.,Field Confirmed,,,User field input
UM-03223,Vranda Singh Yadhuvanshi / Mandeep Singh Yadhuvanshi,9829120933.0,9829120933.0,Keshavpura,7,307,"307, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-H0307,HH-KP-S7-H0307,,,,,,Vranda Singh Yadhuvanshi and Mandeep Singh Yadhuvanshi.,Field Confirmed,,,User field input
UM-03224,Sashi ala Shukla,8107651667.0,8107651667.0,Keshavpura,7,Plot 194,"Plot 194, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-H0194,HH-KP-S7-H0194,,,,,,User supplied name as “Sashi ala Shukla”.,Field Confirmed,,,User field input
UM-03225,SHIVAM Chittora,9983085170.0,9983085170.0,Keshavpura,7,616,"616, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-H0616,HH-KP-S7-H0616,,,,,,Buddi Prakash Chittora also at address.,Field Confirmed,,,User field input
UM-03226,Prince Mahawar,9636417344.0,9636417344.0,Keshavpura,7,415,"415, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-H0415,HH-KP-S7-H0415,,,,,,Suraj Prakash Mahawar also at address.,Field Confirmed,,,User field input
UM-03227,Lavishaka,9001541928.0,9001541928.0,Keshavpura,7,995,"995, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-H0995,HH-KP-S7-H0995,,,,,,Father/name provided: Chandan. Sector/address needs verification.,Needs Verification,,,User field input
MU-KP-S2-H433,Mukesh Kumar Yogi,8107769843.0,8107769843.0,Keshavpura,2,433,"H. No. 433, Keshavpura Sector 2, near Shiv Shakti Fancy Store, Kota - 324009",324009.0,6.0,DADABARI_SO,KP-S2-H433,HH-KP-S2-H433-MUKESH,,,,,,Household member Rameshwar Prasad Yogi also recorded.,Field Confirmed,,,User field input
UM-03231,Mukesh Nama,9875239485.0,9875239485.0,Keshavpura,6,KH 57,"KH 57, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-KH057,HH-KP-S6-KH057,,,,,,Resident/mobile reported by user.,Field Confirmed,,,Project conversation
UM-03232,Rani,9649389713.0,9649389713.0,Keshavpura,6,KH 78,"KH 78, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-KH078,HH-KP-S6-KH078,,,,,,Resident/mobile reported by user; surname not provided.,Field Confirmed,,,Project conversation
UM-03234,Anil Sharma,9588020880.0,9588020880.0,Keshavpura,6,70,"House 70, Pipleshwar Mahadev Ki Gali, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-H070,HH-KP-S6-H070,,,,,,Address and mobile reported by user.,Field Confirmed,,,Project conversation
UM-03236,Yash Soni,8824940446.0,8824940446.0,Keshavpura,6,303,"House 303, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-H303,HH-KP-S6-H303,,,,,,Household members and mobiles reported by user; relationships not specified.,Field Confirmed,,,Project conversation
UM-03237,Pawan Kumar Soni,9509476180.0,9509476180.0,Keshavpura,6,303,"House 303, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-H303,HH-KP-S6-H303,,,,,,Household members and mobiles reported by user; relationships not specified.,Field Confirmed,,,Project conversation
UM-03238,Bhupendra Kumar,9829290148.0,9829290148.0,Keshavpura,6,386,"House 386, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-H386,HH-KP-S6-H386,,,,,,Household members reported by user; relationships/mobiles for Kapil Kumar and Rishi not supplied. Business name Ridhi Sidhi Traders also reported at this property.,Field Confirmed,,,Project conversation
UM-03243,Udai Lal,9928428772.0,9928428772.0,Keshavpura,7,,"UIT220, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-UIT220,HH-KP-S7-UIT220,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03246,Premila Bhardwaj,9309489510.0,9309489510.0,Keshavpura,7,,"P0347, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0347,HH-KP-S7-P0347,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03247,Kartikey Bhardwaj,9636296653.0,9636296653.0,Keshavpura,7,,"P0361, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0361,HH-KP-S7-P0361,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03249,Hemant Singh,9828824241.0,9828824241.0,Keshavpura,7,,"P0803, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0803,HH-KP-S7-P0803,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03251,Chetan Sharma,9454165463.0,9454165463.0,Keshavpura,7,,"P0046, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0046,HH-KP-S7-P0046,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03254,Suresh Chandra Sarvhara,9928539446.0,9928539446.0,Keshavpura,7,,"P0445, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0445,HH-KP-S7-P0445,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03255,Rajendra Singh,8302089819.0,8302089819.0,Keshavpura,7,,"P0492, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0492,HH-KP-S7-P0492,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03257,Nagendra Singh Ji,8233002563.0,8233002563.0,Keshavpura,7,,"P0580, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0580,HH-KP-S7-P0580,,,,,Not Scheduled,Near Vikash Park,Field Confirmed,46254,,User field input
UM-03258,Kiran Mahawar,9829192734.0,9829192734.0,Keshavpura,7,,"P0598, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0598,HH-KP-S7-P0598,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03260,Vishal,8209198618.0,8209198618.0,Keshavpura,7,,"P0667, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0667,HH-KP-S7-P0667,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03262,Mahendra Kumar Joshi,8112257214.0,8112257214.0,Keshavpura,7,,"P0800, Keshavpura Sector 7, Kota - 324009",324009.0,2.0,DADABARI_SO,KP-S7-P0800,HH-KP-S7-P0800,,,,,Not Scheduled,,Field Confirmed,46254,,User field input
UM-03263,Jyoti Prajapati,6377630581.0,6377630581.0,Santoshi Nagar,,58-A,"58-A Santoshi Nagar, Shiv Mandir wali gali",324009.0,2.0,DADABARI_SO,SANTOSHI-H58A,HH-SANTOSHI-H58A,,,,,,User field input; relationship not inferred,Field Confirmed,,,User field input
UM-03264,Sonu Yadav,7742643750.0,7742643750.0,Santoshi Nagar,,180-A,"180-A Santoshi Nagar, Shiv Mandir wale Chauk",324009.0,2.0,DADABARI_SO,SANTOSHI-H180A,HH-SANTOSHI-H180A,,,,,,User field input; relationship not inferred,Field Confirmed,,,User field input
UM-03270,Neelu Jatav,9257502401.0,9257502401.0,Santoshi Nagar,,350-A,"350-A Santoshi Nagar, Mamta Kirana se pehle wali gali",324009.0,2.0,DADABARI_SO,SANTOSHI-H350A,HH-SANTOSHI-H350A,,,,,,User field input; relationship not inferred,Field Confirmed,,,User field input
UM-03271,Vijay Meghwal,7357710670.0,,Santoshi Nagar,,462-B,"462-B Santoshi Nagar, near Ramdev Mandir, gali ka last makan",324009.0,2.0,DADABARI_SO,SANTOSHI-H462B,HH-SANTOSHI-H462B,,,,,,User field input; mobile and address updated,Field Confirmed,,,User field input
UM-03275,Saroj Kevat,8769716045.0,8769716045.0,Santoshi Nagar,,597-B,597-B Santoshi Nagar,324009.0,2.0,DADABARI_SO,SANTOSHI-H597B,HH-SANTOSHI-H597B,,,,,,User field input; relationship not inferred,Field Confirmed,,,User field input
UM-03276,Jugraj Meghwal,9602965471.0,9602965471.0,Santoshi Nagar,,601,"601 Santoshi Nagar, Mehta Ji ki dukan ke aage wali gali me left side, Ramdev Mandir wali gali",324009.0,2.0,DADABARI_SO,SANTOSHI-H601,HH-SANTOSHI-H601,,,,,,User field input; relationship not inferred,Field Confirmed,,,User field input
UM-03277,Mamta,8890496499.0,8890496499.0,Santoshi Nagar,,633,633 Santoshi Nagar,324009.0,2.0,DADABARI_SO,SANTOSHI-H633,HH-SANTOSHI-H633,,,,,,User field input; relationship not inferred,Field Confirmed,,,User field input
UM-03278,Suresh Kumar,9829102223.0,9829102223.0,Santoshi Nagar,,684,684 Santoshi Nagar,324009.0,2.0,DADABARI_SO,SANTOSHI-H684,HH-SANTOSHI-H684,,,,,,User field input; relationship not inferred,Field Confirmed,,,User field input
UM-03279,Vinayak Cash Counter,8769979070.0,8769979070.0,Santoshi Nagar,,292,292 Santoshi Nagar,324009.0,2.0,DADABARI_SO,SANTOSHI-H292,HH-SANTOSHI-H292,,,,,,User field input; relationship not inferred,Field Confirmed,,,User field input
UM-03281,Pooja Rathore,8875498895.0,8875498895.0,Santoshi Nagar,,,Santoshi Nagar,,,,,,,,,,,Father Amba Lal Rathore; contact supplied 20-Aug-2026,Field Confirmed,,,Project conversation
UM-03283,Kavita Kumari Yadav,7878414989.0,7878414989.0,Santoshi Nagar,,151 A,"151 A Santoshi Nagar, near government school",,,,,,,,,,,Father/household relation supplied,Field Confirmed,,,Project conversation
UM-03284,Meena,9116734869.0,9116734869.0,Santoshi Nagar,,334 A,334 A Santoshi Nagar,,,,,,,,,,,Father Pappu Lal,Field Confirmed,,,Project conversation
UM-03285,Chirag,7014124313.0,7014124313.0,Santoshi Nagar,,416 B,"416 B Tejaji Ka Chowk, Santoshi Nagar",,,,,,,,,,,Father/household relation supplied,Field Confirmed,,,Project conversation
UM-03286,Rahul Pankaj,7878305564.0,7878305564.0,Santoshi Nagar,,629 B,"629 B Santoshi Nagar, near nala, line opposite Singara Park",,,,,,,,,,,Shared mobile with Mahendra Pankaj; household relation not explicitly stated,Field Confirmed,,,Project conversation
UM-03287,Seema Kumari,8890870470.0,8890870470.0,Keshavpura,6,208,"208 Sector 6 Keshavpura, Deepanshu Medical wali gali, before Bheru Nath Park",,,,,,,,,,,Husband/family relation supplied,Field Confirmed,,,Project conversation
UM-03288,Praksha Rohida,8562092520.0,8562092520.0,Keshavpura,6,KH 39,KH 39 Sector 6 Keshavpura,,,,,,,,,,,,Field Confirmed,,,Project conversation
UM-03290,Anjali Nagar,7877595522.0,7877595522.0,Keshavpura,7,34,34 Sector 7 Keshavpura,,,,,,,,,,,Family relation supplied,Field Confirmed,,,Project conversation
UM-03291,Jitesh Baheti,9214571193.0,9214571193.0,Keshavpura,7,UIT 167-168,"UIT 167-168 Sector 7 Keshpura, near Vasundra Park",,,,,,,,,,,,Field Confirmed,,,Project conversation
UM-03292,Nishka Medatwal,6378350985.0,6378350985.0,Keshavpura,7,Plot 277,Plot 277 Sector 7 Keshpura,,,,,,,,,,,Father/household relation supplied,Field Confirmed,,,Project conversation
UM-03293,Prisha Rathore,7791051082.0,7791051082.0,Keshavpura,7,587,587 Sector 7 Keshavpura,,,,,,,,,,,Father/household relation supplied,Field Confirmed,,,Project conversation
UM-03294,Akash Soni,7239887524.0,7239887524.0,Keshavpura,4,323 A,"323 A, Rajput, Keshpura Sector 4, landmark Ashok Soni",324009.0,6.0,DADABARI_SO,KP-S4-H0323A,,,,,,New record. CONFLICT — same name Akash Soni already exists with mobile 9351789864 at KH 231 Sector 6; mobile 7239887524 also exists in Master for Akku Soni Kota. Identity not merged.,New record. CONFLICT — same name Akash Soni already exists with mobile 9351789864 at KH 231 Sector 6; identity not merged.,Field Confirmed,,,Project conversation
UM-03295,Shanu Tamboli,7296855836.0,7296855836.0,Santoshi Nagar,,677,"677, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H677,HH-SANTOSHI-H677,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03296,Kapil Tamboli,7296855836.0,7296855836.0,Santoshi Nagar,,677,"677, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H677,HH-SANTOSHI-H677,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03298,Pratigya,9928007962.0,9928007962.0,Santoshi Nagar,,634,"634, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H634,HH-SANTOSHI-H634,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03299,Satyanarayan,9928007962.0,9928007962.0,Santoshi Nagar,,634,"634, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H634,HH-SANTOSHI-H634,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03300,Gopali Bai,9928918096.0,9928918096.0,Santoshi Nagar,,628,"628, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H628,HH-SANTOSHI-H628,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03301,Kanhaiya Lal,9928918096.0,9928918096.0,Santoshi Nagar,,628,"628, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H628,HH-SANTOSHI-H628,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03303,Mangi Lal Saini,8769253419.0,8769253419.0,Santoshi Nagar,,524,"524, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H524,HH-SANTOSHI-H524,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03304,Heera Lal Saini,8769253419.0,8769253419.0,Santoshi Nagar,,524,"524, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H524,HH-SANTOSHI-H524,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03305,Seema,9549543016.0,9549543016.0,Santoshi Nagar,,449-B,"449-B, Santoshi Nagar, Tejaji Ke Chabutrae ke Pass, Near Ganesha Mandir",324009.0,2.0,DADABARI_SO,SANTOSHI-H449B,HH-SANTOSHI-H449B,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03306,Hanuman Prasad,9549543016.0,9549543016.0,Santoshi Nagar,,449-B,"449-B, Santoshi Nagar, Tejaji Ke Chabutrae ke Pass, Near Ganesha Mandir",324009.0,2.0,DADABARI_SO,SANTOSHI-H449B,HH-SANTOSHI-H449B,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03307,Mangal Panwar,8003766438.0,8003766438.0,Santoshi Nagar,,443-A,"443-A, Santoshi Nagar, TVS Showroom ke piche wali gali",324009.0,2.0,DADABARI_SO,SANTOSHI-H443A,HH-SANTOSHI-H443A,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03309,Kashish Bhumliya,8209202183.0,8209202183.0,Santoshi Nagar,,445-A,"445-A, Santoshi Nagar, TVS Circle ki taraf",324009.0,2.0,DADABARI_SO,SANTOSHI-H445A,HH-SANTOSHI-H445A,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03310,Dinesh Bhumliya,8209202183.0,8209202183.0,Santoshi Nagar,,445-A,"445-A, Santoshi Nagar, TVS Circle ki taraf",324009.0,2.0,DADABARI_SO,SANTOSHI-H445A,HH-SANTOSHI-H445A,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03311,Sahil Mehra,8003332838.0,8003332838.0,Santoshi Nagar,,401,"401, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H401,HH-SANTOSHI-H401,,,,,Not Scheduled,Son of Dinesh Mehra | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03312,Dinesh Mehra,8003332838.0,8003332838.0,Santoshi Nagar,,401,"401, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H401,HH-SANTOSHI-H401,,,,,Not Scheduled,Father of Sahil Mehra | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03313,Pooja Mehra,8058888679.0,8058888679.0,Santoshi Nagar,,401,"401, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H401,HH-SANTOSHI-H401,,,,,Not Scheduled,Wife of Kunj Bihari Mehra | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03315,RajNandni Mehra,8058888679.0,8058888679.0,Santoshi Nagar,,401,"401, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H401,HH-SANTOSHI-H401,,,,,Not Scheduled,Daughter of Kunj Bihari Mehra | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03316,Krishna Mehra,8058888679.0,8058888679.0,Santoshi Nagar,,401,"401, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H401,HH-SANTOSHI-H401,,,,,Not Scheduled,Daughter of Kunj Bihari Mehra | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03317,Gaurav Prajapati,6375712422.0,6375712422.0,Santoshi Nagar,,381-A,"381-A, Santoshi Nagar, Near Mamta Kirana, Pahla Chauk, Jyoti Drycleaning wali gali",324009.0,2.0,DADABARI_SO,SANTOSHI-H381A,HH-SANTOSHI-H381A,,,,,Not Scheduled,Son of Ramniwas Prajapati | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03319,Kartik Sharma,8890507033.0,8890507033.0,Santoshi Nagar,,296,"296, Santoshi Nagar",324009.0,2.0,DADABARI_SO,SANTOSHI-H296,HH-SANTOSHI-H296,,,,,Not Scheduled,Son of Raju Sharma | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03321,Akash Suman,8561991673.0,8561991673.0,Santoshi Nagar,,279-A,"279-A, Santoshi Nagar, near Purwani Medical se pehle wali gali",324009.0,2.0,DADABARI_SO,SANTOSHI-H279A-GURUMAANSHU,HH-SANTOSHI-H279A-GURUMAANSHU,,,,,Not Scheduled,Father of Gurumaanshu Suman | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03322,Radhika Nama,9950197870.0,9950197870.0,Santoshi Nagar,,247-A,"247-A, Santoshi Nagar, TVS Circle Main Road, front of Sarkari School",324009.0,2.0,DADABARI_SO,SN-A-247A,HH-SN-A-247A,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03323,Manoj Nama,9950197870.0,9950197870.0,Santoshi Nagar,,247-A,"247-A, Santoshi Nagar, TVS Circle Main Road, front of Sarkari School",324009.0,2.0,DADABARI_SO,SN-A-247A,HH-SN-A-247A,,,,,Not Scheduled,Household member | Added 2026-08-21; household grouped by house number.,Field Confirmed,,,User field input
UM-03324,Srishtika Prajapati,8955806970.0,8955806970.0,Santoshi Nagar,,1-A,"1-A, Santoshi Nagar, Kota - 324009, Real Public School ki gali",324009.0,2.0,DADABARI_SO,SANTOSHI-H1A-GAJENDRA-PRAJAPAT,HH-SANTOSHI-H1A-GAJENDRA-PRAJAPAT,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03325,Gajendra Prajapati,8955806970.0,8955806970.0,Santoshi Nagar,,1-A,"1-A, Santoshi Nagar, Kota - 324009, Real Public School ki gali",324009.0,2.0,DADABARI_SO,SANTOSHI-H1A-GAJENDRA-PRAJAPAT,HH-SANTOSHI-H1A-GAJENDRA-PRAJAPAT,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03326,Roshni Sakywal,7851892298.0,7851892298.0,Santoshi Nagar,,3-A,"3-A, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-3A-ROSHNISAKYWAL,HH-SANTOSHI-3A-ROSHNISAKYWAL,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03327,Prakash Koli,7851892298.0,7851892298.0,Santoshi Nagar,,3-A,"3-A, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-3A-ROSHNISAKYWAL,HH-SANTOSHI-3A-ROSHNISAKYWAL,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03328,Pritviraj Chauhan,9785005325.0,9785005325.0,Santoshi Nagar,,5-A,"5-A, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-5A-PRITVIRAJCHAUHAN,HH-SANTOSHI-5A-PRITVIRAJCHAUHAN,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03330,Soniya Nayak,8619477516.0,8619477516.0,Santoshi Nagar,,46-A,"46-A, Santoshi Nagar, Kota - 324009, Shiv Mandir ki Gali",324009.0,2.0,DADABARI_SO,SANTOSHI-46A-SONIYANAYAK,HH-SANTOSHI-46A-SONIYANAYAK,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03331,Bhagya Laxmi Nayak,9680301967.0,9680301967.0,Santoshi Nagar,,46-A,"46-A, Santoshi Nagar, Kota - 324009, Shiv Mandir ki Gali",324009.0,2.0,DADABARI_SO,SANTOSHI-46A-SONIYANAYAK,HH-SANTOSHI-46A-SONIYANAYAK,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03332,Hariom Nayak,8619477516.0,8619477516.0,Santoshi Nagar,,46-A,"46-A, Santoshi Nagar, Kota - 324009, Shiv Mandir ki Gali",324009.0,2.0,DADABARI_SO,SANTOSHI-46A-SONIYANAYAK,HH-SANTOSHI-46A-SONIYANAYAK,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03333,Mona Panchal,9636588732.0,9636588732.0,Santoshi Nagar,,51-A,"51-A, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-51A-MONAPANCHAL,HH-SANTOSHI-51A-MONAPANCHAL,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03334,Surendra Panchal,9636588732.0,9636588732.0,Santoshi Nagar,,51-A,"51-A, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-51A-MONAPANCHAL,HH-SANTOSHI-51A-MONAPANCHAL,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03335,Harsh Potter,7665700926.0,7665700926.0,Santoshi Nagar,,81-A,"81-A, Santoshi Nagar, Kota - 324009, Near Hanuman Mandir, Alasya Kirana",324009.0,2.0,DADABARI_SO,SANTOSHI-81A-HARSHPOTTER,HH-SANTOSHI-81A-HARSHPOTTER,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03336,Dinesh Potter,7665700926.0,7665700926.0,Santoshi Nagar,,81-A,"81-A, Santoshi Nagar, Kota - 324009, Near Hanuman Mandir, Alasya Kirana",324009.0,2.0,DADABARI_SO,SANTOSHI-81A-HARSHPOTTER,HH-SANTOSHI-81A-HARSHPOTTER,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03337,Girjesh Potter,9462004738.0,9462004738.0,Santoshi Nagar,,81-A,"81-A, Santoshi Nagar, Kota - 324009, Near Hanuman Mandir, Alasya Kirana",324009.0,2.0,DADABARI_SO,SANTOSHI-81A-HARSHPOTTER,HH-SANTOSHI-81A-HARSHPOTTER,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03338,Ajay Potter,9462004738.0,9462004738.0,Santoshi Nagar,,81-A,"81-A, Santoshi Nagar, Kota - 324009, Near Hanuman Mandir, Alasya Kirana",324009.0,2.0,DADABARI_SO,SANTOSHI-81A-HARSHPOTTER,HH-SANTOSHI-81A-HARSHPOTTER,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03339,Monika Kumari Yadav,7878310729.0,7878310729.0,Santoshi Nagar,,160-A,"160-A, Santoshi Nagar, Kota - 324009, Corner makan",324009.0,2.0,DADABARI_SO,SANTOSHI-160A-SANJAY-JATAV,HH-SANTOSHI-160A-SANJAY-JATAV,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03340,Sanjay Jatav,7878310729.0,7878310729.0,Santoshi Nagar,,160-A,"160-A, Santoshi Nagar, Kota - 324009, Corner makan",324009.0,2.0,DADABARI_SO,SANTOSHI-160A-SANJAY-JATAV,HH-SANTOSHI-160A-SANJAY-JATAV,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03341,Ajay Singh,9829718926.0,9829718926.0,Santoshi Nagar,,165/30,"165/30, Santoshi Nagar, Kota - 324009, Hanuman Mandir, B Block",324009.0,2.0,DADABARI_SO,SANTOSHI-16530-AJAYSINGH,HH-SANTOSHI-16530-AJAYSINGH,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03342,Bharat Singh,9829718926.0,9829718926.0,Santoshi Nagar,,165/30,"165/30, Santoshi Nagar, Kota - 324009, Hanuman Mandir, B Block",324009.0,2.0,DADABARI_SO,SANTOSHI-16530-AJAYSINGH,HH-SANTOSHI-16530-AJAYSINGH,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03343,Diya Kumari Jatav,9694813416.0,9694813416.0,Santoshi Nagar,,169,"169, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-H169,HH-SANTOSHI-169-DIYAKUMARIJATAV,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03344,Rajan Jatav,9694813416.0,9694813416.0,Santoshi Nagar,,169,"169, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-H169,HH-SANTOSHI-169-DIYAKUMARIJATAV,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03345,Radhe Yadav,8290029810.0,8290029810.0,Santoshi Nagar,,172,"172, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-H172,HH-SANTOSHI-172-RADHEYADAV,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03346,Hemant Yadav,8290029810.0,8290029810.0,Santoshi Nagar,,172,"172, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-H172,HH-SANTOSHI-172-RADHEYADAV,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03347,Sonam Kumari,8094254494.0,8094254494.0,Santoshi Nagar,,194,"194, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-H194,HH-SANTOSHI-194-SONAMKUMARI,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-03348,Jagadish Chandra,8094254494.0,8094254494.0,Santoshi Nagar,,194,"194, Santoshi Nagar, Kota - 324009",324009.0,2.0,DADABARI_SO,SANTOSHI-H194,HH-SANTOSHI-194-SONAMKUMARI,,,,,,Added from user field input 2026-08-21.,Field Confirmed,,,User field input
UM-1BDEEPIKABANJARA,Deepika Banjara,9928575212.0,9928575212.0,Keshpura,Sector 7,1-B,"1-B, Sector 7, Keshpura, Near Vishkarma Mandir, Vyamashala ke pass",324009.0,2.0,DADABARI_SO,SANTOSHI-1BDEEPIKABANJARA,HH-SANTOSHI-1BDEEPIKABANJARA,,,,,Active,Household member of Babu Lal Banjara; added 2026-08-21.,Field Confirmed,,,User field input
UM-1BBABULALBANJARA,Babu Lal Banjara,9928575212.0,9928575212.0,Keshpura,Sector 7,1-B,"1-B, Sector 7, Keshpura, Near Vishkarma Mandir, Vyamashala ke pass",324009.0,2.0,DADABARI_SO,SANTOSHI-1BDEEPIKABANJARA,HH-SANTOSHI-1BDEEPIKABANJARA,,,,,Active,Household member of Deepika Banjara; added 2026-08-21.,Field Confirmed,,,User field input
UM-KP-S6-H018-DEEPAK,Deepak Jatav,7742210859.0,7742210859.0,Keshavpura,6,18,"H. No. 18, Keshavpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-H018,HH-KP-S6-H018,,,,,Pending,Household member: Nisha Kumari Jatav. Relationship not supplied. Added 2026-08-21.,Field Confirmed,,,User field input
UM-03364,Dharmveer Singh Chaudhary,8963064539.0,8963064539.0,Santoshi Nagar,,187-A,"187-A, Santoshi Nagar, near Pahla Chauk",324009.0,2.0,DADABARI_SO,SANTOSHI-H187A,HH-SANTOSHI-H187A,Police Constable,,,,Not Scheduled,Police constable; near Pahla Chauk. Added 2026-08-21 from project conversation.,Field Confirmed,,,Project conversation
UM-03366,Anju Yadav,8302446503.0,8302446503.0,Santoshi Nagar,,372 A,"372-A, Santoshi Nagar, near Mamta Kirana wali gali",324009.0,2.0,DADABARI_SO,,,,,,,,"NEW 2026-08-21. Household members: Anju Yadav, Raju Yadav, Suraj Yadav. Same mobile supplied for household members.",Field Confirmed,2026-08-21,,User field input
UM-03367,Raju Yadav,8302446503.0,8302446503.0,Santoshi Nagar,,372 A,"372-A, Santoshi Nagar, near Mamta Kirana wali gali",324009.0,2.0,DADABARI_SO,,,,,,,,"NEW 2026-08-21. Household members: Anju Yadav, Raju Yadav, Suraj Yadav. Same mobile supplied for household members.",Field Confirmed,2026-08-21,,User field input
UM-03368,Suraj Yadav,8302446503.0,8302446503.0,Santoshi Nagar,,372 A,"372-A, Santoshi Nagar, near Mamta Kirana wali gali",324009.0,2.0,DADABARI_SO,,,,,,,,"NEW 2026-08-21. Household members: Anju Yadav, Raju Yadav, Suraj Yadav. Same mobile supplied for household members.",Field Confirmed,2026-08-21,,User field input
UM-03369,Tisha Vaishnav,8058804112.0,8058804112.0,,,38 A,"38-A, Near real puci c bhu abhilelhs nirishak",,2.0,DADABARI_SO,,,,,,,,"NEW 2026-08-21. Household members: Tisha Vaishnav, Kamal Kumar Vaishnav, Indra Vaishnav. Same mobile supplied for household members.",Field Confirmed,2026-08-21,,User field input
UM-03370,Kamal Kumar Vaishnav,8058804112.0,8058804112.0,,,38 A,"38-A, Near real puci c bhu abhilelhs nirishak",,2.0,DADABARI_SO,,,,,,,,"NEW 2026-08-21. Household members: Tisha Vaishnav, Kamal Kumar Vaishnav, Indra Vaishnav. Same mobile supplied for household members.",Field Confirmed,2026-08-21,,User field input
UM-03371,Indra Vaishnav,8058804112.0,8058804112.0,,,38 A,"38-A, Near real puci c bhu abhilelhs nirishak",,2.0,DADABARI_SO,,,,,,,,"NEW 2026-08-21. Household members: Tisha Vaishnav, Kamal Kumar Vaishnav, Indra Vaishnav. Same mobile supplied for household members.",Field Confirmed,2026-08-21,,User field input
UM-03372,Nishant Sharma,7822977455.0,7822977455.0,Keshpura,7,876,"Plot 876, Keshavpura Sector 7; Vasundra Park first corner, near UIT 142-143",324009.0,2.0,DADABARI_SO,KP-S7-PLOT876,HH-KP-S7-H876-NISHANT,,,,,,"NEW 2026-08-22. Landmark: Vasundra Park first corner, near UIT 142-143. Same name as existing Nishant Sharma (different mobile/address); identity not merged pending confirmation.",Field Confirmed,,,Project conversation
UM-03373,Udham Singh Kaysap,7742168773,7742168773,Santoshi Nagar,,Not verified,"Santoshi Nagar, landmark: Nale Ke Pass",324009,,,,,,,,Update: Nale Ke Pass,Field Confirmed,,,User update
UM-03374,Satish Chandra Misra,9351593991,9351593991,Sector 7 Keshpura,7,Plot 239,"Plot 239 Sector 7 Keshpura",324009,,,,,,,,Update: Plot 239,Field Confirmed,,,User update
UM-03375,Susma,7976356826,7976356826,Sector 6 Keshavpura,6,168-B,"168-B Sector 6 Keshavpura, landmark: Kumaharo Ka mohalla",324009,,,,,,,,Update: 168-B,Field Confirmed,,,User update
UM-03376,PRINCY Sharma,9799332121,9799332121,Sector 6 Keshpura,6,KH 3,"KH 3 Sector 6 Keshpura, landmark: Sarkari School ke Chote gate Ke pass",324009,,,,,,,,Update: KH 3,Field Confirmed,,,User update
UM-03377,Kanhaiya lal vaishnav,9829157741,9829157741,Keshavpura,6,142,"142, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-142,HH-KP-S6-142,,,,,,Household member: Vrinda Vaisnav.,Field Confirmed,2026-08-24,,User update
UM-03378,Vrinda Vaisnav,9829157741,9829157741,Keshavpura,6,142,"142, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-142,HH-KP-S6-142,,,,,,Household member.,Field Confirmed,2026-08-24,,User update
UM-03379,Sen sahab,Unknown,Unknown,Keshavpura,6,262,"262, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-262,HH-KP-S6-262,,,,,,No such person Kavya Yadav. Sen sahab resides here.,Field Confirmed,2026-08-24,,User update
UM-03380,Susma,7976356826,7976356826,Keshavpura,6,168 B,"168-B, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-168B,HH-KP-S6-168B,,,,,,Household member.,Field Confirmed,2026-08-24,,User update
UM-03381,PRINCY SHARMA,9799332121,9799332121,Keshavpura,6,KH 3,"KH 3, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-KH3,HH-KP-S6-KH3,,,,,,Laundry shop owner Kanta Bai also here.,Field Confirmed,2026-08-24,,User update
UM-03382,DIVYA JAIN,8855910454,8855910454,Keshavpura,6,KH 103,"KH 103, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-KH103,HH-KP-S6-KH103,,,,,,Household member.,Field Confirmed,2026-08-24,,User update
UM-03383,KAMLESH JAIN,8855910454,8855910454,Keshavpura,6,KH 103,"KH 103, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-KH103,HH-KP-S6-KH103,,,,,,Household member.,Field Confirmed,2026-08-24,,User update
UM-03384,Dhanraj Bairwa,Unknown,Unknown,Keshavpura,6,4-5,"4-5, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-4-5,HH-KP-S6-4-5,,,,,,Household member.,Field Confirmed,2026-08-24,,User update
UM-03385,Chandra Prakash Suman (Lucky Classes),Unknown,Unknown,Keshavpura,6,15,"15, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-15,HH-KP-S6-15,,,,,,Lucky Classes.,Field Confirmed,2026-08-24,,User update
UM-03386,Chanchal Soni,Unknown,Unknown,Keshavpura,6,KH 191,"KH 191, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-KH191,HH-KP-S6-KH191,,,,,,Household member.,Field Confirmed,2026-08-24,,User update
UM-03387,Dashrath Soni,Unknown,Unknown,Keshavpura,6,KH 191,"KH 191, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-KH191,HH-KP-S6-KH191,,,,,,Household member.,Field Confirmed,2026-08-24,,User update
UM-03388,Mahesh Jain,Unknown,Unknown,Keshavpura,6,UIT 106,"UIT 106, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-UIT106,HH-KP-S6-UIT106,,,,,,Household member.,Field Confirmed,2026-08-24,,User update
UM-03389,Renu Jain,Unknown,Unknown,Keshavpura,6,UIT 106,"UIT 106, Keshpura Sector 6",324009.0,2.0,DADABARI_SO,KP-S6-UIT106,HH-KP-S6-UIT106,,,,,,Household member.,Field Confirmed,2026-08-24,,User update
`;

// Helper to normalize telephone numbers
export const normalizeMobile = (mobile: string | undefined | null): string => {
  if (!mobile) return '';
  // Remove trailing .0 from floating point export
  let clean = String(mobile).replace(/\.0$/, '').replace(/\D/g, '');
  if (clean.length > 10) {
    clean = clean.slice(-10);
  }
  return clean;
};

// CSV parsing engine to construct Customer[] objects
export function parseInitialMasterData(): Customer[] {
  const lines = RAW_MASTER_CSV_DATA.trim().split('\n');
  if (lines.length <= 1) return [];

  const customers: Customer[] = [];
  
  // Custom CSV parser handling quotes
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line with quotes support
    const row: string[] = [];
    let insideQuote = false;
    let currentField = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"' && (c === 0 || line[c - 1] !== '\\')) {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    row.push(currentField.trim());

    const [
      masterId, name, rawMobile, rawWhatsapp, area, sector, houseNo,
      fullAddress, pincode, beatNo, officeId, propertyId, householdId,
      occupation, existingBanking, financialInterest, leadScore,
      followUpStatus, remarks, verificationStatus, lastVisit, nextFollowUp, source
    ] = row;

    if (!name && !rawMobile) continue;

    const normMobile = normalizeMobile(rawMobile);
    const normWhatsapp = normalizeMobile(rawWhatsapp) || normMobile;
    const cleanPincode = pincode ? String(pincode).replace(/\.0$/, '').trim() : '324009';
    const cleanBeat = beatNo ? String(beatNo).replace(/\.0$/, '').trim() : (sector === '4' ? '6' : '2');

    // Determine default products based on remarks and financial interest
    const initialProducts: any[] = [];
    const lowerRemarks = (remarks || '').toLowerCase();
    const lowerInterest = (financialInterest || '').toLowerCase();

    if (lowerRemarks.includes('sukanya') || lowerInterest.includes('sukanya')) {
      initialProducts.push({
        id: `p-${masterId}-ssa`,
        productCode: 'SSA',
        productName: 'Sukanya Samriddhi Yojana',
        status: lowerRemarks.includes('opened') ? 'Active' : 'Inquiry',
        monthlyDeposit: 1000,
        lastUpdated: '2026-08-20'
      });
    }

    if (lowerRemarks.includes('pli') || lowerInterest.includes('pli')) {
      initialProducts.push({
        id: `p-${masterId}-pli`,
        productCode: 'PLI_SURAKSHA',
        productName: 'Postal Life Insurance (Suraksha)',
        status: lowerRemarks.includes('customer') ? 'Active' : 'Inquiry',
        sumAssuredOrBalance: 500000,
        lastUpdated: '2026-08-20'
      });
    }

    if (lowerRemarks.includes('rd') || lowerInterest.includes('rd')) {
      initialProducts.push({
        id: `p-${masterId}-rd`,
        productCode: 'RD',
        productName: '5-Year Recurring Deposit',
        status: 'Inquiry',
        monthlyDeposit: 500,
        lastUpdated: '2026-08-20'
      });
    }

    // Calculate completeness
    let completeness = 30;
    if (name) completeness += 20;
    if (normMobile) completeness += 25;
    if (houseNo || fullAddress) completeness += 15;
    if (sector || area) completeness += 10;

    const cust: Customer = {
      id: masterId || `CUST-${i.toString().padStart(5, '0')}`,
      masterId: masterId || `UM-${i.toString().padStart(5, '0')}`,
      name: name || 'Valued Postal Customer',
      mobile: normMobile,
      whatsapp: normWhatsapp,
      alternateMobile: '',
      email: '',
      fatherHusbandName: '',
      occupation: occupation || '',
      category: 'General',
      address: {
        houseNumber: houseNo || '',
        sectorLocality: sector ? `Sector ${sector}` : (area || 'Keshavpura'),
        area: area || 'Keshavpura',
        pincode: cleanPincode,
        landmark: '',
        fullAddress: fullAddress || (houseNo ? `${houseNo}, ${sector ? 'Sector ' + sector : area}, Kota - ${cleanPincode}` : '')
      },
      area: area || '',
      sector: sector || '',
      houseNo: houseNo || '',
      beatNo: cleanBeat,
      officeId: officeId || 'DADABARI_SO',
      propertyId: propertyId || '',
      householdId: householdId || '',
      existingBanking: existingBanking || '',
      financialInterest: financialInterest || '',
      leadScore: leadScore ? parseInt(leadScore, 10) : 60,
      followUpStatus: followUpStatus || (nextFollowUp ? 'Scheduled' : 'Not Scheduled'),
      verificationStatus: (verificationStatus as any) || 'Field Confirmed',
      approvalStatus: 'Approved',
      source: source || 'MASTER_UNIQUE.csv',
      remarks: remarks || '',
      notes: remarks || '',
      products: initialProducts,
      dataCompleteness: Math.min(100, completeness),
      hasConflict: lowerRemarks.includes('conflict'),
      conflictDetails: lowerRemarks.includes('conflict') ? [remarks] : [],
      lastVisit: lastVisit || '2026-08-20',
      nextFollowUpDate: nextFollowUp || '',
      createdAt: '2026-08-15',
      updatedAt: '2026-08-22'
    };

    customers.push(cust);
  }

  return customers;
}

export const INITIAL_CUSTOMERS: Customer[] = parseInitialMasterData();
