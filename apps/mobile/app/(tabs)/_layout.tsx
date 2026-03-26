import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Tabs } from "expo-router";

// Class-based error boundary — catches any JS crash in tabs and shows it instead of blank screen
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={eb.container}>
          <Text style={eb.emoji}>⚠️</Text>
          <Text style={eb.title}>Something went wrong</Text>
          <Text style={eb.msg}>{this.state.error.message}</Text>
          <Pressable style={eb.btn} onPress={() => this.setState({ error: null })}>
            <Text style={eb.btnText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const eb = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff0f3", alignItems: "center", justifyContent: "center", padding: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#b91c1c", marginBottom: 8 },
  msg: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 },
  btn: { backgroundColor: "#ff2d6a", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
});

function TabIcon({ emoji, active }: { emoji: string; active: boolean }) {
  return (
    <View style={{ opacity: active ? 1 : 0.5 }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "white",
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            height: 70,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#ff2d6a",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <TabIcon emoji="🏠" active={color === "#ff2d6a"} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => <TabIcon emoji="🗺️" active={color === "#ff2d6a"} />,
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: "Rewards",
            tabBarIcon: ({ color }) => <TabIcon emoji="🏆" active={color === "#ff2d6a"} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <TabIcon emoji="👤" active={color === "#ff2d6a"} />,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}
