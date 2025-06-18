import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [tipoUserId, setTipoUserId] = useState<number | null>(null);
  const [clubeId, setClubeId] = useState<string | null>(null);
  const [activeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const loadUserData = async () => {
      const storedTipoUserId = await AsyncStorage.getItem("tipo_user_id");
      const storedClubeId = await AsyncStorage.getItem("clube_id");

      setTipoUserId(storedTipoUserId ? parseInt(storedTipoUserId) : null);
      setClubeId(storedClubeId);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    // Animate active state changes
    Animated.spring(activeAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [pathname]);

  const isProfileActive =
    pathname === "/player/profile" || pathname === "/coach/profile";
  const isFindTeamsActive = pathname === "/player/find-teams";

  const handleNavigation = (route: string) => {
    // Fade out current screen
    Animated.timing(activeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Navigate with animation
      router.push({
        pathname: route,
        params: { animation: "fade" },
      });
    });
  };

  const renderPlayerNavigation = () => {
    if (!clubeId) {
      return (
        <>
          <TouchableOpacity
            style={[
              styles.centerButton,
              isFindTeamsActive && styles.activeButton,
            ]}
            onPress={() => handleNavigation("/player/find-teams")}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                isFindTeamsActive && styles.activeIconContainer,
                {
                  transform: [
                    {
                      scale: activeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons
                name="search"
                size={24}
                color={isFindTeamsActive ? "#fff" : "#1a41aa"}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rightButton, isProfileActive && styles.activeButton]}
            onPress={() => handleNavigation("/player/profile")}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                isProfileActive && styles.activeIconContainer,
                {
                  transform: [
                    {
                      scale: activeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons
                name="person"
                size={24}
                color={isProfileActive ? "#fff" : "#1a41aa"}
              />
            </Animated.View>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <TouchableOpacity
          style={styles.leftButton}
          onPress={() => handleNavigation("/player/trainings")}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: activeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="fitness" size={24} color="#1a41aa" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => handleNavigation("/player/my-team")}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: activeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="people" size={24} color="#1a41aa" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rightButton, isProfileActive && styles.activeButton]}
          onPress={() => handleNavigation("/player/profile")}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              isProfileActive && styles.activeIconContainer,
              {
                transform: [
                  {
                    scale: activeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="person"
              size={24}
              color={isProfileActive ? "#fff" : "#1a41aa"}
            />
          </Animated.View>
        </TouchableOpacity>
      </>
    );
  };

  const renderCoachNavigation = () => {
    // Se o técnico não tem clube, não mostra navegação
    if (!clubeId) {
      return null;
    }

    const isMyTeamActive = pathname === "/coach/my-team";
    const isTrainingsActive = pathname === "/coach/trainings";

    return (
      <>
        <TouchableOpacity
          style={[styles.leftButton, isTrainingsActive && styles.activeButton]}
          onPress={() => handleNavigation("/coach/trainings")}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              isTrainingsActive && styles.activeIconContainer,
              {
                transform: [
                  {
                    scale: activeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="fitness"
              size={24}
              color={isTrainingsActive ? "#fff" : "#1a41aa"}
            />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.centerButton, isMyTeamActive && styles.activeButton]}
          onPress={() => handleNavigation("/coach/my-team")}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              isMyTeamActive && styles.activeIconContainer,
              {
                transform: [
                  {
                    scale: activeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="people"
              size={24}
              color={isMyTeamActive ? "#fff" : "#1a41aa"}
            />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rightButton, isProfileActive && styles.activeButton]}
          onPress={() => handleNavigation("/coach/profile")}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              isProfileActive && styles.activeIconContainer,
              {
                transform: [
                  {
                    scale: activeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons
              name="person"
              size={24}
              color={isProfileActive ? "#fff" : "#1a41aa"}
            />
          </Animated.View>
        </TouchableOpacity>
      </>
    );
  };

  // Para técnicos sem clube, não renderiza a navegação
  if (tipoUserId === 2 && !clubeId) {
    return null;
  }

  return (
    <View style={styles.container}>
      {tipoUserId === 1 && renderPlayerNavigation()}
      {tipoUserId === 2 && renderCoachNavigation()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 80,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  leftButton: {
    flex: 1,
    alignItems: "center",
  },
  centerButton: {
    flex: 1,
    alignItems: "center",
  },
  rightButton: {
    flex: 1,
    alignItems: "center",
  },
  activeButton: {
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconContainer: {
    backgroundColor: "#1a41aa",
    shadowColor: "#1a41aa",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
