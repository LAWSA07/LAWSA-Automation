
'use client';

import Header from '@/components/Header';
import WorkflowCanvas from '@/components/WorkflowCanvas';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <WorkflowCanvas />
    </div>
  );
}
