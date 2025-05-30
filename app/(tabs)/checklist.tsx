import Scroller from "@/components/Scroller";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Goal } from "@/types/goal";
import { AntDesign } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useContext, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoalsContext } from "../_layout";

export default function Checklist() {
  const goalsContext = useContext(GoalsContext);
  if (!goalsContext) return null;
  const { goals, setGoals } = goalsContext;

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ThemedView
      style={{
        flex: 1,
        padding: 16,
        alignItems: "center",
      }}
    >
      <ThemedText type="title">Daily Goals</ThemedText>

      <View style={{ flex: 1, width: "100%" }}>
        <Scroller>
          {goals.length > 0 ? (
            goals.map((goal, index) => (
              <GoalItem
                key={index}
                goal={goal}
                setGoals={setGoals}
                deleteGoal={() => {
                  const updated = [...goals];
                  updated.splice(index, 1);
                  setGoals(updated);
                }}
                goals={goals}
              />
            ))
          ) : (
            <Text>No goals set yet.</Text>
          )}
        </Scroller>
      </View>
      <ModalContent
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        goals={goals}
        setGoals={setGoals}
      />
      <AddButton onPress={() => setModalVisible(true)} />
    </ThemedView>
  );
}

function AddButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={styles.fab} onPress={() => onPress && onPress()}>
      <AntDesign name="pluscircle" size={60} color="#FF2E63" />
    </Pressable>
  );
}

