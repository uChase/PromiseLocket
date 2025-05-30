export interface Goal {
  name: string;
  category: "Completion Goal" | "Time Goal" | "Avoid Goal" | "Project";
  timeGoal?: number;
  todayCompleted?: boolean;
  currentStreak?: number;
  longestStreak?: number;
  todayFailed?: boolean;
}
