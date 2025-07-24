export const validateCredential = async ({ type, provider, credentials }) => {
  const response = await fetch(`http://localhost:3001/api/validate/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, ...credentials }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Validation failed');
  return data;
}; 