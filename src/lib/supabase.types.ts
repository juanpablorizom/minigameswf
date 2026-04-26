import type { AppLanguage, AppThemePreference } from './storage';

export type RoomStatus = 'waiting' | 'active' | 'finished';
export type RoomVisibility = 'private';
export type RoomMemberRole = 'host' | 'member';
export type RoomRoundStatus = 'active' | 'finished';
export type RoomRoundPhase = 'reveal' | 'voting' | 'result';
export type RoomMissBehavior = 'repeat' | 'end';
export type RoomRoundOutcome = 'impostors_caught' | 'impostors_balanced' | 'missed_impostor' | 'continue';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          preferred_language: AppLanguage;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          preferred_language?: AppLanguage;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          preferred_language?: AppLanguage;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          language: AppLanguage;
          linked_provider_label: string | null;
          theme_preference: AppThemePreference;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          language?: AppLanguage;
          linked_provider_label?: string | null;
          theme_preference?: AppThemePreference;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          language?: AppLanguage;
          linked_provider_label?: string | null;
          theme_preference?: AppThemePreference;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          code: string;
          host_user_id: string;
          status: RoomStatus;
          selected_game_id: string | null;
          selected_game_ids: string[];
          visibility: RoomVisibility;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          host_user_id: string;
          status?: RoomStatus;
          selected_game_id?: string | null;
          selected_game_ids?: string[];
          visibility?: RoomVisibility;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          host_user_id?: string;
          status?: RoomStatus;
          selected_game_id?: string | null;
          selected_game_ids?: string[];
          visibility?: RoomVisibility;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_members: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          role: RoomMemberRole;
          joined_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          role: RoomMemberRole;
          joined_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          role?: RoomMemberRole;
          joined_at?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      room_activity: {
        Row: {
          id: string;
          room_id: string;
          actor_user_id: string | null;
          type: string;
          payload: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          actor_user_id?: string | null;
          type: string;
          payload?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          actor_user_id?: string | null;
          type?: string;
          payload?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
      room_rounds: {
        Row: {
          id: string;
          room_id: string;
          round_number: number;
          game_id: string;
          theme_category: string;
          secret_word: string;
          impostor_ids: string[];
          eliminated_user_ids: string[];
          expelled_user_id: string | null;
          phase: RoomRoundPhase;
          vote_deadline_at: string | null;
          vote_duration_seconds: number;
          answer_duration_seconds: number;
          miss_behavior: RoomMissBehavior;
          balance_rule_enabled: boolean;
          outcome: RoomRoundOutcome;
          actor_user_id: string | null;
          scored_at: string | null;
          started_by_user_id: string;
          status: RoomRoundStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_number?: number;
          game_id?: string;
          theme_category: string;
          secret_word: string;
          impostor_ids: string[];
          eliminated_user_ids?: string[];
          expelled_user_id?: string | null;
          phase?: RoomRoundPhase;
          vote_deadline_at?: string | null;
          vote_duration_seconds?: number;
          answer_duration_seconds?: number;
          miss_behavior?: RoomMissBehavior;
          balance_rule_enabled?: boolean;
          outcome?: RoomRoundOutcome;
          actor_user_id?: string | null;
          scored_at?: string | null;
          started_by_user_id: string;
          status?: RoomRoundStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_number?: number;
          game_id?: string;
          theme_category?: string;
          secret_word?: string;
          impostor_ids?: string[];
          eliminated_user_ids?: string[];
          expelled_user_id?: string | null;
          phase?: RoomRoundPhase;
          vote_deadline_at?: string | null;
          vote_duration_seconds?: number;
          answer_duration_seconds?: number;
          miss_behavior?: RoomMissBehavior;
          balance_rule_enabled?: boolean;
          outcome?: RoomRoundOutcome;
          actor_user_id?: string | null;
          scored_at?: string | null;
          started_by_user_id?: string;
          status?: RoomRoundStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_round_votes: {
        Row: {
          id: string;
          room_id: string;
          round_id: string;
          voter_user_id: string;
          target_user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_id: string;
          voter_user_id: string;
          target_user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_id?: string;
          voter_user_id?: string;
          target_user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      room_guess_who_assignments: {
        Row: {
          id: string;
          room_id: string;
          round_id: string;
          user_id: string;
          character_label: string;
          normalized_character: string;
          guess_count: number;
          last_guess: string | null;
          solved_at: string | null;
          failed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_id: string;
          user_id: string;
          character_label: string;
          normalized_character: string;
          guess_count?: number;
          last_guess?: string | null;
          solved_at?: string | null;
          failed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_id?: string;
          user_id?: string;
          character_label?: string;
          normalized_character?: string;
          guess_count?: number;
          last_guess?: string | null;
          solved_at?: string | null;
          failed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_faces_gestures_answers: {
        Row: {
          id: string;
          room_id: string;
          round_id: string;
          user_id: string;
          guess_count: number;
          last_guess: string | null;
          normalized_last_guess: string | null;
          solved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_id: string;
          user_id: string;
          guess_count?: number;
          last_guess?: string | null;
          normalized_last_guess?: string | null;
          solved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_id?: string;
          user_id?: string;
          guess_count?: number;
          last_guess?: string | null;
          normalized_last_guess?: string | null;
          solved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_tournament_scores: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_tournament_completed_games: {
        Row: {
          id: string;
          room_id: string;
          game_id: string;
          game_order: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          game_id: string;
          game_order?: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          game_id?: string;
          game_order?: number;
          completed_at?: string;
        };
        Relationships: [];
      };
      room_trivia_questions: {
        Row: {
          id: string;
          room_id: string;
          round_id: string;
          question_order: number;
          source_question_id: string;
          topic: string;
          question: string;
          answer: string;
          aliases: string[];
          normalized_answer: string;
          normalized_aliases: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_id: string;
          question_order: number;
          source_question_id: string;
          topic: string;
          question: string;
          answer: string;
          aliases?: string[];
          normalized_answer: string;
          normalized_aliases?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_id?: string;
          question_order?: number;
          source_question_id?: string;
          topic?: string;
          question?: string;
          answer?: string;
          aliases?: string[];
          normalized_answer?: string;
          normalized_aliases?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      room_trivia_answers: {
        Row: {
          id: string;
          room_id: string;
          round_id: string;
          question_id: string;
          user_id: string;
          answer_text: string;
          normalized_answer: string;
          is_correct: boolean;
          answered_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_id: string;
          question_id: string;
          user_id: string;
          answer_text: string;
          normalized_answer: string;
          is_correct?: boolean;
          answered_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_id?: string;
          question_id?: string;
          user_id?: string;
          answer_text?: string;
          normalized_answer?: string;
          is_correct?: boolean;
          answered_at?: string;
        };
        Relationships: [];
      };
      room_who_said_phrases: {
        Row: {
          id: string;
          room_id: string;
          round_id: string;
          author_user_id: string;
          phrase_order: number | null;
          topic: string;
          phrase_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_id: string;
          author_user_id: string;
          phrase_order?: number | null;
          topic: string;
          phrase_text: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_id?: string;
          author_user_id?: string;
          phrase_order?: number | null;
          topic?: string;
          phrase_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_who_said_guesses: {
        Row: {
          id: string;
          room_id: string;
          round_id: string;
          phrase_id: string;
          user_id: string;
          guessed_user_id: string;
          is_correct: boolean;
          guessed_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_id: string;
          phrase_id: string;
          user_id: string;
          guessed_user_id: string;
          is_correct?: boolean;
          guessed_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_id?: string;
          phrase_id?: string;
          user_id?: string;
          guessed_user_id?: string;
          is_correct?: boolean;
          guessed_at?: string;
        };
        Relationships: [];
      };
      room_majority_questions: {
        Row: {
          id: string;
          room_id: string;
          round_id: string;
          question_order: number;
          source_question_id: string;
          category: string;
          question: string;
          options: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_id: string;
          question_order: number;
          source_question_id: string;
          category: string;
          question: string;
          options?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_id?: string;
          question_order?: number;
          source_question_id?: string;
          category?: string;
          question?: string;
          options?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      room_majority_responses: {
        Row: {
          id: string;
          room_id: string;
          round_id: string;
          question_id: string;
          user_id: string;
          answer_option: string | null;
          prediction_option: string | null;
          answered_at: string | null;
          predicted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          round_id: string;
          question_id: string;
          user_id: string;
          answer_option?: string | null;
          prediction_option?: string | null;
          answered_at?: string | null;
          predicted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          round_id?: string;
          question_id?: string;
          user_id?: string;
          answer_option?: string | null;
          prediction_option?: string | null;
          answered_at?: string | null;
          predicted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_private_room: {
        Args: {
          p_selected_game_ids?: string[];
        };
        Returns: Database['public']['Tables']['rooms']['Row'][];
      };
      join_private_room: {
        Args: {
          p_code: string;
        };
        Returns: Database['public']['Tables']['rooms']['Row'][];
      };
      remove_room_member: {
        Args: {
          p_room_id: string;
          p_member_user_id: string;
        };
        Returns: Database['public']['Tables']['room_members']['Row'][];
      };
      start_guess_who_round: {
        Args: {
          p_room_id: string;
          p_category_id?: string;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      submit_guess_who_answer: {
        Args: {
          p_room_id: string;
          p_guess: string;
        };
        Returns: Database['public']['Tables']['room_guess_who_assignments']['Row'][];
      };
      get_guess_who_round_state: {
        Args: {
          p_room_id: string;
        };
        Returns: Array<{
          round_id: string;
          round_number: number;
          category_id: string;
          round_status: RoomRoundStatus;
          round_phase: 'reveal' | 'result';
          started_at: string;
          user_id: string;
          character_label: string | null;
          guess_count: number;
          remaining_guesses: number;
          last_guess: string | null;
          solved_at: string | null;
          failed_at: string | null;
          is_current_user: boolean;
        }>;
      };
      start_faces_gestures_round: {
        Args: {
          p_room_id: string;
          p_turn_seconds?: number;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      submit_faces_gestures_guess: {
        Args: {
          p_room_id: string;
          p_guess: string;
        };
        Returns: Database['public']['Tables']['room_faces_gestures_answers']['Row'][];
      };
      finish_faces_gestures_round: {
        Args: {
          p_room_id: string;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      get_faces_gestures_round_state: {
        Args: {
          p_room_id: string;
        };
        Returns: Array<{
          round_id: string;
          round_number: number;
          actor_user_id: string;
          character_label: string | null;
          round_status: RoomRoundStatus;
          round_phase: 'reveal' | 'result';
          vote_deadline_at: string | null;
          vote_duration_seconds: number;
          started_at: string;
          user_id: string;
          guess_count: number;
          last_guess: string | null;
          solved_at: string | null;
          is_current_user: boolean;
        }>;
      };
      start_trivia_round: {
        Args: {
          p_room_id: string;
          p_question_count?: number;
          p_turn_seconds?: number;
          p_topics?: string[];
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      submit_trivia_answer: {
        Args: {
          p_room_id: string;
          p_answer: string;
        };
        Returns: Database['public']['Tables']['room_trivia_answers']['Row'][];
      };
      advance_trivia_question: {
        Args: {
          p_room_id: string;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      get_trivia_round_state: {
        Args: {
          p_room_id: string;
        };
        Returns: Array<{
          round_id: string;
          question_id: string;
          question_order: number;
          question_count: number;
          topic: string;
          question: string;
          round_status: RoomRoundStatus;
          round_phase: 'reveal' | 'result';
          vote_deadline_at: string | null;
          vote_duration_seconds: number;
          started_at: string;
          user_id: string;
          answer_text: string | null;
          is_correct: boolean | null;
          answered_at: string | null;
          correct_count: number;
          is_current_user: boolean;
        }>;
      };
      start_who_said_round: {
        Args: {
          p_room_id: string;
          p_topic?: string;
          p_write_seconds?: number;
          p_guess_seconds?: number;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      submit_who_said_phrase: {
        Args: {
          p_room_id: string;
          p_phrase: string;
        };
        Returns: Database['public']['Tables']['room_who_said_phrases']['Row'][];
      };
      submit_who_said_guess: {
        Args: {
          p_room_id: string;
          p_guessed_user_id: string;
        };
        Returns: Database['public']['Tables']['room_who_said_guesses']['Row'][];
      };
      advance_who_said_round: {
        Args: {
          p_room_id: string;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      get_who_said_round_state: {
        Args: {
          p_room_id: string;
        };
        Returns: Array<{
          round_id: string;
          round_number: number;
          topic: string;
          round_status: RoomRoundStatus;
          round_phase: 'reveal' | 'voting' | 'result';
          vote_deadline_at: string | null;
          vote_duration_seconds: number;
          started_at: string;
          phrase_count: number;
          submitted_count: number;
          current_phrase_id: string | null;
          current_phrase_text: string | null;
          current_phrase_order: number | null;
          current_phrase_author_user_id: string | null;
          is_current_phrase_author: boolean;
          user_id: string;
          has_submitted_phrase: boolean;
          guessed_user_id: string | null;
          is_correct: boolean | null;
          guessed_at: string | null;
          is_current_user: boolean;
        }>;
      };
      start_majority_round: {
        Args: {
          p_room_id: string;
          p_category?: string;
          p_round_count?: number;
          p_answer_seconds?: number;
          p_prediction_seconds?: number;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      submit_majority_answer: {
        Args: {
          p_room_id: string;
          p_option: string;
        };
        Returns: Database['public']['Tables']['room_majority_responses']['Row'][];
      };
      submit_majority_prediction: {
        Args: {
          p_room_id: string;
          p_option: string;
        };
        Returns: Database['public']['Tables']['room_majority_responses']['Row'][];
      };
      advance_majority_round: {
        Args: {
          p_room_id: string;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      get_majority_round_state: {
        Args: {
          p_room_id: string;
        };
        Returns: Array<{
          round_id: string;
          question_id: string;
          round_number: number;
          round_count: number;
          category: string;
          question: string;
          options: string[];
          majority_options: string[];
          option_counts: Record<string, number>;
          round_status: RoomRoundStatus;
          round_phase: 'reveal' | 'voting' | 'result';
          vote_deadline_at: string | null;
          vote_duration_seconds: number;
          started_at: string;
          user_id: string;
          answer_option: string | null;
          prediction_option: string | null;
          answered_at: string | null;
          predicted_at: string | null;
          is_prediction_correct: boolean | null;
          is_current_user: boolean;
        }>;
      };
      score_room_tournament_round: {
        Args: {
          p_room_id: string;
        };
        Returns: Array<{
          user_id: string;
          points: number;
        }>;
      };
      reset_room_tournament: {
        Args: {
          p_room_id: string;
        };
        Returns: Database['public']['Tables']['rooms']['Row'][];
      };
      start_impostor_round: {
        Args: {
          p_room_id: string;
          p_theme_category: string;
          p_impostor_count: number;
          p_vote_duration_seconds?: number;
          p_miss_behavior?: RoomMissBehavior;
          p_balance_rule_enabled?: boolean;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      advance_impostor_round: {
        Args: {
          p_room_id: string;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      cast_impostor_vote: {
        Args: {
          p_room_id: string;
          p_target_user_id: string;
        };
        Returns: Database['public']['Tables']['room_round_votes']['Row'][];
      };
      resolve_impostor_vote: {
        Args: {
          p_room_id: string;
        };
        Returns: Database['public']['Tables']['room_rounds']['Row'][];
      };
      return_room_to_lobby: {
        Args: {
          p_room_id: string;
        };
        Returns: Database['public']['Tables']['rooms']['Row'][];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
