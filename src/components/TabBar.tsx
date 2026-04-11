import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Package, Users, User, MessageCircle } from 'lucide-react-native';
import { colors, radius, spacing } from '../theme/Theme';

const { width } = Dimensions.get('window');

interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

const getTabIcon = (tabName: string, isActive: boolean, size: number) => {
  const iconColor = isActive ? colors.primary : colors.textMuted;
  const props = { color: iconColor, size: size, strokeWidth: isActive ? 2.5 : 2 };

  switch (tabName) {
    case 'Dashboard':
    case 'Home':
      return <Home {...props} />;
    case 'Batches':
    case 'Batch':
      return <Package {...props} />;
    case 'Students':
      return <Users {...props} />;
    case 'Profile':
      return <User {...props} />;
    case 'Chat':
      return <MessageCircle {...props} />;
    case 'My Batch':
      return <Package {...props} />;
    default:
      return <Home {...props} />;
  }
};

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onChangeTab }) => {
  const tabDisplayNames: Record<string, string> = {
    'Dashboard': 'Home',
    'Batches': 'Batch',
    'Students': 'Students',
    'Profile': 'Profile',
    'Chat': 'Chat',
    'My Batch': 'My Batch'
  };

  return (
    <View style={styles.outerContainer}>
        {/* Transparent background with blur feel via light color */}
        <View style={styles.floatingContainer}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab;
                const displayLabel = tabDisplayNames[tab] || tab;
                
                return (
                    <TouchableOpacity
                    key={tab}
                    style={styles.tab}
                    onPress={() => onChangeTab(tab)}
                    activeOpacity={0.7}
                    >
                    <View style={[styles.iconBox, isActive && styles.activeIconBox]}>
                        {getTabIcon(tab, isActive, 24)}
                        {isActive && <View style={styles.indicator} />}
                    </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 100,
  },
  floatingContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.95)', // Deep Slate/Black with slight transparency
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
    width: width - 48,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  indicator: {
    position: 'absolute',
    bottom: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
