import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type PasswordStrength = 'Muito Fraca' | 'Fraca' | 'Média' | 'Forte';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (password: string): PasswordStrength => {
    if (password.length < 6) return 'Muito Fraca';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthPoints = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChars,
      password.length >= 8
    ].filter(Boolean).length;

    if (strengthPoints <= 2) return 'Fraca';
    if (strengthPoints <= 3) return 'Média';
    return 'Forte';
  };

  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case 'Muito Fraca': return '#FF4444';
      case 'Fraca': return '#FFAA00';
      case 'Média': return '#FFD700';
      case 'Forte': return '#00C851';
      default: return '#CCCCCC';
    }
  };

  const getBarsCount = (strength: PasswordStrength) => {
    switch (strength) {
      case 'Muito Fraca': return 1;
      case 'Fraca': return 2;
      case 'Média': return 3;
      case 'Forte': return 4;
      default: return 0;
    }
  };

  const strength = calculateStrength(password);
  const color = getStrengthColor(strength);
  const barsCount = getBarsCount(strength);

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {[1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: index <= barsCount ? color : '#E0E0E0',
                width: `${100 / 4 - 2}%`,
              }
            ]}
          />
        ))}
      </View>
      {password.length > 0 && (
        <Text style={[styles.strengthText, { color }]}>
          Força: {strength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 4,
    marginBottom: 4,
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 