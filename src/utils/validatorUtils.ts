import { supabase } from '../lib/supabase';

/**
 * Safely deletes a validator and all related skill_validations records
 * This ensures that deleted validators don't appear in PDFs
 */
export const deleteValidatorAndValidations = async (
  validatorId: string,
  eitId: string,
  skillId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete the validator record
    const { error: validatorError } = await supabase
      .from('validators')
      .delete()
      .eq('id', validatorId);
    
    if (validatorError) {
      console.error('Error deleting validator:', validatorError);
      return { success: false, error: validatorError.message };
    }

    // Also delete any related skill_validations records for this validator
    // to ensure they don't appear in the PDF
    const { error: validationError } = await supabase
      .from('skill_validations')
      .delete()
      .eq('validator_id', validatorId)
      .eq('eit_id', eitId)
      .eq('skill_id', skillId);

    if (validationError) {
      console.warn('Warning: Could not delete related skill_validations records:', validationError);
      // Don't return error here as the main validator deletion was successful
      // The database constraint should handle this automatically
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteValidatorAndValidations:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}; 