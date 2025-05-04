// CIFAMobileApp/src/utils/seedData.ts
import { 
    collection, 
    doc, 
    setDoc, 
    addDoc, 
    writeBatch, 
    Timestamp,
    getDocs,
    query,
    where
  } from 'firebase/firestore';
  import { firestore } from '../services/firebase/config';
  
  // Sample team data
  const teamsData = [
    {
      id: 'elite',
      name: 'Elite Sports Club',
      shortName: 'Elite SC',
      logo: '',
      type: 'club',
      division: "Men's Premier League",
      colorPrimary: '#16a34a', // Green
      colorSecondary: '#ffffff',
      venue: 'Ed Bush Stadium',
      foundedYear: 1992,
      description: 'Elite Sports Club is one of the premier football clubs in the Cayman Islands, known for their strong youth development program and competitive presence in the league.',
      leagueId: 'mensPremier',
      website: 'www.elitesc.ky',
      achievements: [
        '5x Premier League Champions',
        '3x FA Cup Winners',
        '2x Caribbean Club Shield Participants'
      ],
      socialLinks: {
        facebook: 'https://facebook.com/elitesc',
        instagram: 'https://instagram.com/elitesc'
      }
    },
    {
      id: 'scholars',
      name: 'Scholars International',
      shortName: 'Scholars',
      logo: '',
      type: 'club',
      division: "Men's Premier League",
      colorPrimary: '#1e40af', // Blue
      colorSecondary: '#ffffff',
      venue: 'Ed Bush Stadium',
      foundedYear: 1995,
      description: 'Scholars International is a powerhouse in Cayman football, with a rich history of success both domestically and in regional competitions.',
      leagueId: 'mensPremier',
      website: 'www.scholarsinternational.ky',
      achievements: [
        '7x Premier League Champions',
        '4x FA Cup Winners',
        'CONCACAF Champions League Participants'
      ],
      socialLinks: {
        facebook: 'https://facebook.com/scholarsinternational',
        instagram: 'https://instagram.com/scholarsinternational'
      }
    },
    {
      id: 'bodden',
      name: 'Bodden Town FC',
      shortName: 'Bodden Town',
      logo: '',
      type: 'club',
      division: "Men's Premier League",
      colorPrimary: '#7e22ce', // Purple
      colorSecondary: '#000000',
      venue: 'Haig Bodden Stadium',
      foundedYear: 1998,
      description: 'Bodden Town FC represents one of the historic districts of Grand Cayman, with strong community support and a focus on developing local talent.',
      leagueId: 'mensPremier',
      website: 'www.boddentownfc.ky',
      achievements: [
        '3x Premier League Champions',
        '2x FA Cup Winners',
        'Caribbean Club Championship Participants'
      ],
      socialLinks: {
        facebook: 'https://facebook.com/boddentownfc',
        instagram: 'https://instagram.com/boddentownfc'
      }
    }
  ];
  
  // Sample league data
  const leaguesData = [
    {
      id: 'mensPremier',
      name: "Men's Premier League",
      shortName: "MPL",
      season: '2024-25',
      type: 'mens',
      division: 'Premier',
      logoUrl: '',
      startDate: Timestamp.fromDate(new Date('2024-08-15')),
      endDate: Timestamp.fromDate(new Date('2025-05-30')),
      isActive: true,
      teams: ['elite', 'scholars', 'bodden']
    },
    {
      id: 'womensPremier',
      name: "Women's Premier League",
      shortName: "WPL",
      season: '2024-25',
      type: 'womens',
      division: 'Premier',
      logoUrl: '',
      startDate: Timestamp.fromDate(new Date('2024-09-01')),
      endDate: Timestamp.fromDate(new Date('2025-04-30')),
      isActive: true,
      teams: []
    }
  ];
  
  // Sample players data
  const playersData = [
    {
      id: 'player1',
      name: 'Mark Ebanks',
      position: 'Forward',
      number: 9,
      teamId: 'elite',
      nationality: 'Cayman Islands',
      age: 29,
    },
    {
      id: 'player2',
      name: 'Wesley Robinson',
      position: 'Midfielder',
      number: 8,
      teamId: 'scholars',
      nationality: 'Cayman Islands',
      age: 27,
    },
    {
      id: 'player3',
      name: 'Theron Wood',
      position: 'Forward',
      number: 10,
      teamId: 'elite',
      nationality: 'Cayman Islands',
      age: 30,
    },
    {
      id: 'player4',
      name: 'Joshewa Frederick',
      position: 'Goalkeeper',
      number: 1,
      teamId: 'scholars',
      nationality: 'Cayman Islands',
      age: 28,
    },
    {
      id: 'player5',
      name: 'Jorrel Whittaker',
      position: 'Defender',
      number: 4,
      teamId: 'bodden',
      nationality: 'Cayman Islands',
      age: 26,
    }
  ];
  
  // Sample match data
  const matchesData = [
    {
      id: 'match1',
      homeTeamId: 'elite',
      homeTeamName: 'Elite SC',
      homeTeamLogo: '',
      awayTeamId: 'scholars',
      awayTeamName: 'Scholars',
      awayTeamLogo: '',
      date: Timestamp.fromDate(new Date('2025-02-15T19:00:00')),
      venue: 'Ed Bush Stadium',
      competition: "Men's Premier League",
      status: 'scheduled',
      teams: ['elite', 'scholars'],
      featured: true,
      createdAt: Timestamp.now()
    },
    {
      id: 'match2',
      homeTeamId: 'bodden',
      homeTeamName: 'Bodden Town FC',
      homeTeamLogo: '',
      awayTeamId: 'elite',
      awayTeamName: 'Elite SC',
      awayTeamLogo: '',
      date: Timestamp.fromDate(new Date('2025-01-20T17:00:00')),
      venue: 'Haig Bodden Stadium',
      competition: "Men's Premier League",
      status: 'completed',
      homeScore: 1,
      awayScore: 2,
      teams: ['bodden', 'elite'],
      featured: false,
      createdAt: Timestamp.now()
    },
    {
      id: 'match3',
      homeTeamId: 'scholars',
      homeTeamName: 'Scholars',
      homeTeamLogo: '',
      awayTeamId: 'bodden',
      awayTeamName: 'Bodden Town FC',
      awayTeamLogo: '',
      date: Timestamp.fromDate(new Date('2025-01-13T19:00:00')),
      venue: 'Ed Bush Stadium',
      competition: "Men's Premier League",
      status: 'completed',
      homeScore: 3,
      awayScore: 1,
      teams: ['scholars', 'bodden'],
      featured: false,
      createdAt: Timestamp.now()
    }
  ];
  
  // Sample news data
  const newsData = [
    {
      id: 'news1',
      title: 'Cayman Islands Announces Squad for World Cup Qualifiers',
      body: 'The Cayman Islands Football Association has announced the squad for upcoming FIFA World Cup qualifiers. The team features a mix of experienced players and young talents ready to represent the country on the international stage.',
      summary: 'CIFA has announced the national team squad for upcoming FIFA World Cup qualifiers.',
      author: 'CIFA Media',
      date: Timestamp.now(),
      category: 'NATIONAL TEAM',
      tags: ['National Team', 'World Cup', 'Qualifiers'],
      featured: true,
      mediaUrls: [],
      thumbnailUrl: '',
      createdAt: Timestamp.now()
    },
    {
      id: 'news2',
      title: 'Elite SC Remains Undefeated in Premier League Campaign',
      body: 'Elite SC maintained their perfect start to the season with a convincing 2-0 victory over their rivals. The win keeps them at the top of the Men\'s Premier League table with 5 wins from 5 matches.',
      summary: 'Elite SC continues their winning streak in the Men\'s Premier League.',
      author: 'CIFA Media',
      date: Timestamp.now(),
      category: 'MEN\'S PREMIER LEAGUE',
      tags: ['Elite SC', 'Premier League', 'Match Report'],
      featured: false,
      mediaUrls: [],
      thumbnailUrl: '',
      createdAt: Timestamp.now()
    }
  ];
  
  // Sample league standings data
  const standingsData = [
    {
      leagueId: 'mensPremier',
      teamId: 'elite',
      teamName: 'Elite SC',
      teamLogo: '',
      position: 1,
      played: 5,
      won: 5,
      drawn: 0,
      lost: 0,
      goalsFor: 12,
      goalsAgainst: 2,
      goalDifference: 10,
      points: 15,
      form: ['W', 'W', 'W', 'W', 'W']
    },
    {
      leagueId: 'mensPremier',
      teamId: 'scholars',
      teamName: 'Scholars',
      teamLogo: '',
      position: 2,
      played: 5,
      won: 3,
      drawn: 1,
      lost: 1,
      goalsFor: 10,
      goalsAgainst: 5,
      goalDifference: 5,
      points: 10,
      form: ['W', 'W', 'D', 'L', 'W']
    },
    {
      leagueId: 'mensPremier',
      teamId: 'bodden',
      teamName: 'Bodden Town FC',
      teamLogo: '',
      position: 3,
      played: 5,
      won: 2,
      drawn: 0,
      lost: 3,
      goalsFor: 7,
      goalsAgainst: 9,
      goalDifference: -2,
      points: 6,
      form: ['L', 'W', 'L', 'W', 'L']
    }
  ];
  
  /**
   * Check if a collection has data already
   */
  const collectionHasData = async (collectionName: string): Promise<boolean> => {
    const snapshot = await getDocs(collection(firestore, collectionName));
    return !snapshot.empty;
  };
  
  /**
   * Seed teams data to Firestore
   */
  export const seedTeams = async (force: boolean = false): Promise<void> => {
    try {
      // Check if collection already has data
      const hasData = await collectionHasData('teams');
      if (hasData && !force) {
        console.log('Teams collection already has data. Use force=true to overwrite.');
        return;
      }
  
      // Use a batched write for better performance
      const batch = writeBatch(firestore);
      
      // Add each team with its predefined ID
      teamsData.forEach(team => {
        const docRef = doc(firestore, 'teams', team.id);
        batch.set(docRef, {
          ...team,
          createdAt: Timestamp.now()
        });
      });
      
      // Commit the batch
      await batch.commit();
      console.log(`Successfully seeded ${teamsData.length} teams to Firestore`);
    } catch (error) {
      console.error('Error seeding teams data:', error);
      throw error;
    }
  };
  
  /**
   * Seed leagues data to Firestore
   */
  export const seedLeagues = async (force: boolean = false): Promise<void> => {
    try {
      // Check if collection already has data
      const hasData = await collectionHasData('leagues');
      if (hasData && !force) {
        console.log('Leagues collection already has data. Use force=true to overwrite.');
        return;
      }
  
      // Use a batched write for better performance
      const batch = writeBatch(firestore);
      
      // Add each league with its predefined ID
      leaguesData.forEach(league => {
        const docRef = doc(firestore, 'leagues', league.id);
        batch.set(docRef, {
          ...league,
          createdAt: Timestamp.now()
        });
      });
      
      // Commit the batch
      await batch.commit();
      console.log(`Successfully seeded ${leaguesData.length} leagues to Firestore`);
    } catch (error) {
      console.error('Error seeding leagues data:', error);
      throw error;
    }
  };
  
  /**
   * Seed players data to Firestore
   */
  export const seedPlayers = async (force: boolean = false): Promise<void> => {
    try {
      // Check if collection already has data
      const hasData = await collectionHasData('players');
      if (hasData && !force) {
        console.log('Players collection already has data. Use force=true to overwrite.');
        return;
      }
  
      // Use a batched write for better performance
      const batch = writeBatch(firestore);
      
      // Add each player with its predefined ID
      playersData.forEach(player => {
        const docRef = doc(firestore, 'players', player.id);
        batch.set(docRef, {
          ...player,
          createdAt: Timestamp.now()
        });
      });
      
      // Commit the batch
      await batch.commit();
      console.log(`Successfully seeded ${playersData.length} players to Firestore`);
    } catch (error) {
      console.error('Error seeding players data:', error);
      throw error;
    }
  };
  
  /**
   * Seed matches data to Firestore
   */
  export const seedMatches = async (force: boolean = false): Promise<void> => {
    try {
      // Check if collection already has data
      const hasData = await collectionHasData('matches');
      if (hasData && !force) {
        console.log('Matches collection already has data. Use force=true to overwrite.');
        return;
      }
  
      // Use a batched write for better performance
      const batch = writeBatch(firestore);
      
      // Add each match with its predefined ID
      matchesData.forEach(match => {
        const docRef = doc(firestore, 'matches', match.id);
        batch.set(docRef, match);
      });
      
      // Commit the batch
      await batch.commit();
      console.log(`Successfully seeded ${matchesData.length} matches to Firestore`);
    } catch (error) {
      console.error('Error seeding matches data:', error);
      throw error;
    }
  };
  
  /**
   * Seed news data to Firestore
   */
  export const seedNews = async (force: boolean = false): Promise<void> => {
    try {
      // Check if collection already has data
      const hasData = await collectionHasData('news');
      if (hasData && !force) {
        console.log('News collection already has data. Use force=true to overwrite.');
        return;
      }
  
      // Use a batched write for better performance
      const batch = writeBatch(firestore);
      
      // Add each news article with its predefined ID
      newsData.forEach(article => {
        const docRef = doc(firestore, 'news', article.id);
        batch.set(docRef, article);
      });
      
      // Commit the batch
      await batch.commit();
      console.log(`Successfully seeded ${newsData.length} news articles to Firestore`);
    } catch (error) {
      console.error('Error seeding news data:', error);
      throw error;
    }
  };
  
  /**
   * Seed league standings data to Firestore
   */
  export const seedLeagueStandings = async (force: boolean = false): Promise<void> => {
    try {
      // Check if collection already has data
      const hasData = await collectionHasData('leagueStandings');
      if (hasData && !force) {
        console.log('League standings collection already has data. Use force=true to overwrite.');
        return;
      }
  
      // Use add method to let Firestore generate IDs
      for (const standing of standingsData) {
        await addDoc(collection(firestore, 'leagueStandings'), {
          ...standing,
          updatedAt: Timestamp.now()
        });
      }
      
      console.log(`Successfully seeded ${standingsData.length} standings to Firestore`);
    } catch (error) {
      console.error('Error seeding standings data:', error);
      throw error;
    }
  };
  
  /**
   * Seed all data to Firestore
   */
  export const seedAllData = async (force: boolean = false): Promise<void> => {
    try {
      console.log('Starting to seed all data to Firestore...');
      
      // Seed data in sequence to maintain dependencies
      await seedLeagues(force);
      await seedTeams(force);
      await seedPlayers(force);
      await seedMatches(force);
      await seedNews(force);
      await seedLeagueStandings(force);
      
      console.log('Successfully seeded all data to Firestore!');
    } catch (error) {
      console.error('Error seeding all data:', error);
      throw error;
    }
  };
  
  export default {
    seedTeams,
    seedLeagues,
    seedPlayers,
    seedMatches,
    seedNews,
    seedLeagueStandings,
    seedAllData
  };