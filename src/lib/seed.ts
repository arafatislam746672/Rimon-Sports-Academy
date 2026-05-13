import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Player } from '../types';

export async function seedInitialData() {
  try {
    const playersRef = collection(db, 'players');
    const snapshot = await getDocs(playersRef);
    
    if (snapshot.empty) {
      console.log('Seeding initial players...');
      const initialPlayers: Omit<Player, 'id'>[] = [
        {
          name: 'Sakib Al Hasan',
          photoURL: 'https://picsum.photos/seed/sakib/400',
          joinedDate: new Date().toISOString(),
          status: 'elite',
          primarySport: 'cricket',
          stats: {
            cricket: { matches: 45, runs: 1250, wickets: 32, average: 28.5, strikeRate: 85.2 },
            football: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
            badminton: { matches: 5, wins: 3, winRate: 60 }
          }
        },
        {
          name: 'Nirob Hossain',
          photoURL: 'https://picsum.photos/seed/nirob/400',
          joinedDate: new Date().toISOString(),
          status: 'training',
          primarySport: 'football',
          stats: {
            cricket: { matches: 12, runs: 340, wickets: 5, average: 24.1, strikeRate: 72.8 },
            football: { matches: 28, goals: 12, assists: 8, yellowCards: 0, redCards: 0 },
            badminton: { matches: 2, wins: 1, winRate: 50 }
          }
        },
        {
          name: 'Nayan Ali',
          photoURL: 'https://picsum.photos/seed/nayan/400',
          joinedDate: new Date().toISOString(),
          status: 'prospect',
          primarySport: 'badminton',
          stats: {
            cricket: { matches: 0, runs: 0, wickets: 0, average: 0, strikeRate: 0 },
            football: { matches: 34, goals: 8, assists: 15, yellowCards: 0, redCards: 0 },
            badminton: { matches: 12, wins: 10, winRate: 83.3 }
          }
        }
      ];

      for (const player of initialPlayers) {
        const newDoc = doc(playersRef);
        await setDoc(newDoc, player);
      }
      console.log('Seeding complete.');
    }
  } catch (error) {
    console.warn('Seeding skipped (likely due to insufficient permissions or existing data)');
  }
}
