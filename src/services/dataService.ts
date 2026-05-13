import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Player, Match, Tournament, Attendance, Sport, UserProfile, MatchSubmission, PlayerStatus, Team } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';

export const dataService = {
  // Test connection
  testConnection: async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  },

  // Storage
  uploadFile: async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Upload failed", error);
      throw error;
    }
  },

  // Players
  getPlayers: (callback: (players: Player[]) => void) => {
    const path = 'players';
    return onSnapshot(collection(db, path), (snapshot) => {
      const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      callback(players);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  addPlayer: async (player: Omit<Player, 'id'>) => {
    const path = 'players';
    try {
      const newDocRef = doc(collection(db, path));
      await setDoc(newDocRef, player);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updatePlayerStatus: async (playerId: string, status: PlayerStatus) => {
    const path = `players/${playerId}`;
    try {
      await updateDoc(doc(db, 'players', playerId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updatePlayerProfile: async (uid: string, profile: Partial<UserProfile>) => {
    try {
      await updateDoc(doc(db, 'profiles', uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'profiles');
    }
  },

  getPlayer: (playerId: string, callback: (player: Player | null) => void) => {
    const path = `players/${playerId}`;
    return onSnapshot(doc(db, 'players', playerId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Player);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  // Matches
  getMatches: (callback: (matches: Match[]) => void) => {
    const path = 'matches';
    return onSnapshot(collection(db, path), (snapshot) => {
      const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      callback(matches);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  addMatch: async (match: Omit<Match, 'id'>) => {
    const path = 'matches';
    try {
      const newDocRef = doc(collection(db, path));
      await setDoc(newDocRef, match);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getPlayerMatches: (playerId: string, callback: (matches: Match[]) => void) => {
    const path = 'matches';
    const q = query(collection(db, path), where('participants', 'array-contains', playerId));
    return onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      callback(matches);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  getMatch: (matchId: string, callback: (match: Match | null) => void) => {
    const path = `matches/${matchId}`;
    return onSnapshot(doc(db, 'matches', matchId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Match);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  // Attendance
  getPlayerAttendance: (playerId: string, callback: (attendance: Attendance[]) => void) => {
    const path = 'attendance';
    const q = query(collection(db, path), where('presentPlayerIds', 'array-contains', playerId));
    return onSnapshot(q, (snapshot) => {
      const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
      callback(attendance);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  saveAttendance: async (attendance: Omit<Attendance, 'id'>) => {
    const path = 'attendance';
    try {
      const newDocRef = doc(collection(db, path));
      await setDoc(newDocRef, attendance);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Auth & Profiles
  getUserProfile: async (uid: string) => {
    try {
      const docRef = doc(db, 'profiles', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'profiles');
    }
  },

  createUserProfile: async (profile: UserProfile) => {
    try {
      await setDoc(doc(db, 'profiles', profile.uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'profiles');
    }
  },

  // Submissions
  submitMatchStats: async (submission: Omit<MatchSubmission, 'id' | 'status' | 'submittedAt'>) => {
    const path = 'submissions';
    try {
      const newDocRef = doc(collection(db, path));
      const fullSubmission: MatchSubmission = {
        ...submission,
        id: newDocRef.id,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      await setDoc(newDocRef, fullSubmission);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getSubmissions: (callback: (submissions: MatchSubmission[]) => void) => {
    const path = 'submissions';
    return onSnapshot(collection(db, path), (snapshot) => {
      const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchSubmission));
      callback(submissions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  approveSubmission: async (submission: MatchSubmission, adminUid: string) => {
    try {
      // 1. Update submission status
      const subRef = doc(db, 'submissions', submission.id);
      await updateDoc(subRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: adminUid
      });

      // 2. Create Match record
      const matchRef = doc(collection(db, 'matches'));
      const match: Omit<Match, 'id'> = {
        title: submission.matchTitle,
        date: submission.matchDate,
        sport: submission.sport,
        participants: [submission.playerId],
        status: 'completed',
        score: submission.scoreData
      };
      await setDoc(matchRef, match);

      // 3. Update Player stats
      const playerRef = doc(db, 'players', submission.playerId);
      const playerSnap = await getDoc(playerRef);
      if (playerSnap.exists()) {
        const playerData = playerSnap.data() as Player;
        const newStats = { ...playerData.stats };

        if (submission.sport === 'cricket') {
          newStats.cricket.runs += submission.scoreData.playerRuns || 0;
          newStats.cricket.wickets += submission.scoreData.playerWickets || 0;
          newStats.cricket.matches += 1;
          newStats.cricket.average = newStats.cricket.runs / (newStats.cricket.matches || 1);
        } else if (submission.sport === 'football') {
          newStats.football.goals += submission.scoreData.playerGoals || 0;
          newStats.football.assists += submission.scoreData.playerAssists || 0;
          newStats.football.matches += 1;
        } else if (submission.sport === 'badminton') {
          newStats.badminton.matches += 1;
          if (submission.scoreData.isWinner) newStats.badminton.wins += 1;
          newStats.badminton.winRate = (newStats.badminton.wins / newStats.badminton.matches) * 100;
        }

        await updateDoc(playerRef, { stats: newStats });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'submissions');
    }
  },

  finalizeMatch: async (match: Omit<Match, 'id'>, participantScores: { playerId: string, stats: any }[]) => {
    try {
      // 1. Create the match document
      const matchRef = doc(collection(db, 'matches'));
      await setDoc(matchRef, { ...match, status: 'completed' });

      // 2. Update stats for all involved players
      for (const pScore of participantScores) {
        const playerRef = doc(db, 'players', pScore.playerId);
        const playerSnap = await getDoc(playerRef);
        
        if (playerSnap.exists()) {
          const playerData = playerSnap.data() as Player;
          const newStats = { ...playerData.stats };

          if (match.sport === 'cricket') {
            newStats.cricket.runs += pScore.stats.runs || 0;
            newStats.cricket.wickets += pScore.stats.wickets || 0;
            newStats.cricket.matches += 1;
            newStats.cricket.average = newStats.cricket.runs / (newStats.cricket.matches || 1);
          } else if (match.sport === 'football') {
            newStats.football.goals += pScore.stats.goals || 0;
            newStats.football.assists += pScore.stats.assists || 0;
            newStats.football.matches += 1;
          } else if (match.sport === 'badminton') {
            newStats.badminton.matches += 1;
            if (pScore.stats.isWinner) newStats.badminton.wins += 1;
            newStats.badminton.winRate = (newStats.badminton.wins / newStats.badminton.matches) * 100;
          }

          await updateDoc(playerRef, { stats: newStats });
        }
      }
      return matchRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'matches');
    }
  },

  rejectSubmission: async (submissionId: string) => {
    try {
      await updateDoc(doc(db, 'submissions', submissionId), { status: 'rejected' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'submissions');
    }
  },

  // User Profiles
  getPendingProfiles: (callback: (profiles: UserProfile[]) => void) => {
    const q = query(collection(db, 'profiles'), where('status', '==', 'pending'));
    return onSnapshot(q, (snapshot) => {
      const profiles = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      callback(profiles);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'profiles');
    });
  },

  approveUserProfile: async (uid: string) => {
    try {
      await updateDoc(doc(db, 'profiles', uid), { status: 'approved' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'profiles');
    }
  },

  rejectUserProfile: async (uid: string) => {
    try {
      await updateDoc(doc(db, 'profiles', uid), { status: 'rejected' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'profiles');
    }
  },

  // Teams
  getTeams: (callback: (teams: Team[]) => void) => {
    const path = 'teams';
    return onSnapshot(collection(db, path), (snapshot) => {
      const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      callback(teams);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  addTeam: async (team: Omit<Team, 'id'>) => {
    const path = 'teams';
    try {
      const newDocRef = doc(collection(db, path));
      await setDoc(newDocRef, team);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updateTeam: async (teamId: string, updates: Partial<Team>) => {
    const path = `teams/${teamId}`;
    try {
      await updateDoc(doc(db, 'teams', teamId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Tournaments
  getTournaments: (callback: (tournaments: Tournament[]) => void) => {
    const path = 'tournaments';
    return onSnapshot(collection(db, path), (snapshot) => {
      const tournaments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament));
      callback(tournaments);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  addTournament: async (tournament: Omit<Tournament, 'id'>) => {
    const path = 'tournaments';
    try {
      const newDocRef = doc(collection(db, path));
      await setDoc(newDocRef, tournament);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};
