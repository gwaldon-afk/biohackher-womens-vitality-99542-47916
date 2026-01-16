import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const GUEST_ASSESSMENT_COMPLETED_KEY = 'guest_assessment_completed';
const GUEST_ASSESSMENT_COMPLETED_TYPE_KEY = 'guest_assessment_completed_type';
const GUEST_ASSESSMENT_COMPLETED_AT_KEY = 'guest_assessment_completed_at';
const LEGACY_GUEST_ASSESSMENT_COUNT_KEY = 'guest_assessment_count';

export const useGuestAssessmentGate = () => {
  const { user } = useAuth();
  const [showGate, setShowGate] = useState(false);
  const [attemptedAssessment, setAttemptedAssessment] = useState<string>('');

  const getGuestCompletion = useCallback((): {
    completed: boolean;
    type: string | null;
    completedAt: string | null;
  } => {
    const completed = localStorage.getItem(GUEST_ASSESSMENT_COMPLETED_KEY) === 'true';
    const type = localStorage.getItem(GUEST_ASSESSMENT_COMPLETED_TYPE_KEY);
    const completedAt = localStorage.getItem(GUEST_ASSESSMENT_COMPLETED_AT_KEY);

    if (completed) {
      return { completed, type, completedAt };
    }

    // Legacy fallback: treat any prior guest count as completed.
    const legacyCount = localStorage.getItem(LEGACY_GUEST_ASSESSMENT_COUNT_KEY);
    if (legacyCount && parseInt(legacyCount, 10) > 0) {
      return { completed: true, type, completedAt };
    }

    return { completed: false, type: null, completedAt: null };
  }, []);

  // Mark guest assessment completion (one total across all types)
  const recordGuestAssessment = useCallback((assessmentType: string) => {
    if (user) return; // Don't track for logged-in users
    localStorage.setItem(GUEST_ASSESSMENT_COMPLETED_KEY, 'true');
    localStorage.setItem(GUEST_ASSESSMENT_COMPLETED_TYPE_KEY, assessmentType);
    localStorage.setItem(GUEST_ASSESSMENT_COMPLETED_AT_KEY, new Date().toISOString());
  }, [user]);

  // Check if guest should be gated from starting any assessment
  const checkGuestGate = useCallback((assessmentType: string): boolean => {
    if (user) return false; // No gate for logged-in users
    const completion = getGuestCompletion();

    if (!completion.completed) return false;

    // Gate any new assessment once a guest has completed one.
    setAttemptedAssessment(assessmentType);
    setShowGate(true);
    return true;
  }, [user, getGuestCompletion]);

  // Close the gate modal
  const closeGate = useCallback(() => {
    setShowGate(false);
    setAttemptedAssessment('');
  }, []);

  // Clear guest assessment tracking (e.g., after registration)
  const clearGuestTracking = useCallback(() => {
    localStorage.removeItem(GUEST_ASSESSMENT_COMPLETED_KEY);
    localStorage.removeItem(GUEST_ASSESSMENT_COMPLETED_TYPE_KEY);
    localStorage.removeItem(GUEST_ASSESSMENT_COMPLETED_AT_KEY);
    localStorage.removeItem(LEGACY_GUEST_ASSESSMENT_COUNT_KEY);
  }, []);

  return {
    showGate,
    attemptedAssessment,
    checkGuestGate,
    recordGuestAssessment,
    closeGate,
    clearGuestTracking,
    getGuestCompletion,
  };
};
