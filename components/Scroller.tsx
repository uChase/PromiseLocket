import React from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";

interface ScrollerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

const Scroller: React.FC<ScrollerProps> = ({
  children,
  style,
  contentContainerStyle,
}) => {
  return (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});

export default Scroller;
