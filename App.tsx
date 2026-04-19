import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BatchScreen } from './src/screens/BatchScreen';
import { SubjectScreen } from './src/screens/SubjectScreen';
import { CourseScreen } from './src/screens/CourseScreen';
import { StudentsScreen } from './src/screens/StudentsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { StudentDetailScreen } from './src/screens/StudentDetailScreen';
import { CreateBatchScreen } from './src/screens/CreateBatchScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { SupportScreen } from './src/screens/SupportScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { ChatSupportScreen } from './src/screens/ChatSupportScreen';
import { MessageScreen } from './src/screens/MessageScreen';
import { BatchChatScreen } from './src/screens/BatchChatScreen';
import { FeesScreen } from './src/screens/FeesScreen';
import { TabBar } from './src/components/TabBar';
import { colors } from './src/theme/Theme';
import { storageService } from './src/services/storageService';
import Toast from 'react-native-toast-message';

type ScreenName =
  | 'Login'
  | 'Main'
  | 'Subject'
  | 'Course'
  | 'StudentDetail'
  | 'Notifications'
  | 'Support'
  | 'Privacy'
  | 'ChatSupport'
  | 'BatchChat';
type TabName =
  | 'Dashboard'
  | 'Batches'
  | 'Students'
  | 'Chat'
  | 'Profile'
  | 'My Batch'
  | 'Fees';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Login');
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBatchName, setSelectedBatchName] = useState<string | null>(
    null,
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  );
  const [selectedBatchChat, setSelectedBatchChat] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [userData, setUserData] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await storageService.getSession();

        if (session && session.token) {
          setUserData(session.user);
          if (session.user.role === 'student') {
            setActiveTab('My Batch');
          } else {
            setActiveTab('Dashboard');
          }
          setIsAuthenticated(true);
          setCurrentScreen('Main');
        } else {
        }
      } catch (e) {
      } finally {
        setTimeout(() => setIsInitialLoading(false), 500); // Small delay to avoid flash
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (data: any) => {
    setIsAuthenticated(true);
    setUserData(data.user);
    if (data.user?.role === 'student') {
      setActiveTab('My Batch');
    } else {
      setActiveTab('Dashboard');
    }
    setCurrentScreen('Main');
  };

  const handleLogout = async () => {
    await storageService.removeToken();
    setIsAuthenticated(false);
    setCurrentScreen('Login');
    setActiveTab('Dashboard');
    setUserData(null);
    setSelectedBatchId(null);
    setSelectedBatchName(null);
    setSelectedSubjectId(null);
  };

  const handleNavigateBatch = (batchId: string, batchName?: string) => {
    setSelectedBatchId(batchId);
    if (batchName) setSelectedBatchName(batchName);
    setCurrentScreen('Subject');
  };

  const handleNavigateCourse = (subjectId: string, batchId?: string, batchName?: string) => {
    if (batchId) setSelectedBatchId(batchId);
    if (batchName) setSelectedBatchName(batchName);
    setSelectedSubjectId(subjectId);
    setCurrentScreen('Course');
  };

  const handleNavigateStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentScreen('StudentDetail');
  };

  const handleNavigateSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setCurrentScreen('Course');
  };

  const renderScreen = () => {
    if (isInitialLoading) {
      return null; // Keep screen clean while checking auth
    }

    if (!isAuthenticated || currentScreen === 'Login') {
      return <LoginScreen onLogin={handleLogin} />;
    }

    if (currentScreen === 'Subject') {
      const displayBatchId = selectedBatchId || (userData?.role === 'student' ? (typeof userData.batchId === 'object' ? userData.batchId?._id : userData.batchId) : '');
      const displayBatchName = selectedBatchName || (userData?.role === 'student' ? (typeof userData.batchId === 'object' ? userData.batchId?.name : undefined) : undefined);
      
      return (
        <SubjectScreen
          batchId={displayBatchId || ''}
          batchName={displayBatchName}
          onBack={() => setCurrentScreen('Main')}
          onNavigateCourse={handleNavigateSubject}
          isStudentRole={userData?.role === 'student'}
          userData={userData}
        />
      );
    }

    if (currentScreen === 'Course') {
      return (
        <CourseScreen
          subjectId={selectedSubjectId || ''}
          onBack={() => setCurrentScreen('Subject')}
          isStudentRole={userData?.role === 'student'}
        />
      );
    }

    if (currentScreen === 'StudentDetail') {
      return (
        <StudentDetailScreen
          studentId={selectedStudentId || ''}
          onBack={() => setCurrentScreen('Main')}
        />
      );
    }

    if (currentScreen === 'Notifications') {
      return <NotificationScreen onBack={() => setCurrentScreen('Main')} />;
    }

    if (currentScreen === 'Support') {
      return (
        <SupportScreen
          onBack={() => setCurrentScreen('Main')}
          onNavigateChat={() => setCurrentScreen('ChatSupport')}
        />
      );
    }

    if (currentScreen === 'ChatSupport') {
      return <ChatSupportScreen onBack={() => setCurrentScreen('Support')} />;
    }

    if (currentScreen === 'Privacy') {
      return <PrivacyPolicyScreen onBack={() => setCurrentScreen('Main')} />;
    }

    if (currentScreen === 'BatchChat' && selectedBatchChat) {
      return (
        <BatchChatScreen
          batchId={selectedBatchChat.id}
          batchName={selectedBatchChat.name}
          onBack={() => setCurrentScreen('Main')}
        />
      );
    }

    // Main screen with Tabs (Student Role overrides)
    if (userData?.role === 'student') {
      switch (activeTab) {
        case 'My Batch':
          const studentBatchId =
            typeof userData.batchId === 'object'
              ? userData.batchId?._id
              : userData.batchId;
          const studentBatchName =
            typeof userData.batchId === 'object'
              ? userData.batchId?.name
              : undefined;
          return (
            <SubjectScreen
              batchId={studentBatchId || ''}
              batchName={
                studentBatchName ||
                (studentBatchId ? undefined : 'Unassigned Batch')
              }
              onBack={() => {}}
              onNavigateCourse={(id) => {
                setSelectedBatchId(studentBatchId);
                setSelectedBatchName(studentBatchName);
                handleNavigateSubject(id);
              }}
              isStudentRole={true}
              userData={userData}
            />
          );
        case 'Chat':
          return (
            <MessageScreen
              onNavigateChat={(id, name) => {
                setSelectedBatchChat({ id, name });
                setCurrentScreen('BatchChat');
              }}
            />
          );
        case 'Profile':
          return (
            <ProfileScreen
              onLogout={handleLogout}
              onNavigateSupport={() => setCurrentScreen('Support')}
              onNavigatePrivacy={() => setCurrentScreen('Privacy')}
              userData={userData}
              onUpdateProfile={(updated: any) => setUserData(updated)}
            />
          );
        case 'Fees':
          return <FeesScreen userData={userData} />;
        default:
          const defaultBatchId =
            typeof userData.batchId === 'object'
              ? userData.batchId?._id
              : userData.batchId;
          const defaultBatchName =
            typeof userData.batchId === 'object'
              ? userData.batchId?.name
              : undefined;
          return (
            <SubjectScreen
              batchId={defaultBatchId || ''}
              batchName={
                defaultBatchName ||
                (defaultBatchId ? undefined : 'Unassigned Batch')
              }
              onBack={() => {}}
              onNavigateCourse={handleNavigateSubject}
              isStudentRole={true}
              userData={userData}
            />
          );
      }
    }

    // Main screen with Admin Tabs
    switch (activeTab) {
      case 'Dashboard':
        return (
          <DashboardScreen
            onNavigateBatch={(id, name) => handleNavigateBatch(id, name)}
            onNavigateNotifications={() => setCurrentScreen('Notifications')}
            userName={userData?.name}
          />
        );
      case 'Batches':
        return <BatchScreen onNavigateSubject={handleNavigateBatch} />;
      case 'Students':
        return <StudentsScreen onNavigateStudent={handleNavigateStudent} />;
      case 'Profile':
        return (
          <ProfileScreen
            onLogout={handleLogout}
            onNavigateSupport={() => setCurrentScreen('Support')}
            onNavigatePrivacy={() => setCurrentScreen('Privacy')}
            userData={userData}
            onUpdateProfile={(updated: any) => setUserData(updated)}
          />
        );
      case 'Chat':
        return (
          <MessageScreen
            onNavigateChat={(id, name) => {
              setSelectedBatchChat({ id, name });
              setCurrentScreen('BatchChat');
            }}
          />
        );
      default:
        return (
          <DashboardScreen
            onNavigateBatch={handleNavigateBatch}
            onNavigateNotifications={() => setCurrentScreen('Notifications')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <View style={styles.container}>{renderScreen()}</View>
        {isAuthenticated && currentScreen !== 'Login' && (
          <TabBar
            tabs={
              userData?.role === 'student'
                ? ['My Batch', 'Fees', 'Chat', 'Profile']
                : ['Dashboard', 'Batches', 'Students', 'Chat', 'Profile']
            }
            activeTab={activeTab}
            onChangeTab={(tab) => {
              setActiveTab(tab as TabName);
              setCurrentScreen('Main'); // Reset to main stack when changing tabs
            }}
          />
        )}
      </SafeAreaView>
      <Toast />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
});

export default App;
