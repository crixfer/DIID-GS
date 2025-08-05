import React, { useState } from 'react';
import { Users, GraduationCap, Calendar, FileText, BarChart3, BookOpen, Menu, X, Settings, ChevronDown, LogOut, User } from 'lucide-react';
import { Quarter } from '../types';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedQuarter: Quarter | null;
  onQuarterSelect: (quarter: Quarter | null) => void;
}

export function Navigation({ activeTab, onTabChange, selectedQuarter, onQuarterSelect }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { teacher, signOut } = useAuth();

  const tabs = [
    { id: 'quarters', label: 'Quarters', icon: Settings },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'grades', label: 'Grades', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'calendar', label: 'Calendar', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                <span className="hidden sm:inline">DIID GS</span>
                <span className="sm:hidden">DIID GS</span>
              </h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Teacher Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                <span className="truncate max-w-32">
                  {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Teacher'}
                </span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium">{teacher?.firstName} {teacher?.lastName}</div>
                      <div className="text-xs text-gray-500">{teacher?.email}</div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quarter Selector */}
            {selectedQuarter && (
              <div className="relative">
                <button
                  onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="truncate max-w-32">{selectedQuarter.name}</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                
                {showQuarterDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onTabChange('quarters');
                          setShowQuarterDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Manage Quarters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {tabs.map((tab) => {
              // Hide non-quarter tabs if no quarter is selected
              if (!selectedQuarter && tab.id !== 'quarters') {
                return null;
              }
              
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            {/* Mobile Profile Button */}
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <User className="h-6 w-6" />
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          {/* Mobile Profile Section */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {teacher?.firstName} {teacher?.lastName}
                </div>
                <div className="text-xs text-gray-500">{teacher?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {tabs.map((tab) => {
              // Hide non-quarter tabs if no quarter is selected
              if (!selectedQuarter && tab.id !== 'quarters') {
                return null;
              }
              
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-base font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Mobile Profile Dropdown */}
      {showProfileDropdown && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {teacher?.firstName} {teacher?.lastName}
            </div>
            <div className="text-xs text-gray-500 mb-3">{teacher?.email}</div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}