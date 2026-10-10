import { openDB, IDBPDatabase } from 'idb';
import { Customer, Staff, Lead, FollowUp, SupportTicket, Inquiry, DataConflict, AuditLog } from '../types/models';

const DB_NAME = 'PostalOperationsDB';
const DB_VERSION = 1;

export interface AppDB extends IDBPDatabase {
    customers: Customer;
    tasks: any;
    staff: Staff;
    leads: Lead;
    followUps: FollowUp;
    tickets: SupportTicket;
    inquiries: Inquiry;
    conflicts: DataConflict;
    auditLogs: AuditLog;
}

export const initDB = async () => {
    return openDB<AppDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            db.createObjectStore('customers', { keyPath: 'id' });
            db.createObjectStore('tasks', { keyPath: 'id' });
            db.createObjectStore('staff', { keyPath: 'id' });
            db.createObjectStore('leads', { keyPath: 'id' });
            db.createObjectStore('followUps', { keyPath: 'id' });
            db.createObjectStore('tickets', { keyPath: 'id' });
            db.createObjectStore('inquiries', { keyPath: 'id' });
            db.createObjectStore('conflicts', { keyPath: 'id' });
            db.createObjectStore('auditLogs', { keyPath: 'id' });
        },
    });
};
