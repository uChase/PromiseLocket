import { useStoredVal } from "@/hooks/useStoredVal";
import { requestPermission } from "@/modules/NotificationManager";
import { Goal } from "@/types/goal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import React, { createContext, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { GroupsProvider } from './context/GroupsContext';

export const GoalsContext = createContext<{
  goals: Goal[];
  setGoals: (goals: Goal[] | ((prev: Goal[]) => Goal[])) => void;
} | null>(null);

export default function RootLayout() {
  const [goals, setGoals] = useStoredVal<Goal[]>("goals", []);
  const [
    hasRequestedNotificationPermission,
    setHasRequestedNotificationPermission,
  ] = useStoredVal<boolean>("hasRequestedNotificationPermission", false);
  const goalsRef = useRef(goals);
  useEffect(() => {
    goalsRef.current = goals;
  }, [goals]);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (!hasRequestedNotificationPermission) {
        setHasRequestedNotificationPermission(true);
      }
    };

    requestPermission();
  }, [
    hasRequestedNotificationPermission,
    setHasRequestedNotificationPermission,
  ]);

  const resetGoalsIfNeeded = async () => {
    const now = new Date();
    const todayStr = now.toDateString();
    const lastReset = await AsyncStorage.getItem("lastResetDate");

    const currentGoals = goalsRef.current;
    if (!currentGoals || currentGoals.length === 0) return;

    if (lastReset !== todayStr) {
      const updatedGoals = currentGoals.map((goal) => {
        const isAvoidGoal = goal.category === "Avoid Goal";
        const shouldIncrement = isAvoidGoal
          ? goal.todayFailed === false
          : goal.todayCompleted === true;
        const shouldReset = isAvoidGoal
          ? goal.todayFailed === true
          : goal.todayCompleted === false;

        return {
          ...goal,
          todayCompleted: false,
          todayFailed: false,
          currentStreak: shouldIncrement
            ? (goal.currentStreak ?? 0) + 1
            : shouldReset
            ? 0
            : goal.currentStreak ?? 0,
        };
      });
      setGoals(updatedGoals);
      await AsyncStorage.setItem("lastResetDate", todayStr);
    }
  };

  useEffect(() => {
    const runInitialResetCheck = () => {
      resetGoalsIfNeeded();
    };

    const scheduleMidnightReset = async () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const delay = nextMidnight.getTime() - now.getTime();

      setTimeout(async () => {
        await resetGoalsIfNeeded();
        scheduleMidnightReset();
      }, delay);
    };

    runInitialResetCheck();
    scheduleMidnightReset();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        resetGoalsIfNeeded();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <GoalsContext.Provider value={{ goals, setGoals }}>
      <GroupsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
        </Stack>
      </GroupsProvider>
    </GoalsContext.Provider>
  );
}
