'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Check, X } from 'lucide-react';

interface Credential {
  id: string;
  name: string;
  type: string;
  provider?: string;
  description?: string;
  created_at?: string;
}

interface CredentialType {
  type: string;
  name: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    options?: string[];
  }>;
}

interface CredentialManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialSelect?: (credential: Credential) => void;
}

const CredentialManager: React.FC<CredentialManagerProps> = ({
  isOpen,
  onClose,
  onCredentialSelect
}) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [credentialTypes, setCredentialTypes] = useState<CredentialType[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadCredentials();
      loadCredentialTypes();
    }
  }, [isOpen]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('lawsa_token');
      const response = await fetch('http://localhost:8000/api/credentials', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCredentials(data);
      } else {
        setError('Failed to load credentials');
      }
    } catch (err) {
      setError('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const loadCredentialTypes = async () => {
    try {
      const token = localStorage.getItem('lawsa_token');
      const response = await fetch('http://localhost:8000/api/credentials/types', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCredentialTypes(data);
      }
    } catch (err) {
      console.error('Failed to load credential types:', err);
    }
  };

  const handleCreateCredential = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('lawsa_token');
      const response = await fetch('http://localhost:8000/api/credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: selectedType,
          data: formData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowCreateForm(false);
        setFormData({});
        setSelectedType('');
        await loadCredentials();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create credential');
      }
    } catch (err) {
      setError('Failed to create credential');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('lawsa_token');
      const response = await fetch(`http://localhost:8000/api/credentials/${credentialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await loadCredentials();
      } else {
        setError('Failed to delete credential');
      }
    } catch (err) {
      setError('Failed to delete credential');
    } finally {
      setLoading(false);
    }
  };

  const getCredentialTypeInfo = (type: string) => {
    return credentialTypes.find(ct => ct.type === type);
  };

  const renderField = (field: any, value: any, onChange: (value: any) => void) => {
    const isPassword = field.type === 'password';
    const showPassword = showPasswords[field.name] || false;

    switch (field.type) {
      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-10"
              placeholder={field.description}
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, [field.name]: !showPassword }))}
              className="absolute right-2 top-2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Select {field.name}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            rows={3}
            placeholder={field.description}
          />
        );
      
      default:
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder={field.description}
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Credential Manager</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  <Plus size={16} />
                  Add Credential
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {/* Create Credential Form */}
            {showCreateForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 p-4 bg-gray-700 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Create New Credential</h3>
                
                <div className="space-y-4">
                  {/* Credential Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Credential Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">Select credential type</option>
                      {credentialTypes.map(type => (
                        <option key={type.type} value={type.type}>
                          {type.name} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Fields */}
                  {selectedType && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Credential Name
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="Enter credential name"
                        />
                      </div>

                      {getCredentialTypeInfo(selectedType)?.fields.map(field => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {field.description}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </label>
                          {renderField(
                            field,
                            formData[field.name],
                            (value) => setFormData(prev => ({ ...prev, [field.name]: value }))
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleCreateCredential}
                      disabled={loading || !selectedType || !formData.name}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Check size={16} />
                      Create Credential
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormData({});
                        setSelectedType('');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Credentials List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Your Credentials</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading credentials...</p>
                </div>
              ) : credentials.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No credentials found. Create your first credential to get started.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {credentials.map(credential => {
                    const typeInfo = getCredentialTypeInfo(credential.type);
                    return (
                      <motion.div
                        key={credential.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-yellow-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-white">{credential.name}</h4>
                              <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                                {typeInfo?.name || credential.type}
                              </span>
                            </div>
                            {credential.description && (
                              <p className="text-gray-400 text-sm mt-1">{credential.description}</p>
                            )}
                            {credential.created_at && (
                              <p className="text-gray-500 text-xs mt-1">
                                Created: {new Date(credential.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {onCredentialSelect && (
                              <button
                                onClick={() => onCredentialSelect(credential)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                Select
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCredential(credential.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CredentialManager;
