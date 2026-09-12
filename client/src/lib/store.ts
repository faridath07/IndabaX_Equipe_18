// ============================================================================
// Store — Gestion des signalements avec persistance localStorage
// ============================================================================
// Permet au MVP d'être réellement fonctionnel : les signalements soumis par
// les citoyens sont sauvegardés dans le navigateur et persistent entre sessions.
// ============================================================================

import type { Report, ReportStatus } from "../types";
import { generateDemoReports } from "./demo-data";

const STORAGE_KEY = "ecosia-user-reports";
const DEMO_KEY = "ecosia-demo-seeded";

/**
 * Charge les signalements utilisateur depuis localStorage.
 */
export function loadUserReports(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Report[];
  } catch {
    return [];
  }
}

/**
 * Sauvegarde les signalements utilisateur dans localStorage.
 */
export function saveUserReports(reports: Report[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error("Failed to save reports:", e);
  }
}

/**
 * Ajoute un nouveau signalement utilisateur.
 */
export function addUserReport(report: Report): void {
  const reports = loadUserReports();
  reports.unshift(report);
  saveUserReports(reports);
}

/**
 * Supprime un signalement utilisateur par ID.
 */
export function deleteUserReport(id: string): void {
  const reports = loadUserReports().filter((r) => r.id !== id);
  saveUserReports(reports);
}

/**
 * Met à jour le statut d'un signalement utilisateur.
 */
export function updateReportStatus(id: string, status: ReportStatus): void {
  const reports = loadUserReports().map((r) =>
    r.id === id ? { ...r, status } : r
  );
  saveUserReports(reports);
}

/**
 * Retourne tous les signalements : démo + utilisateur.
 * Les signalements utilisateur sont marqués source: "citizen".
 */
export function getAllReports(): Report[] {
  const demo = generateDemoReports();
  const user = loadUserReports();
  return [...user, ...demo];
}

/**
 * Retourne uniquement les signalements soumis par l'utilisateur.
 */
export function getUserReports(): Report[] {
  return loadUserReports();
}

/**
 * Exporte toutes les données (démo + utilisateur) en JSON.
 */
export function exportAllData(): string {
  const data = {
    exportedAt: new Date().toISOString(),
    userReports: loadUserReports(),
    demoReports: generateDemoReports(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Importe des signalements depuis un JSON.
 */
export function importUserReports(json: string): { success: number; error?: string } {
  try {
    const parsed = JSON.parse(json);
    const reports: Report[] = Array.isArray(parsed) ? parsed : parsed.userReports || [];
    if (!Array.isArray(reports)) return { success: 0, error: "Format invalide" };
    // Valider chaque signalement
    const valid = reports.filter((r) => r.id && r.type && r.location && r.date);
    const existing = loadUserReports();
    const existingIds = new Set(existing.map((r) => r.id));
    const toAdd = valid.filter((r) => !existingIds.has(r.id));
    saveUserReports([...toAdd, ...existing]);
    return { success: toAdd.length };
  } catch (e) {
    return { success: 0, error: "JSON invalide" };
  }
}

/**
 * Efface tous les signalements utilisateur.
 */
export function clearUserReports(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Génère un ID unique pour un nouveau signalement.
 */
export function generateReportId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EC-${ts}-${rand}`;
}
