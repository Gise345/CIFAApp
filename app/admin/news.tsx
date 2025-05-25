// CIFAMobileApp/app/admin/news.tsx
// This file serves as a redirect to the main news management page
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AdminNewsRedirect() {
  useEffect(() => {
    // Redirect to the main news management page
    router.replace('/admin/news/');
  }, []);

  return null;
}