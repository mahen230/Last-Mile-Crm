import { UPDATED_STAFF_LIST } from './updatedStaffData';

export const BEAT_MAP = UPDATED_STAFF_LIST.map(staff => ({
    beatNo: staff.beat.replace('Beat ', ''),
    assignedPostman: staff.name,
    contact: staff.contact,
    areasCovered: [] as string[] // You might want to map this from BeatsView later if needed
}));

// Placeholder for now as BeatsView areas aren't easily imported
// Ideally, unify these data structures.
export const getBeatDetails = (beatNo: string) => {
    return UPDATED_STAFF_LIST.find(s => s.beat === `Beat ${beatNo}`);
};
