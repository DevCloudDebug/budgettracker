import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Budget, saveBudget, getBudgets } from '../store/storage';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
    const { colors, isDark, currency } = useTheme();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        const data = await getBudgets();
        setBudgets(data);
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const createBudget = async () => {
        if (!newBudgetName.trim()) return;
        const newBudget = await saveBudget(newBudgetName.trim(), 0, []);
        await loadData();
        setModalVisible(false);
        setNewBudgetName('');
        navigation.navigate('Budget', { budgetId: newBudget.id });
    };

    const dynamicStyles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16
        },
        headerTitle: { color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
        listContent: { padding: 20, paddingBottom: 100 },
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 8, elevation: 4
        },
        cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
        budgetName: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.5, flex: 1 },
        cardStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
        statColumn: { flex: 1 },
        statLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
        statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -1 },
        progressBarContainer: { height: 6, backgroundColor: colors.checkboxBg, borderRadius: 3, marginTop: 16, overflow: 'hidden' },
        progressBarFill: { height: '100%', borderRadius: 3 },
        emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
        emptyStateText: { color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginTop: 16 },
        fab: {
            position: 'absolute', bottom: 32, right: 32, width: 64, height: 64, borderRadius: 32,
            backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
            shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8
        },
        modalOverlay: { flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
        modalContent: {
            backgroundColor: colors.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
            padding: 32, paddingBottom: 48,
        },
        modalTitle: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 24, letterSpacing: -0.5 },
        input: {
            backgroundColor: colors.checkboxBg, color: colors.text, borderRadius: 16,
            padding: 20, fontSize: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 24
        },
        modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
        button: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
        cancelButton: { backgroundColor: 'transparent', marginRight: 8, borderWidth: 1, borderColor: colors.border },
        primaryButton: { backgroundColor: colors.primary, marginLeft: 8 },
        buttonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
        buttonTextDark: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
    });

    const renderBudget = ({ item }: { item: Budget }) => {
        const totalExpenses = item.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const paidExpenses = item.expenses.filter(e => e.isPaid).reduce((sum, exp) => sum + exp.amount, 0);

        let progress = totalExpenses > 0 ? paidExpenses / totalExpenses : 0;
        let progressColor = colors.success;
        if (totalExpenses > item.income && item.income > 0) progressColor = colors.danger;
        else if (progress > 0.8) progressColor = colors.warning;

        return (
            <TouchableOpacity
                style={dynamicStyles.card}
                onPress={() => navigation.navigate('Budget', { budgetId: item.id })}
                activeOpacity={0.8}
            >
                <View style={dynamicStyles.cardHeader}>
                    <Text style={dynamicStyles.budgetName} numberOfLines={1}>{item.name}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </View>

                <View style={dynamicStyles.cardStats}>
                    <View style={dynamicStyles.statColumn}>
                        <Text style={dynamicStyles.statLabel}>Income</Text>
                        <Text style={[dynamicStyles.statValue, { color: colors.text }]}>
                            {currency}{item.income.toFixed(0)}
                        </Text>
                    </View>
                    <View style={dynamicStyles.statColumn}>
                        <Text style={dynamicStyles.statLabel}>Spent</Text>
                        <Text style={[dynamicStyles.statValue, { color: colors.textSecondary }]}>
                            {currency}{paidExpenses.toFixed(0)}
                        </Text>
                    </View>
                </View>

                <View style={dynamicStyles.progressBarContainer}>
                    <View style={[dynamicStyles.progressBarFill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: progressColor }]} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.headerTitle}>My Budgets</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <MaterialCommunityIcons name="cog-outline" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={budgets}
                keyExtractor={(item) => item.id}
                renderItem={renderBudget}
                contentContainerStyle={dynamicStyles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={dynamicStyles.emptyState}>
                        <MaterialCommunityIcons name="wallet-outline" size={80} color={colors.border} />
                        <Text style={dynamicStyles.emptyStateText}>You don't have any budgets yet.</Text>
                    </View>
                }
            />

            <TouchableOpacity style={dynamicStyles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.9}>
                <MaterialCommunityIcons name="plus" size={32} color="#ffffff" />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={dynamicStyles.modalOverlay}>
                    <View style={dynamicStyles.modalContent}>
                        <Text style={dynamicStyles.modalTitle}>New Budget</Text>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="Budget Name (e.g. October 2023)"
                            placeholderTextColor={colors.textSecondary}
                            value={newBudgetName}
                            onChangeText={setNewBudgetName}
                            autoFocus
                        />
                        <View style={dynamicStyles.modalActions}>
                            <TouchableOpacity style={[dynamicStyles.button, dynamicStyles.cancelButton]} onPress={() => setModalVisible(false)}>
                                <Text style={dynamicStyles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[dynamicStyles.button, dynamicStyles.primaryButton]} onPress={createBudget}>
                                <Text style={dynamicStyles.buttonTextDark}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};
