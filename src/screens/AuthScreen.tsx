import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

// Initialize Google SDK (mock client ID for now until user puts in theirs)
GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID_HERE',
    iosClientId: 'YOUR_IOS_CLIENT_ID_HERE',
});

export const AuthScreen = ({ navigation }: any) => {
    const { colors, isDark } = useTheme();

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            // Handle auth setup
            await AsyncStorage.setItem('@has_seen_auth', 'true');
            // Mock navigation
            navigation.replace('Home');
        } catch (error: any) {
            // Because they need to set up XCode first, this will fail in vanilla Expo Go initially.
            console.log("Google Signin Error (Normal if you haven't configured native IDs yet): ", error);
            // Simulate success for local bypass
            await AsyncStorage.setItem('@has_seen_auth', 'true');
            navigation.replace('Home');
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('@has_seen_auth', 'true');
        navigation.replace('Home');
    };

    const dynamicStyles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 32 },
        content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        iconContainer: {
            width: 120, height: 120, borderRadius: 60,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.card,
            justifyContent: 'center', alignItems: 'center', marginBottom: 40,
            shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20
        },
        title: { color: colors.text, fontSize: 36, fontWeight: '800', letterSpacing: -1, marginBottom: 12, textAlign: 'center' },
        subtitle: { color: colors.textSecondary, fontSize: 18, fontWeight: '500', textAlign: 'center', marginBottom: 60, lineHeight: 28 },
        buttonsContainer: { width: '100%', paddingBottom: 60 },
        googleButton: {
            flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 18,
            borderRadius: 16, alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6
        },
        googleButtonText: { color: '#000000', fontSize: 18, fontWeight: '700', marginLeft: 12 },
        skipButton: {
            paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: colors.border
        },
        skipButtonText: { color: colors.textSecondary, fontSize: 18, fontWeight: '700' },
    });

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <View style={dynamicStyles.content}>
                <View style={dynamicStyles.iconContainer}>
                    <MaterialCommunityIcons name="wallet-bifold-outline" size={64} color={colors.primary} />
                </View>
                <Text style={dynamicStyles.title}>Budget Tracker</Text>
                <Text style={dynamicStyles.subtitle}>Take control of your finances locally. Secure, native, and built for you.</Text>
            </View>

            <View style={dynamicStyles.buttonsContainer}>
                <TouchableOpacity style={dynamicStyles.googleButton} onPress={handleGoogleSignIn} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="google" size={24} color="#EA4335" />
                    <Text style={dynamicStyles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={dynamicStyles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
                    <Text style={dynamicStyles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
