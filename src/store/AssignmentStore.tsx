import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { assignments as seedAssignments, unassignedClientIds as seedUnassigned } from '../data/assignments';
import type { Assignment, AssignmentStatus, ApprovalStatus, PaymentStatus } from '../types';

// Sessions (bookings) store. Keys are versioned so stale seeds from an older dataset are dropped.
const STORAGE_KEY = 'honeyspa-assignments-v2';
const UNASSIGNED_KEY = 'honeyspa-unassigned-v2';

function loadAssignments(): Assignment[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Assignment[];
        if (parsed.length) return parsed;
      }
    } catch {
      // fall through
    }
  }
  return seedAssignments;
}

function loadUnassigned(): string[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(UNASSIGNED_KEY);
      if (raw) return JSON.parse(raw) as string[];
    } catch {
      // fall through
    }
  }
  return seedUnassigned;
}

interface NewBookingInput {
  clientId: string;
  clId: string;
  packageId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface AssignmentStoreValue {
  assignments: Assignment[];
  unassignedClientIds: string[];
  addBooking: (input: NewBookingInput) => Assignment;
  reassignCL: (assignmentId: string, newClId: string) => void;
  reschedule: (assignmentId: string, date: string, startTime: string, endTime: string) => void;
  updateStatus: (assignmentId: string, status: AssignmentStatus) => void;
  setApproval: (assignmentId: string, approvalStatus: ApprovalStatus, note?: string) => void;
  markPaymentStatus: (assignmentId: string, paymentStatus: PaymentStatus) => void;
  removeFromUnassigned: (clientId: string) => void;
  addToUnassigned: (clientId: string) => void;
  resetToDefaults: () => void;
}

const AssignmentStoreContext = createContext<AssignmentStoreValue | null>(null);

let bookingCounter = 8825;

export function AssignmentStoreProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>(loadAssignments);
  const [unassignedClientIds, setUnassignedClientIds] = useState<string[]>(loadUnassigned);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {
      // ignore
    }
  }, [assignments]);

  useEffect(() => {
    try {
      window.localStorage.setItem(UNASSIGNED_KEY, JSON.stringify(unassignedClientIds));
    } catch {
      // ignore
    }
  }, [unassignedClientIds]);

  const value = useMemo<AssignmentStoreValue>(
    () => ({
      assignments,
      unassignedClientIds,
      addBooking: (input) => {
        bookingCounter += 1;
        const newAssignment: Assignment = {
          id: `BK-${bookingCounter}`,
          status: 'pending',
          ...input,
        };
        setAssignments((prev) => [...prev, newAssignment]);
        setUnassignedClientIds((prev) => prev.filter((id) => id !== input.clientId));
        return newAssignment;
      },
      reassignCL: (assignmentId, newClId) =>
        setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, clId: newClId, status: 'pending' } : a))),
      reschedule: (assignmentId, date, startTime, endTime) =>
        setAssignments((prev) =>
          prev.map((a) => (a.id === assignmentId ? { ...a, date, startTime, endTime, status: 'pending', rescheduled: true } : a)),
        ),
      updateStatus: (assignmentId, status) => setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, status } : a))),
      setApproval: (assignmentId, approvalStatus, note) =>
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === assignmentId
              ? { ...a, approvalStatus, approvalNote: note, paymentStatus: approvalStatus === 'approved' ? 'released' : 'in-review' }
              : a,
          ),
        ),
      markPaymentStatus: (assignmentId, paymentStatus) =>
        setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, paymentStatus } : a))),
      removeFromUnassigned: (clientId) => setUnassignedClientIds((prev) => prev.filter((id) => id !== clientId)),
      addToUnassigned: (clientId) => setUnassignedClientIds((prev) => (prev.includes(clientId) ? prev : [...prev, clientId])),
      resetToDefaults: () => {
        setAssignments(seedAssignments);
        setUnassignedClientIds(seedUnassigned);
      },
    }),
    [assignments, unassignedClientIds],
  );

  return <AssignmentStoreContext.Provider value={value}>{children}</AssignmentStoreContext.Provider>;
}

export function useAssignmentStore() {
  const ctx = useContext(AssignmentStoreContext);
  if (!ctx) throw new Error('useAssignmentStore must be used within AssignmentStoreProvider');
  return ctx;
}
