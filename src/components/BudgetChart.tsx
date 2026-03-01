import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

interface BudgetChartProps {
    income: number;
    totalExpenses: number;
    paidExpenses: number;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({ income, totalExpenses, paidExpenses }) => {
    const { colors } = useTheme();

    const size = 150;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const dynamicStyles = StyleSheet.create({
        centerTextContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            width: size,
            height: size,
        },
        centerPercent: {
            color: colors.text,
            fontSize: 28,
            fontWeight: '800',
        },
        centerSubText: {
            color: colors.textSecondary,
            fontSize: 14,
            fontWeight: '600',
            marginTop: -4,
        },
        centerTextRed: {
            color: colors.danger,
            fontSize: 18,
            fontWeight: '800',
            textAlign: 'center'
        },
    });

    if (income === 0 && totalExpenses === 0) {
        return (
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size}>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.border}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                </Svg>
                <View style={dynamicStyles.centerTextContainer}>
                    <Text style={dynamicStyles.centerPercent}>...</Text>
                </View>
            </View>
        );
    }

    const isOverBudget = totalExpenses > income && income > 0;

    if (isOverBudget) {
        return (
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size}>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.danger}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                </Svg>
                <View style={dynamicStyles.centerTextContainer}>
                    <Text style={dynamicStyles.centerTextRed}>Over</Text>
                    <Text style={dynamicStyles.centerTextRed}>Budget</Text>
                </View>
            </View>
        );
    }

    const total = Math.max(income, totalExpenses);
    const remainingIncome = Math.max(0, income - totalExpenses);
    const unpaidExpenses = Math.max(0, totalExpenses - paidExpenses);

    const greenRatio = remainingIncome / total;
    const lightOrangeRatio = unpaidExpenses / total;
    const darkOrangeRatio = paidExpenses / total;

    const greenLength = greenRatio * circumference;
    const lightOrangeLength = lightOrangeRatio * circumference;
    const darkOrangeLength = darkOrangeRatio * circumference;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.border}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {greenRatio > 0 && (
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.chartGreen}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={`${greenLength} ${circumference}`}
                        strokeDashoffset={0}
                    />
                )}

                {lightOrangeRatio > 0 && (
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.chartLightOrange}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={`${lightOrangeLength} ${circumference}`}
                        strokeDashoffset={-greenLength}
                    />
                )}

                {darkOrangeRatio > 0 && (
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.chartDarkOrange}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={`${darkOrangeLength} ${circumference}`}
                        strokeDashoffset={-(greenLength + lightOrangeLength)}
                    />
                )}
            </Svg>
            <View style={dynamicStyles.centerTextContainer}>
                <Text style={dynamicStyles.centerPercent}>
                    {Math.round(greenRatio * 100)}%
                </Text>
                <Text style={dynamicStyles.centerSubText}>Left</Text>
            </View>
        </View>
    );
};
