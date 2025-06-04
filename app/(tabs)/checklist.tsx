import Scroller from "@/components/Scroller";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Goal } from "@/types/goal";
import { AntDesign } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoalsContext } from "../_layout";
import { useGroups } from "../context/GroupsContext";

function getGroupCompletionStats(goals: Goal[]) {
  const totalGoals = goals.filter(goal => goal.category !== "Avoid Goal").length;
  const completedGoals = goals.filter(
    goal => goal.category !== "Avoid Goal" && goal.todayCompleted
  ).length;
  return {
    total: totalGoals,
    completed: completedGoals,
    isFullyCompleted: totalGoals > 0 && completedGoals === totalGoals
  };
}

function sortGoalsByCompletion(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    // For Avoid goals, use todayFailed instead of todayCompleted
    const aCompleted = a.category === "Avoid Goal" ? a.todayFailed : a.todayCompleted;
    const bCompleted = b.category === "Avoid Goal" ? b.todayFailed : b.todayCompleted;
    
    // Move completed/failed goals to the bottom
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    return 0;
  });
}

export default function Checklist() {
  const goalsContext = useContext(GoalsContext);
  const { groups, toggleGroup, setGroups } = useGroups();
  
  if (!goalsContext) return null;
  const { goals, setGoals } = goalsContext;

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const handleDeleteGroup = (groupId: string) => {
    setGroupToDelete(groupId);
    setDeleteModalVisible(true);
  };

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return;

    // Move all goals from the deleted group to ungrouped
    setGoals(goals.map(goal => 
      goal.groupId === groupToDelete 
        ? { ...goal, groupId: undefined }
        : goal
    ));

    // Remove the group
    setGroups(groups.filter(g => g.id !== groupToDelete));
    
    setDeleteModalVisible(false);
    setGroupToDelete(null);
  };

  const groupedGoals = goals.reduce((acc, goal) => {
    const groupId = goal.groupId || 'ungrouped';
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Sort goals within each group
  Object.keys(groupedGoals).forEach(groupId => {
    groupedGoals[groupId] = sortGoalsByCompletion(groupedGoals[groupId]);
  });

  // Get completion stats for ungrouped goals
  const ungroupedStats = getGroupCompletionStats(groupedGoals['ungrouped'] || []);

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
            <>
              {/* Ungrouped goals with completion ratio */}
              {groupedGoals['ungrouped']?.length > 0 && (
                <View style={styles.groupContainer}>
                  <View
                    style={[
                      styles.groupHeader,
                      ungroupedStats.isFullyCompleted && styles.completedGroupHeader
                    ]}
                  >
                    <Text style={styles.groupTitle}>Ungrouped</Text>
                    <Text style={styles.completionRatio}>
                      {ungroupedStats.completed}/{ungroupedStats.total}
                    </Text>
                  </View>
                  {groupedGoals['ungrouped'].map((goal, index) => (
                    <GoalItem
                      key={`ungrouped-${index}`}
                      goal={goal}
                      setGoals={setGoals}
                      deleteGoal={() => {
                        const updated = [...goals];
                        updated.splice(goals.indexOf(goal), 1);
                        setGoals(updated);
                      }}
                      goals={goals}
                    />
                  ))}
                </View>
              )}

              {/* Grouped goals with completion ratios */}
              {groups.map((group) => {
                const groupGoals = groupedGoals[group.id] || [];
                const stats = getGroupCompletionStats(groupGoals);
                
                return (
                  <View key={group.id} style={styles.groupContainer}>
                    <TouchableOpacity
                      style={[
                        styles.groupHeader,
                        stats.isFullyCompleted && styles.completedGroupHeader
                      ]}
                      onPress={() => toggleGroup(group.id)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={styles.groupTitle}>{group.name}</Text>
                        <Text style={styles.completionRatio}>
                          {stats.completed}/{stats.total}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                          onPress={() => handleDeleteGroup(group.id)}
                          style={styles.deleteButton}
                        >
                          <AntDesign name="delete" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                        <AntDesign
                          name={group.isExpanded ? "caretup" : "caretdown"}
                          size={16}
                          color="#666"
                          style={{ marginLeft: 8 }}
                        />
                      </View>
                    </TouchableOpacity>
                    {group.isExpanded && groupGoals.map((goal, index) => (
                      <GoalItem
                        key={`${group.id}-${index}`}
                        goal={goal}
                        setGoals={setGoals}
                        deleteGoal={() => {
                          const updated = [...goals];
                          updated.splice(goals.indexOf(goal), 1);
                          setGoals(updated);
                        }}
                        goals={goals}
                      />
                    ))}
                  </View>
                );
              })}
            </>
          ) : (
            <Text>No goals set yet.</Text>
          )}
        </Scroller>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDeleteModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalHeader}>Delete Group?</Text>
            <Text style={styles.modalText}>
              This will move all goals in this group to ungrouped. This action cannot be undone.
            </Text>
            <Pressable
              style={[styles.submitButton, { backgroundColor: '#FF6B6B' }]}
              onPress={confirmDeleteGroup}
            >
              <Text style={styles.submitText}>Delete Group</Text>
            </Pressable>
            <Pressable
              style={{ marginTop: 20 }}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
    setTempStreak(goal.currentStreak || 0);
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
  const { groups, addGroup } = useGroups();
  const [selectedCategory, setSelectedCategory] = useState<
    "Completion Goal" | "Time Goal" | "Avoid Goal" | "Project"
  >(editMode && goal ? goal.category : "Completion Goal");
  const [goalName, setGoalName] = useState(editMode && goal ? goal.name : "");
  const [timeGoal, setTimeGoal] = useState(
    editMode && goal && goal.timeGoal != null ? goal.timeGoal : 0
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    editMode && goal ? goal.groupId : undefined
  );
  const [newGroupName, setNewGroupName] = useState("");
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);

  useEffect(() => {
    if (editMode && goal) {
      setSelectedCategory(goal.category);
      setGoalName(goal.name);
      setTimeGoal(goal.timeGoal ?? 0);
      setSelectedGroupId(goal.groupId);
    }
  }, [editMode, goal]);

  const handleSubmit = async () => {
    let finalGroupId = selectedGroupId;

    // Handle new group creation first
    if (isAddingNewGroup && newGroupName.trim()) {
      try {
        finalGroupId = await addGroup(newGroupName.trim());
      } catch (error) {
        console.error('Error creating new group:', error);
        return;
      }
    }

    // Create or update the goal with the correct group ID
    if (editMode && goal && goals && setGoals) {
      const updatedGoals = goals.map((g) =>
        g.name === goal.name && g.category === goal.category
          ? {
              ...g,
              name: goalName.trim(),
              category: selectedCategory,
              timeGoal: selectedCategory === "Time Goal" ? timeGoal : undefined,
              groupId: finalGroupId,
            }
          : g
      );
      setGoals(updatedGoals);
    } else if (setGoals) {
      const newGoal: Goal = {
        name: goalName.trim(),
        category: selectedCategory,
        timeGoal: selectedCategory === "Time Goal" ? timeGoal : undefined,
        groupId: finalGroupId,
      };
      setGoals([...(goals || []), newGoal]);
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
          style={{ color: 'white' }}
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
        placeholderTextColor="#999"
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
            placeholderTextColor="#999"
          />
        </>
      )}

      <View style={styles.groupSection}>
        <Text style={styles.modalText}>Assign to Group</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedGroupId}
            onValueChange={(itemValue) => {
              setSelectedGroupId(itemValue);
              setIsAddingNewGroup(itemValue === "new");
            }}
            style={{ color: 'white' }}
          >
            <Picker.Item label="No Group" value={undefined} />
            {groups.map((group) => (
              <Picker.Item key={group.id} label={group.name} value={group.id} />
            ))}
            <Picker.Item label="+ Create New Group" value="new" />
          </Picker>
        </View>

        {isAddingNewGroup && (
          <TextInput
            placeholder="Enter new group name"
            value={newGroupName}
            onChangeText={setNewGroupName}
            style={styles.textInput}
            placeholderTextColor="#999"
          />
        )}
      </View>

      <Pressable
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={!goalName.trim() || (isAddingNewGroup && !newGroupName.trim())}
      >
        <Text style={styles.submitText}>Submit</Text>
      </Pressable>
      <Pressable
        style={{ marginTop: 20 }}
        onPress={() => setModalVisible(false)}
      >
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
    backgroundColor: "#112D4E",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginBottom: 15,
    fontSize: 18,
    color: "white",
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
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
    color: "white",
  },
  textInput: {
    width: 260,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    color: "white",
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
  groupContainer: {
    marginVertical: 8,
    width: "100%",
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#3F72AF",
    borderRadius: 8,
    marginBottom: 8,
  },
  completedGroupHeader: {
    backgroundColor: "#9DC08B",
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginRight: 8,
  },
  completionRatio: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.9,
  },
  groupSection: {
    width: "100%",
    marginBottom: 20,
  },
  deleteButton: {
    padding: 4,
  },
});
