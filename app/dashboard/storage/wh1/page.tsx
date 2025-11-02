'use client';

import Header from '@/components/sideHeader';
import S3Storage from '../components/storageComponent';

export default function StoragePage() {
  return (
    <div className='w-full'>
      <div className="p-6">
        <S3Storage />
      </div>
    </div>
  );
}