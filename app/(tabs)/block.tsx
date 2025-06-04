import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useContext } from "react";
import { Pressable } from "react-native";
import { GoalsContext } from "../_layout";
import { useGroups } from "../context/GroupsContext";


export default function Block() {

  const goalsContext = useContext(GoalsContext);
  const { groups, toggleGroup, setGroups } = useGroups();
  
  if (!goalsContext) return null;
  const { goals, setGoals } = goalsContext;


  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Pressable onPress={() => {
          setGoals([]);
          setGroups([]);
        }}>
          <ThemedText>
     Delete All Goals and Groups
     </ThemedText>
      </Pressable>
    </ThemedView>
  );
}
