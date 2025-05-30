import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { GoalsContext } from "../_layout";

export default function TabLayout() {
  return (
    <GoalsContext.Consumer>
      {(value) => (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#950101",
              borderTopWidth: 0,
            },
            tabBarActiveTintColor: "#ffffff",
          }}
          initialRouteName="index"
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="checklist"
            options={{
              title: "Checklist",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="checkbox" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="work"
            options={{
              title: "Work",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="document-text" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="block"
            options={{
              title: "Block",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="close-circle" color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      )}
    </GoalsContext.Consumer>
  );
}
