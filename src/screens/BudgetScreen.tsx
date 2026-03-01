import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import { Budget, Expense, getBudgets, updateBudget, deleteBudget } from '../store/storage';
import { useTheme } from '../theme/ThemeContext';
import { ExpenseItem } from '../components/ExpenseItem';
import { BudgetChart } from '../components/BudgetChart';

export const BudgetScreen = ({ route, navigation }: any) => {
    const { budgetId } = route.params;
    const { colors, isDark } = useTheme();
    const [budget, setBudget] = useState<Budget | null>(null);

    const [incomeModalVisible, setIncomeModalVisible] = useState(false);
    const [newIncome, setNewIncome] = useState('');

    const [expenseModalVisible, setExpenseModalVisible] = useState(false);
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');

    useEffect(() => {
        loadBudget();
    }, [budgetId]);

    const loadBudget = async () => {
        const budgets = await getBudgets();
        const found = budgets.find((b) => b.id === budgetId);
        if (found) {
            setBudget(found);
        }
    };

    const setIncome = async () => {
        if (!budget) return;
        const incomeValue = parseFloat(newIncome);
        if (isNaN(incomeValue)) return;

        const updated = { ...budget, income: incomeValue };
        setBudget(updated);
        await updateBudget(updated);
        setIncomeModalVisible(false);
        setNewIncome('');
    };

    const addExpense = async () => {
        if (!budget || !expenseName.trim() || !expenseAmount.trim()) return;
        const amountVal = parseFloat(expenseAmount);
        if (isNaN(amountVal)) return;

        const newExpense: Expense = {
            id: uuid.v4().toString(),
            name: expenseName.trim(),
            amount: amountVal,
            isPaid: false,
        };

        const updated = {
            ...budget,
            expenses: [...budget.expenses, newExpense],
        };

        setBudget(updated);
        await updateBudget(updated);
        setExpenseModalVisible(false);
        setExpenseName('');
        setExpenseAmount('');
    };

    const toggleExpensePaid = async (expenseId: string, isPaid: boolean) => {
        if (!budget) return;
        const updatedExpenses = budget.expenses.map((exp) =>
            exp.id === expenseId ? { ...exp, isPaid } : exp
        );

        const updated = { ...budget, expenses: updatedExpenses };
        setBudget(updated);
        await updateBudget(updated);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Budget",
            "Are you sure you want to delete this budget and all its expenses?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        await deleteBudget(budgetId);
                        navigation.navigate('Home');
                    }
                }
            ]
        );
    };

    const dynamicStyles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border,
        },
        headerTitle: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5, flex: 1, marginHorizontal: 16 },
        scrollContent: { padding: 16, paddingBottom: 100 },
        overviewCard: {
            backgroundColor: colors.card, borderRadius: 20, padding: 24,
            borderWidth: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border, marginBottom: 24,
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 12, elevation: 6
        },
        chartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        chartContainer: { flex: 1, alignItems: 'center' },
        statsContainer: { flex: 1, marginLeft: 16 },
        statBox: { marginBottom: 16 },
        statLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
        statValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
        listHeader: { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        listTitle: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
        emptyText: { color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 40, fontWeight: '600' },
        fab: {
            position: 'absolute', bottom: 32, right: 32, width: 64, height: 64, borderRadius: 32,
            backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
            shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8
        },
        modalOverlay: { flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
        modalContent: {
            backgroundColor: colors.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
            padding: 32, paddingBottom: 48, borderWidth: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.border
        },
        modalTitle: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 24, letterSpacing: -0.5 },
        input: {
            backgroundColor: colors.checkboxBg, color: colors.text, borderRadius: 16,
            padding: 20, fontSize: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 20
        },
        modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
        button: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
        cancelButton: { backgroundColor: 'transparent', marginRight: 8, borderWidth: 1, borderColor: colors.border },
        primaryButton: { backgroundColor: colors.primary, marginLeft: 8 },
        buttonText: { color: colors.text, fontSize: 16, fontWeight: '600' },
        buttonTextDark: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
    });

    if (!budget) return null;

    const totalExpenses = budget.expenses.reduce((sum, exp) => sum + (typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount as any) || 0), 0);
    const paidExpenses = budget.expenses.filter(e => e.isPaid).reduce((sum, exp) => sum + (typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount as any) || 0), 0);
    const balance = Math.max(0, budget.income - totalExpenses);

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={dynamicStyles.headerTitle} numberOfLines={1}>{budget.name}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => { setNewIncome(budget.income.toString()); setIncomeModalVisible(true); }} style={{ marginRight: 16 }}>
                        <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color={colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
                <View style={dynamicStyles.overviewCard}>
                    <View style={dynamicStyles.chartRow}>
                        <View style={dynamicStyles.chartContainer}>
                            <BudgetChart income={budget.income} totalExpenses={totalExpenses} paidExpenses={paidExpenses} />
                        </View>
                        <View style={dynamicStyles.statsContainer}>
                            <View style={dynamicStyles.statBox}>
                                <Text style={dynamicStyles.statLabel}>Income</Text>
                                <Text style={[dynamicStyles.statValue, { color: colors.chartGreen }]}>${budget.income.toFixed(2)}</Text>
                            </View>
                            <View style={dynamicStyles.statBox}>
                                <Text style={dynamicStyles.statLabel}>Expected Expenses</Text>
                                <Text style={[dynamicStyles.statValue, { color: colors.text }]}>${totalExpenses.toFixed(2)}</Text>
                            </View>
                            <View style={dynamicStyles.statBox}>
                                <Text style={dynamicStyles.statLabel}>Money Spent</Text>
                                <Text style={[dynamicStyles.statValue, { color: colors.chartDarkOrange }]}>${paidExpenses.toFixed(2)}</Text>
                            </View>
                            <View style={dynamicStyles.statBox}>
                                <Text style={dynamicStyles.statLabel}>To Be Paid</Text>
                                <Text style={[dynamicStyles.statValue, { color: colors.chartLightOrange }]}>${Math.max(0, totalExpenses - paidExpenses).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={dynamicStyles.listHeader}>
                    <Text style={dynamicStyles.listTitle}>Expenses</Text>
                </View>

                {budget.expenses.length === 0 ? (
                    <Text style={dynamicStyles.emptyText}>No expenses added yet.</Text>
                ) : (
                    budget.expenses.map((item) => (
                        <ExpenseItem key={item.id} expense={item} onTogglePaid={toggleExpensePaid} />
                    ))
                )}
            </ScrollView>

            <TouchableOpacity style={dynamicStyles.fab} onPress={() => setExpenseModalVisible(true)} activeOpacity={0.9}>
                <MaterialCommunityIcons name="plus" size={32} color="#ffffff" />
            </TouchableOpacity>

            {/* Income Modal */}
            <Modal visible={incomeModalVisible} transparent animationType="fade">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={dynamicStyles.modalOverlay}>
                    <View style={dynamicStyles.modalContent}>
                        <Text style={dynamicStyles.modalTitle}>Set Income</Text>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="0.00"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={newIncome}
                            onChangeText={setNewIncome}
                            autoFocus
                        />
                        <View style={dynamicStyles.modalActions}>
                            <TouchableOpacity style={[dynamicStyles.button, dynamicStyles.cancelButton]} onPress={() => setIncomeModalVisible(false)}>
                                <Text style={dynamicStyles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[dynamicStyles.button, dynamicStyles.primaryButton]} onPress={setIncome}>
                                <Text style={dynamicStyles.buttonTextDark}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Expense Modal */}
            <Modal visible={expenseModalVisible} transparent animationType="fade">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={dynamicStyles.modalOverlay}>
                    <View style={dynamicStyles.modalContent}>
                        <Text style={dynamicStyles.modalTitle}>Add Expense</Text>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="Expense Name (e.g. Rent)"
                            placeholderTextColor={colors.textSecondary}
                            value={expenseName}
                            onChangeText={setExpenseName}
                            autoFocus
                        />
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="Amount (e.g. 1500)"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={expenseAmount}
                            onChangeText={setExpenseAmount}
                        />
                        <View style={dynamicStyles.modalActions}>
                            <TouchableOpacity style={[dynamicStyles.button, dynamicStyles.cancelButton]} onPress={() => { setExpenseModalVisible(false); setExpenseName(''); setExpenseAmount(''); }}>
                                <Text style={dynamicStyles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[dynamicStyles.button, dynamicStyles.primaryButton]} onPress={addExpense}>
                                <Text style={dynamicStyles.buttonTextDark}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};
