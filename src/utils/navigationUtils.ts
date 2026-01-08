import { NavigateFunction } from 'react-router-dom';

/**
 * Creates a return navigation handler that uses browser history when available,
 * falling back to a specified path when history is empty.
 * 
 * @param navigate - The navigate function from react-router-dom
 * @param fallbackPath - The path to navigate to if no history is available
 * @returns A function that handles return navigation
 */
export const getReturnNavigator = (
  navigate: NavigateFunction,
  fallbackPath: string
) => {
  return () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };
};

/**
 * Navigates back using browser history, or to a fallback path if no history exists.
 * Use this for one-off navigation actions.
 * 
 * @param navigate - The navigate function from react-router-dom
 * @param fallbackPath - The path to navigate to if no history is available
 */
export const navigateBack = (
  navigate: NavigateFunction,
  fallbackPath: string
) => {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallbackPath);
  }
};
