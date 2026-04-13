import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/auth.store';

export function LoginScreen() {
  const { login, isLoading } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.emoji}>❤️</Text>
        <Text style={styles.title}>Wearable Health</Text>
        <Text style={styles.subtitle}>웨어러블 기기 건강 데이터를 동기화하세요</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={login}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Google로 로그인</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 8, textAlign: 'center' },
  button: { backgroundColor: '#4285F4', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
