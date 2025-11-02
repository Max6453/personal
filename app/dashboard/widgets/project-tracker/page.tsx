'use client';

import Header from '@/components/sideHeader';
import ProjectTracker from '@/components/widgets/projectTracker';

export default function ProjectsPage() {
  return (
    <div className='w-full'>
      <div className="p-6">
        <ProjectTracker />
      </div>
    </div>
  );
}