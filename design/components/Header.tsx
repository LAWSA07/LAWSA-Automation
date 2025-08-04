
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg mr-3">
              <i className="ri-workflow-line text-lg"></i>
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Pacifico", serif' }}>
              logo
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link href="/workflows" className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap">
              Workflows
            </Link>
            <Link href="/integrations" className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap">
              Integrations
            </Link>
            
            {/* Templates Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('templates')}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap"
              >
                Templates
                <i className="ri-arrow-down-s-line ml-1"></i>
              </button>
              
              {activeDropdown === 'templates' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <Link href="/templates/slack" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg mr-3">
                      <i className="ri-slack-line"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Slack Integration</div>
                      <div className="text-xs text-gray-500">Send notifications to Slack</div>
                    </div>
                  </Link>
                  <Link href="/templates/email" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg mr-3">
                      <i className="ri-mail-line"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Email Automation</div>
                      <div className="text-xs text-gray-500">Automated email workflows</div>
                    </div>
                  </Link>
                  <Link href="/templates/database" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mr-3">
                      <i className="ri-database-2-line"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Database Sync</div>
                      <div className="text-xs text-gray-500">Keep databases in sync</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/executions" className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap">
              Executions
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('user')}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                JD
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">John Doe</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
              <i className="ri-arrow-down-s-line text-gray-400"></i>
            </button>

            {activeDropdown === 'user' && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <Link href="/profile" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                  <i className="ri-user-line text-gray-400 mr-3"></i>
                  <span className="text-sm text-gray-700">Profile Settings</span>
                </Link>
                <Link href="/settings" className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                  <i className="ri-settings-line text-gray-400 mr-3"></i>
                  <span className="text-sm text-gray-700">Workspace Settings</span>
                </Link>
                <div className="border-t border-gray-100 my-2"></div>
                <button className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                  <i className="ri-logout-box-line text-gray-400 mr-3"></i>
                  <span className="text-sm text-gray-700">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
