import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { seedExpenses, defaultBudgets } from '../data/finance';
import { clients as seedClients } from '../data/clients';
import { packages as seedPackages } from '../data/packages';
import { buildSeedPayments } from '../lib/finance';
import type { CustomerPayment, Expense, ExpenseCategory } from '../types';

// v2: expense seed reworked for Honey Spa Bangi as the only spa premises.
const STORAGE_KEY = 'nrmc-finance-v2';

interface FinanceState {
  expenses: Expense[];
  payments: CustomerPayment[];
  budgets: Record<ExpenseCategory, number>;
}

function seedState(): FinanceState {
  const packageById = (id: string) => seedPackages.find((p) => p.id === id);
  return { expenses: seedExpenses, payments: buildSeedPayments(seedClients, packageById), budgets: defaultBudgets };
}

function loadInitial(): FinanceState {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FinanceState;
        if (parsed.expenses && parsed.payments && parsed.budgets) return parsed;
      }
    } catch {
      // fall through to seed
    }
  }
  return seedState();
}

interface FinanceStoreValue extends FinanceState {
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  setExpenseStatus: (id: string, status: Expense['status']) => void;
  removeExpense: (id: string) => void;
  recordPayment: (payment: Omit<CustomerPayment, 'id'>) => CustomerPayment;
  setBudget: (category: ExpenseCategory, amount: number) => void;
  resetToDefaults: () => void;
}

const FinanceStoreContext = createContext<FinanceStoreValue | null>(null);

export function FinanceStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors in demo environment
    }
  }, [state]);

  const value = useMemo<FinanceStoreValue>(
    () => ({
      ...state,
      addExpense: (input) => {
        const expense: Expense = { ...input, id: `exp-${Date.now()}` };
        setState((s) => ({ ...s, expenses: [expense, ...s.expenses].sort((a, b) => b.date.localeCompare(a.date)) }));
        return expense;
      },
      setExpenseStatus: (id, status) =>
        setState((s) => ({ ...s, expenses: s.expenses.map((e) => (e.id === id ? { ...e, status } : e)) })),
      removeExpense: (id) => setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) })),
      recordPayment: (input) => {
        const payment: CustomerPayment = { ...input, id: `pay-${Date.now()}` };
        setState((s) => ({ ...s, payments: [payment, ...s.payments].sort((a, b) => b.date.localeCompare(a.date)) }));
        return payment;
      },
      setBudget: (category, amount) => setState((s) => ({ ...s, budgets: { ...s.budgets, [category]: amount } })),
      resetToDefaults: () => setState(seedState()),
    }),
    [state],
  );

  return <FinanceStoreContext.Provider value={value}>{children}</FinanceStoreContext.Provider>;
}

export function useFinanceStore() {
  const ctx = useContext(FinanceStoreContext);
  if (!ctx) throw new Error('useFinanceStore must be used within FinanceStoreProvider');
  return ctx;
}