function GoalItem({
  goal,
  setGoals,
  deleteGoal,
  goals,
}: {
  goal: Goal;
  setGoals?: React.Dispatch<React.SetStateAction<Goal[]>>;
  deleteGoal?: () => void;
  goals?: Goal[];
}) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [completed, setCompleted] = useState(goal.todayCompleted || false);
  const [failed, setFailed] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [tempStreak, setTempStreak] = useState(goal.currentStreak || 0);

  const backgroundColor = completed
    ? "#9DC08B"
    : failed
    ? "#C06C84"
    : {
        "Completion Goal": "#E6F7FF",
        "Time Goal": "#FFF4E6",
        "Avoid Goal": "#FFE6E6",
        Project: "#95E1D3",
      }[goal.category] || "#EEE";

  useEffect(() => {
    setCompleted(goal.todayCompleted || false);
    setFailed(goal.todayFailed || false);
    if (goal.todayCompleted) {
      setTempStreak((goal.currentStreak ?? 0) + 1);
    }
    if (goal.todayFailed) {
      setTempStreak(0);
    }
  }, [goal]);

  const handleCompletionToggle = () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    if (setGoals) {
      setGoals((prevGoals) =>
        prevGoals.map((g) =>
          g.name === goal.name && g.category === goal.category
            ? { ...g, todayCompleted: newCompleted }
            : g
        )
      );
    }
  };

  const handleFailedToggle = () => {
    const newFailed = !failed;
    setFailed(newFailed);
    if (setGoals) {
      setGoals((prevGoals) =>
        prevGoals.map((g) =>
          g.name === goal.name && g.category === goal.category
            ? { ...g, todayFailed: newFailed }
            : g
        )
      );
    }
  };

  return (
    <>
      <View
        style={{
          marginVertical: 8,
          padding: 16,
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "#ccc",
          backgroundColor,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {goal.category === "Completion Goal" && (
            <Pressable
              onPress={handleCompletionToggle}
              style={{
                width: 24,
                height: 24,
                borderWidth: 2,
                borderColor: "#333",
                borderRadius: 4,
                marginRight: 12,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: completed ? "#28a745" : "white",
              }}
            >
              {completed && <AntDesign name="check" size={16} color="white" />}
            </Pressable>
          )}
          {goal.category === "Avoid Goal" && (
            <Pressable
              onPress={handleFailedToggle}
              style={{
                width: 24,
                height: 24,
                borderWidth: 2,
                borderColor: "#b22222",
                borderRadius: 4,
                marginRight: 12,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: failed ? "#dc3545" : "white",
              }}
            >
              {failed && <AntDesign name="close" size={16} color="white" />}
            </Pressable>
          )}
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {goal.name}
            </Text>
            {goal.timeGoal != null ? (
              <Text style={{ color: "#666" }}>
                Time Goal: {goal.timeGoal} minutes
              </Text>
            ) : (
              <Text style={{ color: "#444" }}>{goal.category}</Text>
            )}
            <Text style={{ color: "#ff6600", marginTop: 4 }}>
              🔥 Streak: {tempStreak ?? 0}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => setEditVisible(true)}
            style={{ marginRight: 10 }}
          >
            <AntDesign name="edit" size={24} color="#555" />
          </Pressable>
          <Pressable onPress={() => setConfirmVisible(true)}>
            <AntDesign name="delete" size={24} color="red" />
          </Pressable>
        </View>
      </View>
      <Modal
        transparent={true}
        visible={confirmVisible}
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setConfirmVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalHeader}>Delete Goal?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this goal?
            </Text>
            <Pressable
              style={styles.submitButton}
              onPress={() => {
                setConfirmVisible(false);
                deleteGoal?.();
              }}
            >
              <Text style={styles.submitText}>Yes, Delete</Text>
            </Pressable>
            <Pressable onPress={() => setConfirmVisible(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={editVisible}
        onRequestClose={() => setEditVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <ModalForm
              editMode
              goal={goal}
              setModalVisible={setEditVisible}
              goals={goals}
              setGoals={setGoals}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function ModalContent({
  modalVisible,
  setModalVisible,
  goals,
  setGoals,
}: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  goals?: Goal[];
  setGoals?: (goals: Goal[]) => void;
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
      onDismiss={() => setModalVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <ModalForm
            setModalVisible={setModalVisible}
            goals={goals}
            setGoals={setGoals}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ModalForm({
  setModalVisible,
  goals,
  setGoals,
  goal,
  editMode,
}: {
  setModalVisible: (visible: boolean) => void;
  goals?: Goal[];
  setGoals?: (goals: Goal[]) => void;
  goal?: Goal;
  editMode?: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState<
    "Completion Goal" | "Time Goal" | "Avoid Goal" | "Project"
  >(editMode && goal ? goal.category : "Completion Goal");
  const [goalName, setGoalName] = useState(editMode && goal ? goal.name : "");
  const [timeGoal, setTimeGoal] = useState(
    editMode && goal && goal.timeGoal != null ? goal.timeGoal : 0
  );

  useEffect(() => {
    if (editMode && goal) {
      setSelectedCategory(goal.category);
      setGoalName(goal.name);
      setTimeGoal(goal.timeGoal ?? 0);
    }
  }, [editMode, goal]);

  const handleSubmit = () => {
    if (editMode && goal && goals && setGoals) {
      const updatedGoals = goals.map((g) =>
        g.name === goal.name && g.category === goal.category
          ? {
              ...g,
              name: goalName.trim(),
              category: selectedCategory,
              timeGoal: selectedCategory === "Time Goal" ? timeGoal : undefined,
            }
          : g
      );
      setGoals(updatedGoals);
    } else {
      const newGoal: Goal = {
        name: goalName.trim(),
        category: selectedCategory,
        timeGoal: selectedCategory === "Time Goal" ? timeGoal : undefined,
      };
      if (setGoals) {
        setGoals([...(goals || []), newGoal]);
      }
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.modalContent}>
      <Text style={styles.modalHeader}>
        {editMode ? "Edit Goal" : "Add Goal"}
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        >
          <Picker.Item label="Completion Goal" value="Completion Goal" />
          <Picker.Item label="Time Goal" value="Time Goal" />
          <Picker.Item label="Avoid Goal" value="Avoid Goal" />
          <Picker.Item label="Project" value="Project" />
        </Picker>
      </View>
      <TextInput
        placeholder="Enter goal name"
        value={goalName}
        onChangeText={setGoalName}
        style={styles.textInput}
        multiline={false}
        numberOfLines={1}
      />
      {selectedCategory === "Time Goal" && (
        <>
          <Text style={styles.modalText}>
            Set a time goal (e.g., 30 minutes)
          </Text>
          <TextInput
            placeholder="Enter time in minutes"
            keyboardType="numeric"
            style={styles.textInput}
            onChangeText={(text) => {
              const value = parseInt(text, 10);
              setTimeGoal(isNaN(value) ? 0 : value);
            }}
            value={timeGoal ? timeGoal.toString() : ""}
          />
        </>
      )}
      <Pressable
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={!goalName.trim()}
      >
        <Text style={styles.submitText}>Submit</Text>
      </Pressable>
      <Pressable onPress={() => setModalVisible(false)}>
        <Text style={styles.closeText}>Close</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginBottom: 15,
    fontSize: 18,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  closeText: {
    color: "blue",
    fontSize: 16,
  },
  pickerContainer: {
    // backgroundColor: "#f0f0f0",
    borderRadius: 10,
    width: 260,
    height: 100,
    justifyContent: "center",
    marginBottom: 50,
  },
  textInput: {
    width: 260,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
