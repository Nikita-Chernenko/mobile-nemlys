export { User as SupabaseUser } from '@supabase/supabase-js';

export class ApiEntry {
  id: number;
  created_at: string;
  updated_at: string;
}

export class APIOnboardingQuestion extends ApiEntry {
  content: string;
  slug: string;
  order: number;
}

export class APIOnboardingAnswer extends ApiEntry {
  content: string;
  slug: string;
  order: number;
  onboarding_question_id: number;
}

export class APICouple extends ApiEntry {
  invitation_code: string;
}

export type InsertAPICouple = Omit<APICouple, keyof ApiEntry>;

export class APIUserProfile extends ApiEntry {
  first_name: string;
  onboarding_finished: boolean;
  user_id: string;
  couple_id: number;
}

export type InsertAPIUserProfile = Omit<APIUserProfile, keyof ApiEntry>;

export type InsertAPIUserOnboardingAnswer = {
  user_id: string;
  onboarding_answer_id: APIOnboardingAnswer['id'];
};

export class APIQuestion extends ApiEntry {
  title: string;
  details: string;
  tips: string;
  importance: string;
}

export class APIAction extends ApiEntry {
  title: string;
  details: string;
  instruction: string;
  importance: string;
}
