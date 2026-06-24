import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Set this value to false to force onboarding flow (recommended first launch)
  // or set to true to bypass and land directly on the home dashboard.
  const hasOnboarded = false;

  if (hasOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
