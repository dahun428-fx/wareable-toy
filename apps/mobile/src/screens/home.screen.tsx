import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../stores/auth.store';
import { useSyncStore } from '../stores/sync.store';
import { useEffect } from 'react';
import { registerBackgroundSync } from '../services/sync/background-sync';

export function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { isSyncing, lastSyncedAt, lastSyncCount, error, sync } = useSyncStore();

  useEffect(() => {
    registerBackgroundSync();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요, {user?.displayName}님</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsLink}>설정</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>데이터 동기화</Text>
        {lastSyncedAt && (
          <Text style={styles.syncInfo}>
            마지막 동기화: {new Date(lastSyncedAt).toLocaleString('ko-KR')}
          </Text>
        )}
        {lastSyncCount > 0 && (
          <Text style={styles.syncInfo}>{lastSyncCount}개 항목 동기화됨</Text>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
          onPress={() => sync('default-device-id')}
          disabled={isSyncing}
        >
          <Text style={styles.syncButtonText}>
            {isSyncing ? '동기화 중...' : '지금 동기화'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘의 건강</Text>
        <View style={styles.statsGrid}>
          <StatItem label="심박수" value="--" unit="bpm" color="#ef4444" />
          <StatItem label="걸음수" value="--" unit="걸음" color="#3b82f6" />
          <StatItem label="수면" value="--" unit="시간" color="#8b5cf6" />
          <StatItem label="칼로리" value="--" unit="kcal" color="#f97316" />
        </View>
      </View>
    </ScrollView>
  );
}

function StatItem({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  settingsLink: { fontSize: 14, color: '#3b82f6' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
  syncInfo: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  errorText: { fontSize: 13, color: '#ef4444', marginBottom: 8 },
  syncButton: { backgroundColor: '#3b82f6', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  syncButtonDisabled: { backgroundColor: '#93c5fd' },
  syncButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statItem: { width: '47%', backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statUnit: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
});
