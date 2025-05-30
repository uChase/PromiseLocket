import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  endTimer,
  getTimerState,
  puaseTimer,
  resumeTimer,
  startTimer,
} from "@/modules/MyTimer";
import React, { useContext, useEffect, useState } from "react";
import { AppState, Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { GoalsContext } from "../_layout";

export default function Work() {
  const goalsContext = useContext(GoalsContext);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [doingGoal, setDoingGoal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const timeGoals = goalsContext?.goals.filter(
    (g) => g.category === "Time Goal" && g.timeGoal
  );

  const radius = 120;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = (secondsLeft / (selectedMinutes * 60)) * 100;

  const [activityId, setActivityId] = useState<string | null>(null);

  const handleStart = async () => {
    try {
      const id = await startTimer(secondsLeft);
      setActivityId(id);
      setIsRunning(true);
    } catch (err) {
      console.error("Start error:", err);
    }
  };

  const handlePause = () => {
    if (activityId) {
      puaseTimer(activityId);
      setIsPaused(true);
      console.log("Paused activity:", activityId);
    }
  };

  const handleResume = () => {
    if (activityId) {
      resumeTimer(activityId);
      setIsPaused(false);
      console.log("Resumed activity:", activityId);
    }
  };

  const handleEnd = () => {
    if (activityId) {
      endTimer(activityId);
      console.log("Ended activity:", activityId);
      setActivityId(null);
      setIsRunning(false);
      setIsPaused(false);
      setSecondsLeft(selectedMinutes * 60);
      setDoingGoal(false);
      setSelectedGoalId(null);
    }
  };

  const handleFinish = () => {
    if (activityId) {
      endTimer(activityId);
      console.log("Finished activity:", activityId);
      setActivityId(null);
      setIsRunning(false);
      setIsPaused(false);
      setSecondsLeft(selectedMinutes * 60);
      setDoingGoal(false);
      setSelectedGoalId(null);
      setIsFinished(false);
      if (selectedGoalId != null && goalsContext?.setGoals) {
        goalsContext.setGoals((prevGoals) =>
          prevGoals.map((g) =>
            g.name === selectedGoalId ? { ...g, todayCompleted: true } : g
          )
        );
      }
    }
  };

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFinished(true);
          if (doingGoal && selectedGoalId != null && goalsContext?.setGoals) {
            goalsContext.setGoals((prevGoals) =>
              prevGoals.map((g) =>
                g.name === selectedGoalId ? { ...g, todayCompleted: true } : g
              )
            );
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "active") {
          try {
            const result = await getTimerState();
            setSecondsLeft(result.seconds);
            setIsPaused(result.isPaused);
            setActivityId(result.activityId || null);
            setIsRunning(result.activityId ? true : false);
          } catch (err) {
            console.error("Error fetching timer state on resume:", err);
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ThemedView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {!isRunning ? (
        <>
          <ThemedText type="title" style={{ marginBottom: 50 }}>
            Timer
          </ThemedText>
          <ThemedText type="subtitle" style={{ marginBottom: 30 }}>
            Set your work duration in minutes:
          </ThemedText>
          <TextInput
            keyboardType="numeric"
            placeholder="Minutes"
            value={String(selectedMinutes)}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              setSelectedMinutes(isNaN(num) ? 0 : num);
              setSecondsLeft(isNaN(num) ? 0 : num * 60);
              setSelectedGoalId(null);
              setDoingGoal(false);
            }}
            style={{
              fontSize: 18,
              padding: 10,
              width: 120,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              textAlign: "center",
              backgroundColor: "#f9f9f9",
            }}
          />
          {timeGoals && timeGoals.length > 0 && (
            <>
              <ThemedText type="subtitle" style={{ marginTop: 20 }}>
                Or choose a Time Goal:
              </ThemedText>
              {timeGoals.map((goal, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    setSelectedGoalId(goal.name);
                    setSelectedMinutes(goal.timeGoal ?? 0);
                    setSecondsLeft((goal.timeGoal ?? 0) * 60);
                    setDoingGoal(true);
                  }}
                  style={{
                    padding: 10,
                    marginVertical: 4,
                    backgroundColor:
                      selectedGoalId === goal.name ? "#4CAF50" : "#ccc",
                    borderRadius: 8,
                    width: 200,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white" }}>{goal.name}</Text>
                </Pressable>
              ))}
            </>
          )}
          <Text
            onPress={handleStart}
            style={{
              fontSize: 18,
              marginTop: 20,
              padding: 10,
              backgroundColor: "#4CAF50",
              color: "white",
              borderRadius: 8,
            }}
          >
            Start
          </Text>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ThemedText type="title" style={{ top: 60 }}>
            {doingGoal ? `Working on: ${selectedGoalId}` : "Timer"}
          </ThemedText>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: radius * 2,
                width: radius * 2,
              }}
            >
              <Svg height={radius * 2} width={radius * 2}>
                <G rotation="-90" originX={radius} originY={radius}>
                  <Circle
                    stroke="#e6e6e6"
                    fill="none"
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    strokeWidth={strokeWidth}
                  />
                  <Circle
                    stroke="#4CAF50"
                    fill="none"
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference - (circumference * progress) / 100
                    }
                    strokeLinecap="round"
                  />
                </G>
              </Svg>
              <Text
                style={{
                  position: "absolute",
                  fontSize: 48,
                  fontWeight: "bold",
                  color: "#DBE2EF",
                }}
              >
                {String(Math.floor(secondsLeft / 3600) % 3600).padStart(1, "0")}
                :{String(Math.floor(secondsLeft / 60) % 60).padStart(2, "0")}:
                {String(secondsLeft % 60).padStart(2, "0")}
              </Text>
            </View>
            {!isFinished ? (
              <ThemedView
                style={{
                  position: "absolute",
                  bottom: 30,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={() => {
                    if (isPaused) {
                      handleResume();
                    } else {
                      handlePause();
                    }
                  }}
                  style={{
                    backgroundColor: "#f0ad4e",
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    marginHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "white" }}>
                    {isPaused ? "Resume" : "Pause"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleEnd}
                  style={{
                    backgroundColor: "#d9534f",
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    marginHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "white" }}>Stop</Text>
                </Pressable>
              </ThemedView>
            ) : (
              <ThemedView
                style={{
                  position: "absolute",
                  bottom: 30,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={handleFinish}
                  style={{
                    backgroundColor: "#4CAF50",
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, color: "white" }}>Finish</Text>
                </Pressable>
              </ThemedView>
            )}
          </View>
        </View>
      )}
    </ThemedView>
  );
}
