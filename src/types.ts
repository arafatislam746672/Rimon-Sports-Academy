export type Sport = 'cricket' | 'football' | 'badminton' | 'both';

export interface Sponsor {
  id: string;
  name: string;
  logoURL: string;
  websiteURL?: string;
  description?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'partner';
  status: 'active' | 'inactive';
  clicks: number;
  views: number;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  facilities?: string[];
  contactPerson?: string;
  phone?: string;
  photoURL?: string;
}

export interface PlayerStats {
  cricket: {
    runs: number;
    wickets: number;
    matches: number;
    strikeRate: number;
    average: number;
  };
  football: {
    goals: number;
    assists: number;
    matches: number;
    yellowCards: number;
    redCards: number;
  };
  badminton: {
    wins: number;
    matches: number;
    winRate: number;
  };
}

export type PlayerStatus = 'prospect' | 'trial' | 'training' | 'elite' | 'graduate' | 'suspended' | 'study' | 'jobs';

export interface Player {
  id: string;
  academyId?: string; // Formal unique ID
  name: string;
  photoURL?: string;
  age?: number;
  joinedDate: string;
  stats: PlayerStats;
  status: PlayerStatus;
  primarySport: Sport;
}

export interface CricketScore {
  team1: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    scorecard?: {
      batting: { playerId: string; name: string; runs: number; balls: number; fours: number; sixes: number; status: 'playing' | 'out' | 'yet-to-bat' }[];
      bowling: { playerId: string; name: string; overs: number; runs: number; wickets: number; maidens: number }[];
    };
  };
  team2: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    scorecard?: {
      batting: { playerId: string; name: string; runs: number; balls: number; fours: number; sixes: number; status: 'playing' | 'out' | 'yet-to-bat' }[];
      bowling: { playerId: string; name: string; overs: number; runs: number; wickets: number; maidens: number }[];
    };
  };
  currentInnings: 1 | 2;
  ballsHistory?: number[]; // last few balls
}

export interface FootballScore {
  team1: {
    goals: number;
    scorers: { playerId: string; minute: number }[];
    assists: { playerId: string; minute: number }[];
    cards: { playerId: string; type: 'yellow' | 'red'; minute: number }[];
  };
  team2: {
    goals: number;
    scorers: { playerId: string; minute: number }[];
    assists: { playerId: string; minute: number }[];
    cards: { playerId: string; type: 'yellow' | 'red'; minute: number }[];
  };
  time: number; // in minutes
}

export interface BadmintonScore {
  sets: {
    player1: number;
    player2: number;
  }[];
  currentSet: number;
  winner?: string;
}

export type MatchScore = CricketScore | FootballScore | BadmintonScore;

export interface Match {
  id: string;
  sport: Sport;
  title: string;
  date: string;
  participants: string[]; // Player IDs
  team1Id?: string;
  team2Id?: string;
  score: MatchScore;
  status: 'upcoming' | 'live' | 'completed';
  tournamentId?: string;
  winnerId?: string;
  venueId?: string;
}

export interface Tournament {
  id: string;
  name: string;
  sport: Sport;
  format: 'knockout' | 'league';
  startDate: string;
  endDate?: string;
  participants: string[];
  matchIds: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  pointsConfig?: {
    win: number;
    draw: number;
    loss: number;
  };
  bracket?: {
    rounds: {
      name: string;
      matches: {
        id: string;
        nextMatchId?: string;
        position: 'top' | 'bottom';
      }[];
    }[];
  };
}

export interface Attendance {
  id: string;
  date: string;
  presentPlayerIds: string[];
}

export interface Team {
  id: string;
  name: string;
  sport: Sport;
  playerIds: string[];
  captainId?: string;
  coachId?: string;
  managerId?: string;
  description?: string;
  createdAt: string;
  logoURL?: string;
  tournamentIds?: string[];
}

export interface TopEleven {
  id: string;
  sport: Sport;
  playerIds: string[];
  updatedAt: string;
}

export interface Standing {
  id?: string;
  tournamentId: string;
  teamId: string;
  played: number;
  won: number;
  lost: number;
  draw?: number;
  points: number;
  netRunRate: number;
  goalDifference: number;
  updatedAt: string;
}

export enum UserRole {
  PLAYER = 'player',
  MANAGEMENT = 'management'
}
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserPermissions {
  fullControl?: boolean;
  managePlayers?: boolean;
  manageTeams?: boolean;
  manageMatches?: boolean;
  manageTournaments?: boolean;
  manageProfiles?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  playerId?: string; // Links user account to specific player data
  academyId?: string; // Formal unique ID
  name: string;
  photoURL?: string;
  isSuperAdmin?: boolean;
  permissions?: UserPermissions;
  
  // Personal Info
  salutation?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fatherName?: string;
  motherName?: string;
  shortBio?: string;
  longDescription?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  religion?: string;
  nationality?: string;
  language?: string;
  occupation?: string;
  
  // Social Links
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  
  // Contact
  phone?: string;
  emergencyPhone?: string;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  
  // Athlete/Player Info
  jerseyName?: string;
  jerseyNumber?: string;
  previousExperience?: string;
  
  // Physical Info
  height?: string;
  weight?: string;
  handedness?: 'left' | 'right' | 'ambidextrous';
  physicallyChallenged?: 'yes' | 'no';
  
  // Identity
  idProofType?: string;
  idNumber?: string;
  idProofURL?: string;
}

export interface MatchSubmission {
  id: string;
  playerId: string;
  sport: Sport;
  matchTitle: string;
  matchDate: string;
  scoreData: any;
  proofURL: string; // Screenshot URL
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}
