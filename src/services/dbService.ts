import { initDB } from '../lib/db';

const getDB = async () => initDB();

export const dbService = {
    getAll: async <T>(storeName: any): Promise<T[]> => {
        const db = await getDB();
        return db.getAll(storeName);
    },
    set: async <T>(storeName: any, item: T) => {
        const db = await getDB();
        await db.put(storeName, item);
    },
    setAll: async <T extends { id?: string }>(storeName: any, items: T[]) => {
        const db = await getDB();
        const tx = db.transaction(storeName, 'readwrite');
        await Promise.all([
            ...items.map(item => {
                if (!item.id) {
                    item.id = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                }
                return tx.store.put(item);
            }),
            tx.done
        ]);
    },
    delete: async (storeName: any, id: string) => {
        const db = await getDB();
        await db.delete(storeName, id);
    }
};
