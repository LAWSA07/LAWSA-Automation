import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkflowEditor from './components/WorkflowEditor';
import './App.css';
import Sidebar from './components/Sidebar';
import OnboardingTour from './components/OnboardingTour';
import HomePage from './components/HomePage';

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
  const [user, setUser] = useState({
    name: '',
    avatar: '',
    status: '',
    username: '',
    email: ''
  });
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const workflowEditorRef = React.useRef<any>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const [showOnboarding, setShowOnboarding] = useState(false);

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
      
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        workflowEditorRef.current.undo?.();
      }
      
      // Redo: Ctrl+Shift+Z
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        workflowEditorRef.current.redo?.();
      }
      
      // Zoom in: Ctrl+Plus
      if (e.ctrlKey && e.key === '=') {
        e.preventDefault();
        workflowEditorRef.current.zoomIn?.();
      }
      
      // Zoom out: Ctrl+Minus
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        workflowEditorRef.current.zoomOut?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [saveWorkflow]);

  const handleExport = () => {
    if (workflowEditorRef.current && workflowEditorRef.current.handleExportConfig) {
      workflowEditorRef.current.handleExportConfig();
      showToast('Workflow exported successfully!', 'success');
    }
  };

  const handleRunWorkflow = () => {
    if (workflowEditorRef.current && workflowEditorRef.current.handleRunWorkflow) {
      workflowEditorRef.current.handleRunWorkflow();
      showToast('Workflow execution started!', 'info');
    }
  };

  const handleShowCredentials = () => {
    if (workflowEditorRef.current && workflowEditorRef.current.setShowCredentials) {
      workflowEditorRef.current.setShowCredentials(true);
    }
  };

  // Track workflow changes
  const handleWorkflowChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('lawsa_token');
    if (!token) return;
    fetch('http://localhost:8000/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser({
        name: data.name,
        avatar: data.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
        status: data.status || 'TRIAL',
        username: data.username,
        email: data.email
      }))
      .catch(() => setUser({
        name: 'Guest',
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        status: 'GUEST',
        username: '',
        email: ''
      }));
  }, []);

  const [token, setToken] = useState(localStorage.getItem('lawsa_token') || '');
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showHomepage, setShowHomepage] = useState(!localStorage.getItem('lawsa_token'));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      await Promise.resolve(localStorage.setItem('lawsa_token', data.access_token));
      setToken(data.access_token);
      setUser({
        name: '',
        avatar: '',
        status: '',
        username: '',
        email
      });
      showToast('Login successful!', 'success');
    } catch (err: any) {
      setLoginError('Login failed: ' + (err.message || 'Unknown error'));
      showToast('Login failed', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password
        })
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      showToast('Registration successful! Please login.', 'success');
      setShowRegister(false); // Switch back to login
    } catch (err: any) {
      setLoginError('Registration failed: ' + (err.message || 'Unknown error'));
      showToast('Registration failed', 'error');
    }
  };

  // Check if this is the user's first visit
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('lawsa_onboarding_completed');
    if (!hasSeenOnboarding && token) {
      // Show onboarding after a short delay
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, [token]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('lawsa_onboarding_completed', 'true');
    showToast('Welcome to LAWSA! Start building your first workflow.', 'success');
  };

  // Show homepage if no token and homepage flag is true
  if (!token && showHomepage) {
    return (
      <HomePage 
        onGetStarted={() => setShowHomepage(false)}
        onLogin={() => setShowHomepage(false)}
      />
    );
  }

  // Show login form if no token
  if (!token) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginTop: 80,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          minHeight: '100vh',
          padding: '40px'
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            width: '400px'
          }}
        >
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              textAlign: 'center',
              marginBottom: '30px',
              fontSize: '28px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome to LAWSA
          </motion.h2>
          <motion.form 
            onSubmit={showRegister ? handleRegister : handleLogin} 
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ 
                padding: '16px', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #FFD700';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255,255,255,0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ 
                padding: '16px', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #FFD700';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255,255,255,0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <motion.button 
              type="submit" 
              style={{ 
                padding: '16px', 
                fontWeight: 700,
                fontSize: '16px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showRegister ? 'Register' : 'Login'}
            </motion.button>
          </motion.form>
          
          {/* Toggle between Login and Register */}
          <motion.div 
            style={{ 
              textAlign: 'center', 
              marginTop: '20px',
              padding: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <motion.button
              type="button"
              onClick={() => setShowRegister(!showRegister)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFD700',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
              whileHover={{ scale: 1.05 }}
            >
              {showRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </motion.button>
          </motion.div>
          
          {loginError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                color: '#ff6b6b', 
                marginTop: '16px', 
                textAlign: 'center',
                padding: '12px',
                background: 'rgba(255, 107, 107, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 107, 107, 0.3)'
              }}
            >
              {loginError}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="app-grid" style={{ position: 'relative' }}>
      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

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
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                background: toast.type === 'success' 
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                  : toast.type === 'error'
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                minWidth: '300px'
              }}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="topbar-grid">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <motion.div 
            style={{ 
              height: 36, 
              width: 36, 
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#000',
              fontSize: '18px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            L
          </motion.div>
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