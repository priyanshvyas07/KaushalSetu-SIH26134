import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { api, setAuthToken } from './services/api';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { StudentView } from './pages/student/StudentView';
import { InstituteView } from './pages/institute/InstituteView';
import { EmployerView } from './pages/employer/EmployerView';
import { AdminView } from './pages/admin/AdminView';
import { KaushalSetuHelpAssistant } from './components/common/KaushalSetuHelpAssistant';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Default active tab map per role
  const defaultTabMap: Record<UserRole, string> = {
    STUDENT: 'overview',
    INSTITUTE: 'overview',
    EMPLOYER: 'overview',
    ADMIN: 'overview',
  };

  const roleUserMap: Record<UserRole, { name: string; org: string; email: string }> = {
    STUDENT: {
      name: 'Arjun Sharma',
      org: 'PICT Pune (Computer Engg 2026)',
      email: 'arjun.sharma@sih.gov.in',
    },
    INSTITUTE: {
      name: 'Prof. Ramesh Kulkarni',
      org: 'Pune Institute of Computer Technology (PICT)',
      email: 'dean.academic@pict.ac.in',
    },
    EMPLOYER: {
      name: 'Priya Sundaram',
      org: 'Razorpay Software Pvt Ltd',
      email: 'talent@razorpay.com',
    },
    ADMIN: {
      name: 'Dr. Sunita Deshmukh',
      org: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
      email: 'director.skill@msde.gov.in',
    },
  };

  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    setActiveTab(defaultTabMap[newRole]);

    try {
      const loginRes = await api.login(roleUserMap[newRole].email, newRole);
      setAuthToken(loginRes.token);
      setCurrentUser(loginRes.user);
    } catch (err) {
      console.error('Role login switch error:', err);
    }
  };

  useEffect(() => {
    // Initial login as student
    handleRoleChange('STUDENT');
  }, []);

  const activeUserInfo = roleUserMap[currentRole];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        userName={currentUser?.name || activeUserInfo.name}
        organizationName={currentUser?.organizationName || activeUserInfo.org}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          currentRole={currentRole}
          currentTab={activeTab}
          onTabChange={setActiveTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentRole === 'STUDENT' && <StudentView currentTab={activeTab} />}
          {currentRole === 'INSTITUTE' && <InstituteView currentTab={activeTab} onTabChange={setActiveTab} />}
          {currentRole === 'EMPLOYER' && <EmployerView currentTab={activeTab} />}
          {currentRole === 'ADMIN' && <AdminView currentTab={activeTab} />}
        </main>
      </div>

      {/* Persistent Floating AI Assistant Launcher & Copilot */}
      <KaushalSetuHelpAssistant
        currentRole={currentRole}
        userName={currentUser?.name || activeUserInfo.name}
      />
    </div>
  );
}
