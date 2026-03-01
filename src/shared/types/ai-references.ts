/**
 * AI Reference Context Framework — Shared Types
 *
 * One typed contract for all entity references across the app.
 * Frontend sends EntityReference[] → backend resolves to authoritative data.
 */

export type EntityReferenceType =
    | 'job'
    | 'candidate'
    | 'company'
    | 'application'
    | 'consultant'
    | 'custom';

/**
 * A lightweight reference token produced by any feature component.
 * Only contains IDs/hints — backend resolves the authoritative record.
 */
export interface EntityReference {
    /** What kind of entity this token points to */
    entityType: EntityReferenceType;
    /** Primary identifier for the entity */
    entityId: string;
    /** Human-readable display label shown as a chip in the composer */
    label: string;
    /** Source surface that produced this reference (e.g. 'ats.jobs.table') */
    source: string;
    /**
     * Optional lightweight, non-sensitive hints.
     * These are informational only; the backend performs authoritative resolution.
     */
    meta?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * The context payload included in every assistant request when references exist.
 */
export interface AssistantContextPayload {
    references: EntityReference[];
}
