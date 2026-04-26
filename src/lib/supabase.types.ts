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
          miss_behavior: RoomMissBehavior;
          balance_rule_enabled: boolean;
          outcome: RoomRoundOutcome;
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
          miss_behavior?: RoomMissBehavior;
          balance_rule_enabled?: boolean;
          outcome?: RoomRoundOutcome;
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
          miss_behavior?: RoomMissBehavior;
          balance_rule_enabled?: boolean;
          outcome?: RoomRoundOutcome;
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
