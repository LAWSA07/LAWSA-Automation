'use client';

import React from 'react';
import WorkflowEditor from '@/components/workflow/WorkflowEditor';
import Sidebar from '@/components/workflow/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function WorkflowPage() {
  const { user, logout } = useAuth();
  const [workflowName, setWorkflowName] = React.useState('Untitled Workflow');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const workflowEditorRef = React.useRef<any>(null);

  // Toast notification system
  const [toasts, setToasts] = React.useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>([]);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Auto-save functionality
  const saveWorkflow = React.useCallback(async () => {
    if (!workflowEditorRef.current) return;
    
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      showToast('Workflow saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save workflow', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const handleExport = () => {
    if (workflowEditorRef.current) {
      workflowEditorRef.current.exportWorkflow?.();
      showToast('Workflow exported successfully!', 'success');
    }
  };

  const handleRunWorkflow = () => {
    if (workflowEditorRef.current) {
      workflowEditorRef.current.runWorkflow?.();
      showToast('Workflow execution started!', 'info');
    }
  };

  const handleShowCredentials = () => {
    showToast('Credentials management coming soon!', 'info');
  };

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        {/* Toast Notifications */}
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className={`px-4 py-3 rounded-lg text-white font-medium min-w-[200px] ${
                toast.type === 'success' ? 'bg-green-500' : 
                toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-6">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
            >
              LAWSA Workflow Editor
            </motion.h1>
          
            <motion.input
              value={workflowName}
              onChange={e => {
                setWorkflowName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="px-4 py-2 bg-gray-700 text-white border-none rounded-lg text-lg font-bold min-w-[220px] text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
              whileFocus={{ scale: 1.02 }}
            />
            
            {/* Save Status Indicator */}
            <motion.div
              className={`flex items-center gap-2 text-sm ${
                hasUnsavedChanges ? 'text-yellow-400' : 'text-green-400'
              }`}
              animate={{ opacity: hasUnsavedChanges ? [0.5, 1, 0.5] : 1 }}
              transition={{ duration: 2, repeat: hasUnsavedChanges ? Infinity : 0 }}
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  Unsaved
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Saved
                </>
              )}
            </motion.div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="text-sm">
                <div className="font-medium">{user?.name || 'User'}</div>
                <div className="text-gray-400 text-xs">{user?.email}</div>
              </div>
            </div>

            <motion.button 
              onClick={handleExport} 
              className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Export
            </motion.button>
            <motion.button 
              onClick={handleRunWorkflow} 
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Run Workflow
            </motion.button>
            <motion.button 
              onClick={handleShowCredentials} 
              className="px-6 py-2 bg-gradient-to-r from-green-400 to-yellow-400 text-gray-900 font-bold rounded-lg hover:from-green-500 hover:to-yellow-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Credentials
            </motion.button>
            <motion.button 
              onClick={logout} 
              className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        </div>
        
        {/* Main Layout */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <div className="w-80 bg-gray-800 border-r border-gray-700">
            <Sidebar onDragStart={handleDragStart} />
          </div>
          
          {/* Workflow Editor */}
          <div className="flex-1 bg-gray-900">
            <WorkflowEditor
              ref={workflowEditorRef}
              onDragStart={handleDragStart}
              workflowName={workflowName}
              setWorkflowName={setWorkflowName}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
