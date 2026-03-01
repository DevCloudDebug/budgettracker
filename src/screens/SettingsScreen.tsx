import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Switch, Modal, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../theme/ThemeContext';
import { exportDatabase, importDatabase } from '../store/storage';

export const SettingsScreen = ({ navigation }: any) => {
    const { colors, isDark, toggleTheme, currency, setCurrency } = useTheme();
    const [authEnabled, setAuthEnabled] = useState(false);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

    const currencies = [
        { symbol: '$', name: 'US Dollar (USD, CAD, AUD)' },
        { symbol: '€', name: 'Euro (EUR)' },
        { symbol: '£', name: 'British Pound (GBP)' },
        { symbol: '¥', name: 'Yen/Yuan (JPY, CNY)' },
        { symbol: '₹', name: 'Indian Rupee (INR)' },
        { symbol: 'CHF', name: 'Swiss Franc (CHF)' },
        { symbol: '₽', name: 'Russian Ruble (RUB)' },
        { symbol: '₺', name: 'Turkish Lira (TRY)' },
        { symbol: 'R$', name: 'Brazilian Real (BRL)' },
        { symbol: 'R', name: 'South African Rand (ZAR)' },
        { symbol: 'kr', name: 'Krona/Krone (DKK, NOK, SEK)' }
    ];

    useEffect(() => {
        const loadSettings = async () => {
            const val = await AsyncStorage.getItem('@auth_enabled');
            setAuthEnabled(val === 'true');
        };
        loadSettings();
    }, []);

    const handleToggleAuth = async (value: boolean) => {
        if (value) {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                Alert.alert('Error', 'Your device does not support biometric authentication or no PIN is set up.');
                return;
            }

            const auth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Verify your identity to enable this feature'
            });

            if (auth.success) {
                await AsyncStorage.setItem('@auth_enabled', 'true');
                setAuthEnabled(true);
            }
        } else {
            await AsyncStorage.setItem('@auth_enabled', 'false');
            setAuthEnabled(false);
        }
    };

    const dynamicStyles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
            paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        headerTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginLeft: 16 },
        content: { padding: 20 },
        sectionLabel: { color: colors.primaryGradientStart, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, marginTop: 20 },
        card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
        row: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border
        },
        rowLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
        rowIconContainer: { flexDirection: 'row', alignItems: 'center' },
        modalOverlay: { flex: 1, backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
        modalContent: {
            backgroundColor: colors.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
            padding: 24, paddingBottom: 48,
        },
        modalTitle: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 20, letterSpacing: -0.5 },
        currencyOption: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border
        },
        currencySymbolText: { color: colors.text, fontSize: 18, fontWeight: '700', width: 40 },
        currencyNameText: { color: colors.textSecondary, fontSize: 16, flex: 1 },
        cancelButton: { marginTop: 20, padding: 16, alignItems: 'center', backgroundColor: colors.checkboxBg, borderRadius: 12 },
        cancelButtonText: { color: colors.text, fontSize: 16, fontWeight: '600' }
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={dynamicStyles.headerTitle}>Settings</Text>
            </View>

            <View style={dynamicStyles.content}>
                <Text style={dynamicStyles.sectionLabel}>Display</Text>
                <View style={dynamicStyles.card}>
                    <View style={dynamicStyles.row}>
                        <View style={dynamicStyles.rowIconContainer}>
                            <MaterialCommunityIcons name="theme-light-dark" size={24} color={colors.textSecondary} style={{ marginRight: 12 }} />
                            <Text style={dynamicStyles.rowLabel}>Dark Mode</Text>
                        </View>
                        <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} />
                    </View>
                    <TouchableOpacity style={{ ...dynamicStyles.row, borderBottomWidth: 0 }} onPress={() => setCurrencyModalVisible(true)}>
                        <View style={dynamicStyles.rowIconContainer}>
                            <MaterialCommunityIcons name="currency-usd" size={24} color={colors.textSecondary} style={{ marginRight: 12 }} />
                            <Text style={dynamicStyles.rowLabel}>Currency</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600', marginRight: 8 }}>{currency}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={dynamicStyles.sectionLabel}>Security</Text>
                <View style={dynamicStyles.card}>
                    <View style={{ ...dynamicStyles.row, borderBottomWidth: 0 }}>
                        <View style={dynamicStyles.rowIconContainer}>
                            <MaterialCommunityIcons name="fingerprint" size={24} color={colors.textSecondary} style={{ marginRight: 12 }} />
                            <Text style={dynamicStyles.rowLabel}>App Lock (Biometrics/PIN)</Text>
                        </View>
                        <Switch value={authEnabled} onValueChange={handleToggleAuth} trackColor={{ false: colors.border, true: colors.primary }} />
                    </View>
                </View>

                <Text style={dynamicStyles.sectionLabel}>Data & Backup</Text>
                <View style={dynamicStyles.card}>
                    <TouchableOpacity style={dynamicStyles.row} onPress={exportDatabase}>
                        <View style={dynamicStyles.rowIconContainer}>
                            <MaterialCommunityIcons name="cloud-upload" size={24} color={colors.textSecondary} style={{ marginRight: 12 }} />
                            <Text style={dynamicStyles.rowLabel}>Backup Budget Data</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={{ ...dynamicStyles.row, borderBottomWidth: 0 }} onPress={async () => {
                        const res = await importDatabase();
                        if (res) {
                            Alert.alert('Success', 'Database restored successfully! Please restart the app or reload the current page to see your data.', [
                                { text: 'OK', onPress: () => navigation.replace('Home') }
                            ]);
                        }
                    }}>
                        <View style={dynamicStyles.rowIconContainer}>
                            <MaterialCommunityIcons name="cloud-download" size={24} color={colors.textSecondary} style={{ marginRight: 12 }} />
                            <Text style={dynamicStyles.rowLabel}>Restore from Backup</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <Text style={dynamicStyles.sectionLabel}>Support This App</Text>
                <View style={[dynamicStyles.card, { borderColor: colors.primary }]}>
                    <TouchableOpacity
                        style={{ ...dynamicStyles.row, borderBottomWidth: 0 }}
                        onPress={() => {
                            Alert.alert(
                                'Buy me a coffee ☕',
                                'Choose your preferred payment method:',
                                [
                                    {
                                        text: 'Stripe',
                                        onPress: () => {
                                            // TODO: Add Stripe Checkout Link Here
                                            // Linking.openURL('https://buy.stripe.com/...');
                                            Alert.alert('Notice', 'Stripe link not yet configured.');
                                        }
                                    },
                                    {
                                        text: 'Apple Pay',
                                        onPress: () => {
                                            // TODO: Add Apple Pay / alternative gateway link here
                                            // Linking.openURL('https://...');
                                            Alert.alert('Notice', 'Apple Pay link not yet configured.');
                                        }
                                    },
                                    { text: 'Cancel', style: 'cancel' }
                                ]
                            );
                        }}
                    >
                        <View style={dynamicStyles.rowIconContainer}>
                            <MaterialCommunityIcons name="coffee-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                            <Text style={[dynamicStyles.rowLabel, { color: colors.primary }]}>Buy the developer a coffee</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Currency Selection Modal */}
            <Modal visible={currencyModalVisible} transparent animationType="slide">
                <View style={dynamicStyles.modalOverlay}>
                    <View style={dynamicStyles.modalContent}>
                        <Text style={dynamicStyles.modalTitle}>Select Currency</Text>
                        {currencies.map((item) => (
                            <TouchableOpacity
                                key={item.symbol}
                                style={dynamicStyles.currencyOption}
                                onPress={() => {
                                    setCurrency(item.symbol);
                                    setCurrencyModalVisible(false);
                                }}
                            >
                                <Text style={dynamicStyles.currencySymbolText}>{item.symbol}</Text>
                                <Text style={dynamicStyles.currencyNameText}>{item.name}</Text>
                                {currency === item.symbol && (
                                    <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={dynamicStyles.cancelButton} onPress={() => setCurrencyModalVisible(false)}>
                            <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};
