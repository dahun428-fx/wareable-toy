import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { unregisterBackgroundSync } from '../services/sync/background-sync';

export function SettingsScreen({ navigation }: any) {
  const { logout } = useAuthStore();
  const [bgSyncEnabled, setBgSyncEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await unregisterBackgroundSync();
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>동기화</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>백그라운드 동기화</Text>
          <Switch value={bgSyncEnabled} onValueChange={setBgSyncEnabled} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>연결된 플랫폼</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Apple HealthKit / Health Connect</Text>
          <Text style={styles.rowValue}>연결됨</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  backButton: { fontSize: 16, color: '#3b82f6' },
  title: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { fontSize: 15, color: '#1e293b' },
  rowValue: { fontSize: 14, color: '#22c55e' },
  logoutButton: { marginHorizontal: 16, marginTop: 32, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
});
