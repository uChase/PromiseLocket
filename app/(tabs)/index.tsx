import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  cancelAllNotifications,
  createAndStoreNotification,
} from "@/helpers/NotificationPlanner";
import { useContext, useEffect, useState } from "react";
import { Dimensions, Image, View } from "react-native";
import { GoalsContext } from "../_layout";

const { width, height } = Dimensions.get("window");

export default function Home() {
  const goalsContext = useContext(GoalsContext);
  const { goals, setGoals } = goalsContext || { goals: [], setGoals: () => {} };
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [totalStreak, setTotalStreak] = useState(0);
  const [numGoalsToComplete, setNumGoalsToComplete] = useState(0);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function setUpNotifs(num: number) {
      await cancelAllNotifications();
      if (num !== 0) {
        const secondsUntilNoon = getSecondsUntilTime(12, 0, 0);
        const secondsUntilSix = getSecondsUntilTime(18, 0, 0);
        if (secondsUntilNoon !== -1) {
          await createAndStoreNotification(
            secondsUntilNoon,
            "Goal Reminder",
            `You have ${num} to complete today! Keep going!`
          );
        }
        if (secondsUntilSix !== -1) {
          await createAndStoreNotification(
            secondsUntilSix,
            "Goal Reminder",
            `You have ${num} to complete today! Keep going!`
          );
        }
      }
    }

    let tempTotalCompleted = 0;
    let tempTotalFailed = 0;
    let leastStreak = 0;
    let tempNumGoalsToComplete = 0;
    for (const goal of goals) {
      if (goal.todayCompleted) {
        tempTotalCompleted += 1;
      } else if (goal.todayFailed) {
        tempTotalFailed += 1;
      } else if (goal.category !== "Avoid Goal") {
        tempNumGoalsToComplete += 1;
      }
      if (goal.currentStreak) {
        leastStreak =
          leastStreak === 0
            ? goal.currentStreak
            : Math.min(leastStreak, goal.currentStreak);
      }
    }
    setTotalCompleted(tempTotalCompleted);
    setTotalFailed(tempTotalFailed);
    setTotalStreak(leastStreak);
    setNumGoalsToComplete(tempNumGoalsToComplete);

    setUpNotifs(tempNumGoalsToComplete);
  }, [goals]);

  return (
    <ThemedView
      style={{
        flex: 1,
        // justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedText
        type="title"
        style={
          numGoalsToComplete !== 0
            ? {
                marginTop: 30,
                marginBottom: 30,
                color: "#FFD700",
                fontSize: 40,
                lineHeight: 50,
              }
            : {
                marginTop: 30,
                marginBottom: 30,
                color: "#00FFDE",
                fontSize: 40,
                lineHeight: 50,
              }
        }
      >
        {numGoalsToComplete === 0 ? "Good Job!" : timeLeft}
      </ThemedText>
      <View style={{ width: width, height: height * 0.35, marginBottom: 20 }}>
        <Image
          source={require("@/assets/heartbeat.gif")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
      <ThemedText
        type="title"
        style={{
          marginBottom: 30,
          fontWeight: "bold",
          fontSize: 36,
          lineHeight: 40,
          color: "#00CAFF",
        }}
      >
        Keep Your Promises
      </ThemedText>
      <ThemedText
        type="subtitle"
        style={{ marginBottom: 10, color: "#00CAFF" }}
      >
        {numGoalsToComplete} Goals Left
      </ThemedText>
      <ThemedText
        type="subtitle"
        style={{ marginBottom: 10, color: "#00FFDE" }}
      >
        {totalCompleted} Completed
      </ThemedText>
      <ThemedText
        type="subtitle"
        style={{ marginBottom: 10, color: "#E55050" }}
      >
        {totalFailed} Failed
      </ThemedText>
      <ThemedText
        type="subtitle"
        style={{ marginBottom: 10, color: "#F97A00" }}
      >
        Total Streak: {totalStreak} 🔥
      </ThemedText>
    </ThemedView>
  );
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // set to next midnight
  const diff = midnight.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function getSecondsUntilTime(
  targetHour: number,
  targetMinute = 0,
  targetSecond = 0
): number {
  const now = new Date();
  const target = new Date(now);

  target.setHours(targetHour, targetMinute, targetSecond, 0);

  // If the target time has already passed today, move to tomorrow
  if (target.getTime() <= now.getTime()) {
    return -1;
  }

  const diffMilliseconds = target.getTime() - now.getTime();
  return Math.floor(diffMilliseconds / 1000);
}
