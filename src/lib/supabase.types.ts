import type { AppLanguage } from './storage';

export type RoomStatus = 'waiting' | 'active' | 'finished';
export type RoomVisibility = 'private';
export type RoomMemberRole = 'host' | 'member';

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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          language?: AppLanguage;
          linked_provider_label?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          language?: AppLanguage;
          linked_provider_label?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: {
      create_private_room: {
        Args: {
          p_selected_game_id?: string | null;
        };
        Returns: Database['public']['Tables']['rooms']['Row'][];
      };
      join_private_room: {
        Args: {
          p_code: string;
        };
        Returns: Database['public']['Tables']['rooms']['Row'][];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
