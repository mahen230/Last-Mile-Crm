import { AcademyCourse, AcademyProgress } from '../types/models';

const COURSES_KEY = 'kota_division_os_academy_courses_v1';
const PROGRESS_KEY = 'kota_division_os_academy_progress_v1';

class AcademyTrainingService {
  private courses: AcademyCourse[] = [];
  private progressRecords: AcademyProgress[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    try {
      const rawCourses = localStorage.getItem(COURSES_KEY);
      if (rawCourses) {
        this.courses = JSON.parse(rawCourses);
      } else {
        this.courses = [
          {
            id: 'CRSE-01',
            title: 'India Post LDCE & Postal Manual Volume-V Certification',
            departmentOrVertical: 'Department of Posts',
            targetRole: 'Postman / GDS / PA',
            description: 'Comprehensive postal manual statutory training covering mail sorting, registration, insured articles, and delivery SLAs.',
            lessonsCount: 8,
            durationMinutes: 120,
            isMandatory: true,
            passingScorePct: 70,
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'CRSE-02',
            title: 'IPPB & Aadhaar CELC Biometric Onboarding Masterclass',
            departmentOrVertical: 'Department of Posts',
            targetRole: 'GDS / BPM / ABPM',
            description: 'Step-by-step biometric tablet operations for IPPB savings accounts, AePS doorstep cash withdrawal, and child Aadhaar updates.',
            lessonsCount: 6,
            durationMinutes: 90,
            isMandatory: true,
            passingScorePct: 80,
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'CRSE-03',
            title: 'XPO KART B2B Merchant Acquisition & Logistics Operations',
            departmentOrVertical: 'XPO KART & Logistics',
            targetRole: 'Category Manager / B2B Partner',
            description: 'Training on onboarding local merchants, managing beat-linked dark stores, and executing last-mile hyperlocal deliveries.',
            lessonsCount: 5,
            durationMinutes: 75,
            isMandatory: false,
            passingScorePct: 65,
            updatedAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(COURSES_KEY, JSON.stringify(this.courses));
      }

      const rawProgress = localStorage.getItem(PROGRESS_KEY);
      if (rawProgress) {
        this.progressRecords = JSON.parse(rawProgress);
      } else {
        this.progressRecords = [
          {
            id: 'PROG-01',
            courseId: 'CRSE-01',
            staffOrAgentId: 'STAFF-50457421',
            staffName: 'Mahendra Kumar Meena',
            status: 'Completed',
            progressPct: 100,
            scoreObtained: 92,
            certificateIssued: true,
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'PROG-02',
            courseId: 'CRSE-02',
            staffOrAgentId: 'STAFF-50457421',
            staffName: 'Mahendra Kumar Meena',
            status: 'In Progress',
            progressPct: 65,
            scoreObtained: 75,
            certificateIssued: false,
            updatedAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progressRecords));
      }
    } catch {
      this.courses = [];
      this.progressRecords = [];
    }
  }

  private saveAndNotify(): void {
    try {
      localStorage.setItem(COURSES_KEY, JSON.stringify(this.courses));
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progressRecords));
    } catch (e) {
      console.warn('AcademyTrainingService persist failed:', e);
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getAllCourses(): AcademyCourse[] {
    return [...this.courses];
  }

  public getAllProgress(): AcademyProgress[] {
    return [...this.progressRecords];
  }

  public getProgressForStaff(staffOrAgentId: string): AcademyProgress[] {
    return this.progressRecords.filter((p) => p.staffOrAgentId === staffOrAgentId);
  }

  public upsertCourse(course: Partial<AcademyCourse> & { title: string }): AcademyCourse {
    const id = course.id || `CRSE-${Date.now().toString().slice(-4)}`;
    const newCourse: AcademyCourse = {
      id,
      title: course.title.trim(),
      departmentOrVertical: course.departmentOrVertical || 'Department of Posts',
      targetRole: course.targetRole || 'All Staff',
      description: course.description?.trim() || '',
      lessonsCount: course.lessonsCount || 5,
      durationMinutes: course.durationMinutes || 60,
      isMandatory: course.isMandatory ?? true,
      passingScorePct: course.passingScorePct || 70,
      updatedAt: new Date().toISOString(),
    };

    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.courses[idx] = newCourse;
    } else {
      this.courses.unshift(newCourse);
    }

    this.saveAndNotify();
    return newCourse;
  }

  public updateProgress(input: {
    courseId: string;
    staffOrAgentId: string;
    staffName: string;
    status: AcademyProgress['status'];
    progressPct: number;
    scoreObtained?: number;
  }): AcademyProgress {
    const existingIdx = this.progressRecords.findIndex(
      (p) => p.courseId === input.courseId && p.staffOrAgentId === input.staffOrAgentId
    );

    const isCompleted = input.status === 'Completed' || input.progressPct >= 100;
    const progressRecord: AcademyProgress = {
      id: existingIdx >= 0 ? this.progressRecords[existingIdx].id : `PROG-${Date.now().toString().slice(-5)}`,
      courseId: input.courseId,
      staffOrAgentId: input.staffOrAgentId,
      staffName: input.staffName,
      status: isCompleted ? 'Completed' : input.status,
      progressPct: Math.min(100, Math.max(0, input.progressPct)),
      scoreObtained: input.scoreObtained ?? (isCompleted ? 85 : 50),
      certificateIssued: isCompleted,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      this.progressRecords[existingIdx] = progressRecord;
    } else {
      this.progressRecords.unshift(progressRecord);
    }

    this.saveAndNotify();
    return progressRecord;
  }
}

export const academyTrainingService = new AcademyTrainingService();
