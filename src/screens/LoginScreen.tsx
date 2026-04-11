import React, { useState, useRef } from 'react';
import { z } from 'zod';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, typography, radius } from '../theme/Theme';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  onLogin: (user: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const [formY, setFormY] = useState(0);
  const [inputPositions, setInputPositions] = useState<Record<string, number>>(
    {},
  );

  const loginSchema = z.object({
    // ... (omitted same code for brevity but tool needs exact match or I should just replace the chunks)
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  const validate = () => {
    try {
      setErrors({});
      loginSchema.parse({ email, password });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        err.issues.forEach(e => {
          if (e.path[0]) formattedErrors[e.path[0].toString()] = e.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleLogin = async () => {
    if (validate()) {
      setIsLoading(true);
      try {

        const data = await authService.login(email, password);


        // Capture token if it exists in response
        const token = data.access_token || data.token;

        
        if (token) {

          await storageService.saveSession(token, data.user);
          
          // IMMEDIATE VERIFY
          const verified = await storageService.getSession();

        } else {

        }

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Logged in successfully!',
        });
        onLogin(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid email or password.';
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const scrollToInput = (id: string) => {
    if (inputPositions[id] !== undefined) {
      // Scroll to the cumulative Y position: form offset + individual input offset
      scrollViewRef.current?.scrollTo({
        y: (formY || 0) + inputPositions[id] - spacing.l,
        animated: true,
      });
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.brandBadge}>
          <Sparkles size={14} color={colors.primary} />
          <Text style={styles.badgeText}>ELITE EDUCATION</Text>
        </View>

        <View style={styles.logoContainer}>
          <LogIn color={colors.primary} size={42} strokeWidth={2.5} />
        </View>

        <Text style={[typography.h1, styles.title]}>
          Welcome to SRK Coaching
        </Text>
        <Text style={styles.subtitle}>Sign in to access your dashboard</Text>
      </View>
    );
  };

  const renderForm = () => {
    return (
      <View
        style={styles.form}
        onLayout={e => {
          const y = e.nativeEvent.layout.y;
          setFormY(y);
        }}
      >
        <View
          onLayout={e => {
            const y = e.nativeEvent.layout.y;
            setInputPositions(prev => ({ ...prev, email: y }));
          }}
        >
          <Input
            label="Email Address"
            placeholder="e.g. admin@srkcoaching.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            icon={<Mail color={colors.textLight} size={20} strokeWidth={2} />}
            onFocus={() => scrollToInput('email')}
          />
        </View>
        <View
          onLayout={e => {
            const y = e.nativeEvent.layout.y;
            setInputPositions(prev => ({ ...prev, password: y }));
          }}
        >
          <Input
            label="Password"
            placeholder="Enter your security code"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            icon={<Lock color={colors.textLight} size={20} strokeWidth={2} />}
            onFocus={() => scrollToInput('password')}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {renderHeader()}
            {renderForm()}

            <Button
              title="Log In Now"
              onPress={handleLogin}
              style={styles.loginButton}
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.xl,
    justifyContent: 'center',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  logoContainer: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  title: {
    marginBottom: spacing.xs,
    textAlign: 'center',
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: spacing.l,
    lineHeight: 22,
    fontSize: 14,
  },
  form: {
    marginBottom: spacing.xl,
  },
  loginButton: {
    marginTop: spacing.s,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
