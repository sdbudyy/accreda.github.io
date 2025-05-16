import { useProgressStore } from '../store/progress';
import { useSkillsStore } from '../store/skills';
import { useSAOsStore } from '../store/saos';
import { useDocumentsStore } from '../store/documents';

let isClearing = false;

export const clearAllStates = () => {
  // Prevent multiple simultaneous clear operations
  if (isClearing) return;
  
  try {
    isClearing = true;
    
    // Clear all stores
    useProgressStore.getState().clearState?.();
    useSkillsStore.getState().clearState?.();
    useSAOsStore.getState().clearState?.();
    useDocumentsStore.getState().clearState?.();
  } finally {
    isClearing = false;
  }
}; 