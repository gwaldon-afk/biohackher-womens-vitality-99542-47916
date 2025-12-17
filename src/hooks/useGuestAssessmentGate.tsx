import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const GUEST_ASSESSMENT_COUNT_KEY = 'guest_assessment_count';
const GUEST_FIRST_ASSESSMENT_KEY = 'guest_first_assessment_type';

export const useGuestAssessmentGate = () => {
  const { user } = useAuth();
  const [showGate, setShowGate] = useState(false);
  const [attemptedAssessment, setAttemptedAssessment] = useState<string>('');

  // Get the count of completed guest assessments
  const getGuestAssessmentCount = useCallback((): number => {
    const count = localStorage.getItem(GUEST_ASSESSMENT_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  }, []);

  // Get the first assessment type completed by guest
  const getFirstAssessmentType = useCallback((): string | null => {
    return localStorage.getItem(GUEST_FIRST_ASSESSMENT_KEY);
  }, []);

  // Increment guest assessment count after completion
  const recordGuestAssessment = useCallback((assessmentType: string) => {
    if (user) return; // Don't track for logged-in users
    
    const currentCount = getGuestAssessmentCount();
    const newCount = currentCount + 1;
    localStorage.setItem(GUEST_ASSESSMENT_COUNT_KEY, newCount.toString());
    
    // Store first assessment type
    if (currentCount === 0) {
      localStorage.setItem(GUEST_FIRST_ASSESSMENT_KEY, assessmentType);
    }
  }, [user, getGuestAssessmentCount]);

  // Check if guest should be gated from starting another assessment
  const checkGuestGate = useCallback((assessmentType: string): boolean => {
    if (user) return false; // No gate for logged-in users
    
    const count = getGuestAssessmentCount();
    const firstType = getFirstAssessmentType();
    
    // Allow if no assessments completed yet
    if (count === 0) return false;
    
    // Allow if trying to retake the same assessment they already did
    if (firstType === assessmentType) return false;
    
    // Gate if trying a different assessment after completing one
    setAttemptedAssessment(assessmentType);
    setShowGate(true);
    return true;
  }, [user, getGuestAssessmentCount, getFirstAssessmentType]);

  // Close the gate modal
  const closeGate = useCallback(() => {
    setShowGate(false);
    setAttemptedAssessment('');
  }, []);

  // Clear guest assessment tracking (e.g., after registration)
  const clearGuestTracking = useCallback(() => {
    localStorage.removeItem(GUEST_ASSESSMENT_COUNT_KEY);
    localStorage.removeItem(GUEST_FIRST_ASSESSMENT_KEY);
  }, []);

  return {
    showGate,
    attemptedAssessment,
    checkGuestGate,
    recordGuestAssessment,
    closeGate,
    clearGuestTracking,
    getGuestAssessmentCount,
  };
};
