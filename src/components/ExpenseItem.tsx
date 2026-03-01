import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Expense } from '../store/storage';

interface ExpenseItemProps {
    expense: Expense;
    onTogglePaid: (id: string, isPaid: boolean) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onTogglePaid }) => {
    const { colors, isDark } = useTheme();

    const dynamicStyles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.card,
            padding: 20,
            borderRadius: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
        },
        name: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        amount: {
            color: colors.textSecondary,
            fontSize: 16,
            fontWeight: '700',
        },
        checkbox: {
            width: 28,
            height: 28,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: colors.border,
            backgroundColor: colors.checkboxBg,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
    });

    return (
        <View style={dynamicStyles.container}>
            <View style={styles.left}>
                <Text style={dynamicStyles.name}>{expense.name}</Text>
                <Text style={dynamicStyles.amount}>${typeof expense.amount === 'number' ? expense.amount.toFixed(2) : parseFloat(expense.amount).toFixed(2)}</Text>
            </View>
            <TouchableOpacity
                style={[dynamicStyles.checkbox, expense.isPaid && { borderColor: 'transparent' }]}
                onPress={() => onTogglePaid(expense.id, !expense.isPaid)}
                activeOpacity={0.7}
            >
                {expense.isPaid && (
                    <LinearGradient
                        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                        style={styles.checkboxGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <MaterialCommunityIcons name="check" size={18} color="#ffffff" />
                    </LinearGradient>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    left: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        marginRight: 16,
    },
    checkboxGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
