import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import WorkflowEditor from './components/WorkflowEditor';
import './App.css';
import Sidebar from './components/Sidebar';

// Debounce utility
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const handleDragStart = (event: React.DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const App: React.FC = () => {
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const workflowEditorRef = React.useRef<any>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock user data for sidebar
  const user = {
    name: 'Workflow User',
    avatar: '',
    status: 'ACTIVE'
  };

  // Toast notification system
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>([]);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Auto-save functionality
  const saveWorkflow = useCallback(async () => {
    if (!workflowEditorRef.current) return;
    
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      // Show success feedback
      showToast('Workflow saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save workflow', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce(() => {
      if (hasUnsavedChanges) {
        saveWorkflow();
      }
    }, 2000),
    [hasUnsavedChanges, saveWorkflow]
  );

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges) {
      debouncedSave();
    }
  }, [hasUnsavedChanges, debouncedSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Save: Ctrl+S
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveWorkflow();
      }
      
      // Delete: Delete key
      if (e.key === 'Delete' && workflowEditorRef.current) {
        e.preventDefault();
        workflowEditorRef.current.deleteSelectedNodes?.();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [saveWorkflow]);

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

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            style={{
              background: toast.type === 'success' ? '#22c55e' : 
                         toast.type === 'error' ? '#ef4444' : '#3b82f6',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: '14px',
              fontWeight: 500,
              minWidth: '200px'
            }}
          >
            {toast.message}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <motion.h1 
            style={{
              fontSize: '24px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}
          >
            LAWSA Workflow Editor
          </motion.h1>
          
          <motion.input
            value={workflowName}
            onChange={e => {
              setWorkflowName(e.target.value);
              setHasUnsavedChanges(true);
            }}
            style={{
              marginLeft: 24,
              fontSize: 20,
              fontWeight: 700,
              background: 'rgba(24,24,32,0.85)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 28px',
              minWidth: 220,
              outline: 'none',
              boxShadow: '0 2px 8px rgba(40,40,60,0.08)',
              textAlign: 'center',
              marginRight: 0
            }}
            whileFocus={{ scale: 1.02 }}
          />
          
          {/* Save Status Indicator */}
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: hasUnsavedChanges ? '#ffa500' : '#22c55e'
            }}
            animate={{ opacity: hasUnsavedChanges ? [0.5, 1, 0.5] : 1 }}
            transition={{ duration: 2, repeat: hasUnsavedChanges ? Infinity : 0 }}
          >
            {isSaving ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '2px solid #ffa500',
                  borderTop: '2px solid transparent',
                  animation: 'spin 1s linear infinite'
                }} />
                Saving...
              </>
            ) : hasUnsavedChanges ? (
              <>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ffa500'
                }} />
                Unsaved
              </>
            ) : (
              <>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e'
                }} />
                Saved
              </>
            )}
          </motion.div>
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          <motion.button 
            onClick={handleExport} 
            style={{ 
              background: '#a044ff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '10px 28px', 
              fontWeight: 700, 
              fontSize: 16, 
              cursor: 'pointer', 
              boxShadow: '0 2px 8px rgba(160,68,255,0.10)' 
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 4px 16px rgba(160,68,255,0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            Export
          </motion.button>
          <motion.button 
            onClick={handleRunWorkflow} 
            style={{ 
              background: 'linear-gradient(90deg, #FFD700 0%, #FF9800 100%)', 
              color: '#23232b', 
              border: 'none', 
              borderRadius: 8, 
              padding: '10px 28px', 
              fontWeight: 700, 
              fontSize: 16, 
              cursor: 'pointer', 
              boxShadow: '0 2px 8px rgba(255,215,0,0.10)' 
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 4px 16px rgba(255,215,0,0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            Run Workflow
          </motion.button>
          <motion.button 
            onClick={handleShowCredentials} 
            style={{ 
              background: 'linear-gradient(90deg, #43D675 0%, #FFD700 100%)', 
              color: '#23232b', 
              border: 'none', 
              borderRadius: 8, 
              padding: '10px 28px', 
              fontWeight: 700, 
              fontSize: 16, 
              cursor: 'pointer', 
              boxShadow: '0 2px 8px rgba(67,214,117,0.10)' 
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 4px 16px rgba(67,214,117,0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            Credentials
          </motion.button>
        </div>
      </div>
      
      <div className="sidebar-grid">
        <Sidebar onDragStart={handleDragStart} user={user} />
      </div>
      
      <div className="main-canvas-grid">
        <WorkflowEditor
          ref={workflowEditorRef}
          onDragStart={handleDragStart}
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
        />
      </div>
    </div>
  );
};

export default App; 