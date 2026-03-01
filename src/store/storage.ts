import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import uuid from 'react-native-uuid';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Expense {
    id: string;
    name: string;
    amount: number;
    isPaid: boolean;
    budgetId?: string;
}

export interface Budget {
    id: string;
    name: string;
    income: number;
    expenses: Expense[];
}

const DB_NAME = 'budget.db';
const WEB_STORAGE_KEY = '@web_budgets';

let _dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDb = () => {
    // We handle the case where it might be running on Web (where sqlite doesn't work out of the box).
    if (Platform.OS === 'web') {
        return null;
    }

    if (_dbInstance) {
        return _dbInstance;
    }

    try {
        _dbInstance = SQLite.openDatabaseSync(DB_NAME);
        return _dbInstance;
    } catch (e) {
        console.warn("SQLite open error:", e);
        return null;
    }
};

export const initializeDB = async () => {
    if (Platform.OS === 'web') {
        const existing = await AsyncStorage.getItem(WEB_STORAGE_KEY);
        if (!existing) {
            await AsyncStorage.setItem(WEB_STORAGE_KEY, JSON.stringify([]));
        }
        return;
    }

    const db = getDb();
    if (!db) return;
    db.execSync(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      income REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      budget_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      isPaid INTEGER NOT NULL,
      FOREIGN KEY(budget_id) REFERENCES budgets(id) ON DELETE CASCADE
    );
  `);
};

export const getBudgets = async (): Promise<Budget[]> => {
    if (Platform.OS === 'web') {
        const data = await AsyncStorage.getItem(WEB_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    const db = getDb();
    if (!db) return [];

    const allBudgetsRaw = db.getAllSync<{ id: string, name: string, income: number }>('SELECT * FROM budgets');
    const allExpensesRaw = db.getAllSync<{ id: string, budget_id: string, name: string, amount: number, isPaid: number }>('SELECT * FROM expenses');

    const budgets: Budget[] = allBudgetsRaw.map(b => ({
        id: b.id,
        name: b.name,
        income: b.income,
        expenses: allExpensesRaw
            .filter(e => e.budget_id === b.id)
            .map(e => ({
                id: e.id,
                name: e.name,
                amount: e.amount,
                isPaid: e.isPaid === 1
            }))
    }));

    return budgets;
};

export const saveBudget = async (
    name: string,
    income: number = 0,
    expenses: Expense[] = []
): Promise<Budget> => {
    const id = uuid.v4().toString();
    const newBudget = { id, name, income, expenses };

    if (Platform.OS === 'web') {
        const budgets = await getBudgets();
        budgets.push(newBudget);
        await AsyncStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(budgets));
        return newBudget;
    }

    const db = getDb();
    if (db) {
        db.runSync('INSERT INTO budgets (id, name, income) VALUES (?, ?, ?)', [id, name, income]);
        const stmt = db.prepareSync('INSERT INTO expenses (id, budget_id, name, amount, isPaid) VALUES (?, ?, ?, ?, ?)');
        try {
            expenses.forEach(exp => {
                stmt.executeSync([exp.id, id, exp.name, exp.amount, exp.isPaid ? 1 : 0]);
            });
        } finally {
            stmt.finalizeSync();
        }
    }

    return newBudget;
};

export const updateBudget = async (updatedBudget: Budget): Promise<void> => {
    if (Platform.OS === 'web') {
        let budgets = await getBudgets();
        budgets = budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b);
        await AsyncStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(budgets));
        return;
    }

    const db = getDb();
    if (!db) return;

    db.runSync('UPDATE budgets SET name = ?, income = ? WHERE id = ?', [updatedBudget.name, updatedBudget.income, updatedBudget.id]);

    // Quick hack: delete all expenses and re-insert them
    db.runSync('DELETE FROM expenses WHERE budget_id = ?', [updatedBudget.id]);

    const stmt = db.prepareSync('INSERT INTO expenses (id, budget_id, name, amount, isPaid) VALUES (?, ?, ?, ?, ?)');
    try {
        updatedBudget.expenses.forEach(exp => {
            stmt.executeSync([exp.id, updatedBudget.id, exp.name, exp.amount, exp.isPaid ? 1 : 0]);
        });
    } finally {
        stmt.finalizeSync();
    }
};

export const deleteBudget = async (id: string): Promise<void> => {
    if (Platform.OS === 'web') {
        let budgets = await getBudgets();
        budgets = budgets.filter(b => b.id !== id);
        await AsyncStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(budgets));
        return;
    }

    const db = getDb();
    if (!db) return;
    db.runSync('DELETE FROM budgets WHERE id = ?', [id]);
    db.runSync('DELETE FROM expenses WHERE budget_id = ?', [id]); // also cascade
};

export const exportDatabase = async () => {
    if (Platform.OS === 'web') return;
    try {
        const dbPath = `${Paths.document.uri}SQLite/${DB_NAME}`;
        const exists = await FileSystem.getInfoAsync(dbPath);

        if (!exists.exists) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const targetPath = `${Paths.cache.uri}budgetBackup_${timestamp}.db`;

        await FileSystem.copyAsync({
            from: dbPath,
            to: targetPath
        });

        await Sharing.shareAsync(targetPath, {
            mimeType: 'application/x-sqlite3',
            dialogTitle: 'Export Budget Backup'
        });
    } catch (e) {
        console.error("Export error:", e);
    }
};

export const importDatabase = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['*/*'],  // SQLite mimes can be tricky depending on OS implementation
            copyToCacheDirectory: true
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const fileUri = result.assets[0].uri;
            const dbPath = `${Paths.document.uri}SQLite/${DB_NAME}`;

            await FileSystem.copyAsync({
                from: fileUri,
                to: dbPath
            });
            return true; // Success! Return true so app can reload state
        }
    } catch (e) {
        console.error(e);
        return false;
    }
    return false;
};
