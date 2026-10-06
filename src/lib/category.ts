// Display terminology: Push (produktivitas) & Pause (recovery).
// Nilai yang tersimpan di Firestore TETAP "hustle" / "humble" (lihat DATABASE.md)
// — file ini hanya memetakan nilai DB ke label UI agar copy konsisten.

export type TaskCategoryDb = "hustle" | "humble";

export const CATEGORY_LABEL: Record<TaskCategoryDb, string> = {
  hustle: "Push",
  humble: "Pause",
};

export const CATEGORY_LABEL_UPPER: Record<TaskCategoryDb, string> = {
  hustle: "PUSH",
  humble: "PAUSE",
};

export function categoryLabel(category: string): string {
  if (category === "hustle") return "Push";
  if (category === "humble") return "Pause";
  return category;
}
