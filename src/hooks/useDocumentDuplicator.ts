// src/hooks/useDocumentDuplicator.ts
import { useState } from 'react';
import { duplicateDocument, duplicateMultipleDocuments } from '../utils/firestoreDuplicator';

interface DuplicateResult {
  success: boolean;
  documentId?: string;
  documentIds?: string[];
  error?: string;
}

interface UseDuplicatorReturn {
  duplicateDoc: (
    sourcePath: string,
    destinationCollection: string,
    newDocId?: string,
    fieldsToModify?: Record<string, any>
  ) => Promise<DuplicateResult>;
  
  duplicateMultiple: (
    sourceCollection: string,
    destinationCollection: string,
    whereConditions?: [fieldPath: string, opStr: string, value: any][],
    fieldsToModify?: Record<string, any>
  ) => Promise<DuplicateResult>;
  
  duplicateBatch: (
    sourcePaths: string[],
    destinationCollection: string,
    fieldsToModify?: Record<string, any>
  ) => Promise<DuplicateResult>;
  
  loading: boolean;
  lastResult: DuplicateResult | null;
}

/**
 * Hook for duplicating Firestore documents
 */
export const useDocumentDuplicator = (): UseDuplicatorReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<DuplicateResult | null>(null);
  
  /**
   * Duplicate a single document
   */
  const duplicateDoc = async (
    sourcePath: string,
    destinationCollection: string,
    newDocId?: string,
    fieldsToModify?: Record<string, any>
  ): Promise<DuplicateResult> => {
    setLoading(true);
    
    try {
      const documentId = await duplicateDocument(
        sourcePath,
        destinationCollection,
        newDocId,
        fieldsToModify
      );
      
      const result: DuplicateResult = {
        success: true,
        documentId
      };
      
      setLastResult(result);
      return result;
    } catch (error: any) {
      const result: DuplicateResult = {
        success: false,
        error: error.message || 'An unknown error occurred'
      };
      
      setLastResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Duplicate multiple documents based on query conditions
   */
  const duplicateMultiple = async (
    sourceCollection: string,
    destinationCollection: string,
    whereConditions?: [fieldPath: string, opStr: string, value: any][],
    fieldsToModify?: Record<string, any>
  ): Promise<DuplicateResult> => {
    setLoading(true);
    
    try {
      const documentIds = await duplicateMultipleDocuments(
        sourceCollection,
        destinationCollection,
        whereConditions,
        fieldsToModify
      );
      
      const result: DuplicateResult = {
        success: true,
        documentIds
      };
      
      setLastResult(result);
      return result;
    } catch (error: any) {
      const result: DuplicateResult = {
        success: false,
        error: error.message || 'An unknown error occurred'
      };
      
      setLastResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Duplicate multiple documents by their paths
   */
  const duplicateBatch = async (
    sourcePaths: string[],
    destinationCollection: string,
    fieldsToModify?: Record<string, any>
  ): Promise<DuplicateResult> => {
    setLoading(true);
    
    try {
      const documentIds: string[] = [];
      
      // Process each source path
      await Promise.all(
        sourcePaths.map(async (sourcePath) => {
          const documentId = await duplicateDocument(
            sourcePath,
            destinationCollection,
            undefined, // Let Firestore generate IDs
            fieldsToModify
          );
          
          documentIds.push(documentId);
        })
      );
      
      const result: DuplicateResult = {
        success: true,
        documentIds
      };
      
      setLastResult(result);
      return result;
    } catch (error: any) {
      const result: DuplicateResult = {
        success: false,
        error: error.message || 'An unknown error occurred'
      };
      
      setLastResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    duplicateDoc,
    duplicateMultiple,
    duplicateBatch,
    loading,
    lastResult
  };
};

export default useDocumentDuplicator;