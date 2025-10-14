// Type guards for runtime validation
import { Contraindication, TargetSymptom, Benefit, ResearchCitation } from '@/types/protocols';

export function isContraindication(value: unknown): value is Contraindication {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.condition === 'string' &&
    typeof obj.severity === 'string' &&
    ['mild', 'moderate', 'severe', 'critical'].includes(obj.severity as string)
  );
}

export function isContraindicationArray(value: unknown): value is Contraindication[] {
  return Array.isArray(value) && value.every(isContraindication);
}

export function isTargetSymptom(value: unknown): value is TargetSymptom {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.symptom === 'string';
}

export function isTargetSymptomArray(value: unknown): value is TargetSymptom[] {
  return Array.isArray(value) && value.every(isTargetSymptom);
}

export function isBenefit(value: unknown): value is Benefit {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.title === 'string' && typeof obj.description === 'string';
}

export function isBenefitArray(value: unknown): value is Benefit[] {
  return Array.isArray(value) && value.every(isBenefit);
}

export function isResearchCitation(value: unknown): value is ResearchCitation {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.title === 'string';
}

export function isResearchCitationArray(value: unknown): value is ResearchCitation[] {
  return Array.isArray(value) && value.every(isResearchCitation);
}
