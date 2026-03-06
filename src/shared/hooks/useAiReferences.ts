/**
 * useAiReferences — Shared AI Reference Context Store
 *
 * Provides a per-session (in-memory) store of EntityReference chips.
 * Any feature component can add/remove references without prop drilling.
 *
 * Usage (producer):
 *   const { addReference } = useAiReferences();
 *   addReference({ entityType: 'job', entityId: job.id, label: job.title, source: 'ats.jobs.table' });
 *
 * Usage (consumer — sidebar):
 *   const { references, removeReference, clearReferences } = useAiReferences();
 */

import { create } from 'zustand';
import { EntityReference } from '@/shared/types/ai-references';

interface AiReferencesState {
    references: EntityReference[];
    addReference: (ref: EntityReference) => void;
    removeReference: (entityType: string, entityId: string) => void;
    setReferences: (refs: EntityReference[]) => void;
    clearReferences: () => void;
    getReferences: () => EntityReference[];
}

const useAiReferencesStore = create<AiReferencesState>((set, get) => ({
    references: [],

    addReference: (ref: EntityReference) => {
        set((state) => {
            // Deduplicate by entityType + entityId
            const exists = state.references.some(
                (r) => r.entityType === ref.entityType && r.entityId === ref.entityId
            );
            if (exists) return state;
            return { references: [...state.references, ref] };
        });
    },

    removeReference: (entityType: string, entityId: string) => {
        set((state) => ({
            references: state.references.filter(
                (r) => !(r.entityType === entityType && r.entityId === entityId)
            ),
        }));
    },

    setReferences: (refs: EntityReference[]) => {
        set({ references: refs });
    },

    clearReferences: () => {
        set({ references: [] });
    },

    getReferences: () => get().references,
}));

/**
 * Primary hook — use this in any component that needs to read or write AI references.
 */
export function useAiReferences() {
    return useAiReferencesStore();
}

/**
 * Minimal helper for producer components to attach a single reference.
 * Equivalent to calling addReference from the hook, but can be called
 * outside of React components (e.g. from utility functions).
 */
export function publishAiReference(ref: EntityReference): void {
    useAiReferencesStore.getState().addReference(ref);
}
