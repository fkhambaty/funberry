export interface Database {
  public: {
    Tables: {
      parents: {
        Row: {
          id: string;
          email: string;
          name: string;
          username: string | null;
          pin: string | null;
          subscription_tier: "free" | "premium_monthly" | "premium_yearly" | "lifetime";
          subscription_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          username?: string | null;
          pin?: string | null;
          subscription_tier?: "free" | "premium_monthly" | "premium_yearly" | "lifetime";
          subscription_expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["parents"]["Insert"]>;
      };
      children: {
        Row: {
          id: string;
          parent_id: string;
          name: string;
          age: number;
          avatar_config: AvatarConfig;
          photo_url: string | null;
          total_stars: number;
          total_coins: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          parent_id: string;
          name: string;
          age: number;
          avatar_config?: AvatarConfig;
          photo_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["children"]["Insert"]>;
      };
      zones: {
        Row: {
          id: string;
          subject: string;
          theme_name: string;
          display_name: string;
          emoji: string;
          description: string;
          color_key: string;
          is_free: boolean;
          order_index: number;
          stars_to_unlock: number;
          created_at: string;
        };
        Insert: {
          id: string;
          subject?: string;
          theme_name: string;
          display_name: string;
          emoji?: string;
          description?: string;
          color_key?: string;
          is_free?: boolean;
          order_index?: number;
          stars_to_unlock?: number;
        };
        Update: Partial<Database["public"]["Tables"]["zones"]["Insert"]>;
      };
      games: {
        Row: {
          id: string;
          zone_id: string;
          game_type: GameType;
          title: string;
          description: string;
          difficulty: number;
          config: Record<string, unknown>;
          max_stars: number;
          order_index: number;
          is_free: boolean;
          created_at: string;
        };
        Insert: {
          zone_id: string;
          game_type: GameType;
          title: string;
          description?: string;
          difficulty?: number;
          config: Record<string, unknown>;
          max_stars?: number;
          order_index?: number;
          is_free?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["games"]["Insert"]>;
      };
      progress: {
        Row: {
          id: string;
          child_id: string;
          game_id: string;
          stars_earned: number;
          score: number;
          time_spent_seconds: number;
          attempts: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          child_id: string;
          game_id: string;
          stars_earned?: number;
          score?: number;
          time_spent_seconds?: number;
          attempts?: number;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["progress"]["Insert"]>;
      };
      unlocks: {
        Row: {
          id: string;
          child_id: string;
          zone_id: string;
          unlocked_at: string;
        };
        Insert: {
          child_id: string;
          zone_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["unlocks"]["Insert"]>;
      };
      rewards: {
        Row: {
          id: string;
          child_id: string;
          reward_type: "sticker" | "costume" | "badge" | "title";
          reward_id: string;
          reward_name: string;
          earned_at: string;
        };
        Insert: {
          child_id: string;
          reward_type: "sticker" | "costume" | "badge" | "title";
          reward_id: string;
          reward_name?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rewards"]["Insert"]>;
      };
    };
  };
}

export type GameType =
  | "drag_sort"
  | "memory_match"
  | "picture_quiz"
  | "sequence_builder"
  | "spot_difference"
  | "color_activity"
  | "word_picture_link"
  | "interactive_story";

export interface AvatarConfig {
  body: string;
  hair: string;
  color: string;
}

export type Parent = Database["public"]["Tables"]["parents"]["Row"];
export type Child = Database["public"]["Tables"]["children"]["Row"];
export type Zone = Database["public"]["Tables"]["zones"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Progress = Database["public"]["Tables"]["progress"]["Row"];
export type Unlock = Database["public"]["Tables"]["unlocks"]["Row"];
export type Reward = Database["public"]["Tables"]["rewards"]["Row"];
