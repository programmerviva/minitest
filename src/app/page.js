'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function Home() {
  const router = useRouter();
  const { token, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isInitialized && token) {
      router.push('/projects');
    }
  }, [isInitialized, token, router]);

  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Manage Projects & Tasks Efficiently
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '580px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          A focused project management tool to organize tasks, track status, monitor deadlines, and stay productive.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/signup" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            Get Started Free
          </Link>
          <Link href="/login" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
