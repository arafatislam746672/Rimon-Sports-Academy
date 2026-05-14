import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot,
  getDocFromServer,
  addDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Player, Match, Tournament, Attendance, Sport, UserProfile, MatchSubmission, PlayerStatus, Team, TopEleven, CricketScore, FootballScore, BadmintonScore } from '../types';
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

  completeMatch: async (matchId: string, participantScores: { playerId: string, stats: any }[]) => {
    const path = `matches/${matchId}`;
    try {
      // 1. Get current match
      const mRef = doc(db, 'matches', matchId);
      const mSnap = await getDoc(mRef);
      if (!mSnap.exists()) throw new Error("Match not found");
      const match = mSnap.data() as Match;

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
            newStats.football.yellowCards += pScore.stats.yellowCards || 0;
            newStats.football.redCards += pScore.stats.redCards || 0;
          } else if (match.sport === 'badminton') {
            newStats.badminton.matches += 1;
            if (pScore.stats.isWinner) newStats.badminton.wins += 1;
            newStats.badminton.winRate = (newStats.badminton.wins / (newStats.badminton.matches || 1)) * 100;
          }

          await updateDoc(playerRef, { stats: newStats });
        }
      }

      // 3. Mark match as completed
      await updateDoc(mRef, { status: 'completed' });

      // 4. Update Tournament Standings
      if (match.tournamentId) {
        await dataService.updateTournamentStandings(match);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateTournamentStandings: async (match: Match) => {
    if (!match.tournamentId || match.sport === 'badminton') return;
    try {
      const score = match.score as (CricketScore | FootballScore);
      const teamsToUpdate = [
        { id: match.team1Id, score: score.team1 },
        { id: match.team2Id, score: score.team2 }
      ];

      for (const t of teamsToUpdate) {
        if (!t.id) continue;
        const standingId = `${match.tournamentId}_${t.id}`;
        const standingRef = doc(db, 'standings', standingId);
        const standingSnap = await getDoc(standingRef);
        
        const isTeam1 = t.id === match.team1Id;
        
        // Handle score comparison based on sport
        let myScoreValue = 0;
        let oppScoreValue = 0;

        if (match.sport === 'cricket') {
          const s = score as CricketScore;
          myScoreValue = isTeam1 ? s.team1.runs : s.team2.runs;
          oppScoreValue = isTeam1 ? s.team2.runs : s.team1.runs;
        } else if (match.sport === 'football') {
          const s = score as FootballScore;
          myScoreValue = isTeam1 ? s.team1.goals : s.team2.goals;
          oppScoreValue = isTeam1 ? s.team2.goals : s.team1.goals;
        }

        let result: 'win' | 'loss' | 'draw' = 'draw';
        if (myScoreValue > oppScoreValue) result = 'win';
        else if (myScoreValue < oppScoreValue) result = 'loss';

        if (standingSnap.exists()) {
          const s = standingSnap.data();
          await updateDoc(standingRef, {
            played: s.played + 1,
            won: s.won + (result === 'win' ? 1 : 0),
            lost: s.lost + (result === 'loss' ? 1 : 0),
            draw: (s.draw || 0) + (result === 'draw' ? 1 : 0),
            points: s.points + (result === 'win' ? 3 : result === 'draw' ? 1 : 0),
            goalDifference: (s.goalDifference || 0) + (myScoreValue - oppScoreValue),
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(standingRef, {
            tournamentId: match.tournamentId,
            teamId: t.id,
            played: 1,
            won: result === 'win' ? 1 : 0,
            lost: result === 'loss' ? 1 : 0,
            draw: result === 'draw' ? 1 : 0,
            points: result === 'win' ? 3 : result === 'draw' ? 1 : 0,
            goalDifference: myScoreValue - oppScoreValue,
            netRunRate: 0,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error("Standings Update Error:", error);
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

  getProfiles: (callback: (profiles: UserProfile[]) => void) => {
    const path = 'profiles';
    return onSnapshot(collection(db, path), (snapshot) => {
      const profiles = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      callback(profiles);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
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

  deleteTeam: async (teamId: string) => {
    const path = `teams/${teamId}`;
    try {
      await deleteDoc(doc(db, 'teams', teamId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  getTeam: (teamId: string, callback: (team: Team | null) => void) => {
    const path = `teams/${teamId}`;
    return onSnapshot(doc(db, 'teams', teamId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Team);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  updateMatchScore: async (matchId: string, score: any) => {
    const path = `matches/${matchId}`;
    try {
      await updateDoc(doc(db, 'matches', matchId), { score });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateMatchStatus: async (matchId: string, status: string) => {
    const path = `matches/${matchId}`;
    try {
      await updateDoc(doc(db, 'matches', matchId), { status });
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
  },

  // Academy / Top 11
  getTopEleven: (sport: Sport, callback: (topEleven: TopEleven | null) => void) => {
    const path = `academy/top-eleven-${sport}`;
    return onSnapshot(doc(db, 'academy', `top-eleven-${sport}`), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as TopEleven);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  updateTopEleven: async (sport: Sport, playerIds: string[]) => {
    const path = `academy/top-eleven-${sport}`;
    try {
      const docRef = doc(db, 'academy', `top-eleven-${sport}`);
      await setDoc(docRef, {
        sport,
        playerIds,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
     handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Commentary
  addCommentary: async (matchId: string, text: string, type: 'system' | 'ai' | 'event', gameTime?: string) => {
    const path = `matches/${matchId}/commentary`;
    try {
      await addDoc(collection(db, 'matches', matchId, 'commentary'), {
        text,
        type,
        gameTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  getCommentary: (matchId: string, callback: (commentary: any[]) => void) => {
    const q = query(
      collection(db, 'matches', matchId, 'commentary'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `matches/${matchId}/commentary`);
    });
  },

  // Standings
  getStandings: (tournamentId: string, callback: (standings: any[]) => void) => {
    const q = query(
      collection(db, 'standings'),
      where('tournamentId', '==', tournamentId),
      orderBy('points', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'standings');
    });
  }
};
