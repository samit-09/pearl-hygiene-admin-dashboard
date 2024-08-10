"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseConfig from "@/js/firebaseConfig";
import Dashboard from '@/components/Dashboard/Dashboard';

// Initialize Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    // Check if the code is running on the client side
    if (typeof window !== 'undefined') {
      const isLoggedInLocalStorage = localStorage.getItem('isLoggedIn');
      onAuthStateChanged(auth, (user) => {
        setLoading(false);
        if (user && isLoggedInLocalStorage === 'true') {
          router.push('/');
        } else {
          router.push('/signin');
        }
      });
    }
  }, [auth, router]);

  return (
    <>
      <DefaultLayout>
        <Dashboard />
      </DefaultLayout>
    </>
  );
}
