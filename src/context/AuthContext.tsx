import * as React from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { dataService } from '../services/dataService';
import { UserProfile, UserRole, Player } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const userProfile = await dataService.getUserProfile(authUser.uid);
        setProfile(userProfile || null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async (role: UserRole) => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const authUser = result.user;

    let userProfile = await dataService.getUserProfile(authUser.uid);
    if (!userProfile) {
      let playerId = '';
      if (role === 'player') {
        const newPlayer: Omit<Player, 'id'> = {
          name: authUser.displayName || 'New Athlete',
          joinedDate: new Date().toISOString(),
          primarySport: 'cricket', // Default
          status: 'prospect',
          stats: {
            cricket: { runs: 0, wickets: 0, matches: 0, strikeRate: 0, average: 0 },
            football: { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 },
            badminton: { wins: 0, matches: 0, winRate: 0 }
          }
        };
        playerId = await dataService.addPlayer(newPlayer) || '';
      }

      userProfile = {
        uid: authUser.uid,
        email: authUser.email!,
        name: authUser.displayName || 'New User',
        role: role,
        status: (role === 'management' || authUser.email === 'malihajahanshamme@gmail.com' || authUser.email === 'arafathislam279@gmail.com') ? 'approved' : 'pending',
        playerId: playerId || undefined,
        isSuperAdmin: authUser.email === 'malihajahanshamme@gmail.com' || authUser.email === 'arafathislam279@gmail.com',
        permissions: (authUser.email === 'malihajahanshamme@gmail.com' || authUser.email === 'arafathislam279@gmail.com') ? { fullControl: true } : undefined
      };
      await dataService.createUserProfile(userProfile);
    }
    setProfile(userProfile);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: UserRole) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const authUser = result.user;
    
    await updateProfile(authUser, { displayName: name });

    let playerId = '';
    if (role === 'player') {
      const newPlayer: Omit<Player, 'id'> = {
        name: name,
        joinedDate: new Date().toISOString(),
        primarySport: 'cricket',
        status: 'prospect',
        stats: {
          cricket: { runs: 0, wickets: 0, matches: 0, strikeRate: 0, average: 0 },
          football: { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 },
          badminton: { wins: 0, matches: 0, winRate: 0 }
        }
      };
      playerId = await dataService.addPlayer(newPlayer) || '';
    }

    const userProfile: UserProfile = {
      uid: authUser.uid,
      email: authUser.email!,
      name: name,
      role: role,
      status: (role === 'management' || authUser.email === 'malihajahanshamme@gmail.com' || authUser.email === 'arafathislam279@gmail.com') ? 'approved' : 'pending',
      playerId: playerId || undefined,
      isSuperAdmin: authUser.email === 'malihajahanshamme@gmail.com' || authUser.email === 'arafathislam279@gmail.com',
      permissions: (authUser.email === 'malihajahanshamme@gmail.com' || authUser.email === 'arafathislam279@gmail.com') ? { fullControl: true } : undefined
    };
    await dataService.createUserProfile(userProfile);
    setProfile(userProfile);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, signUpWithEmail, signInWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
