// utils/generate-team-stats.js
// Run this script with Node.js to populate the teamStats collection

const admin = require('firebase-admin');
const serviceAccount = require('./cifa-mobile-app-firebase-adminsdk-fbsvc-80c441ebfa.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); 

/**
 * Generate stats for all teams based on match data
 */
async function generateTeamStats() {
  try {
    console.log('Starting team stats generation...');
    
    // Get all teams
    const teamsSnapshot = await db.collection('teams').get();
    console.log(`Found ${teamsSnapshot.size} teams`);
    
    // Process each team
    for (const teamDoc of teamsSnapshot.docs) {
      const team = { id: teamDoc.id, ...teamDoc.data() };
      console.log(`Processing team: ${team.name} (${team.id})`);
      
      // Get matches for this team
      const matchesQuery = await db.collection('matches')
        .where('teams', 'array-contains', team.id)
        .get();
      
      console.log(`Found ${matchesQuery.size} matches for team ${team.name}`);
      
      // Calculate stats for each league the team is in
      const leagueMatches = {};
      
      // Group matches by league
      matchesQuery.docs.forEach(matchDoc => {
        const match = { id: matchDoc.id, ...matchDoc.data() };
        const leagueId = match.leagueId || 'default';
        
        if (!leagueMatches[leagueId]) {
          leagueMatches[leagueId] = [];
        }
        
        leagueMatches[leagueId].push(match);
      });
      
      // Calculate stats for each league
      for (const [leagueId, matches] of Object.entries(leagueMatches)) {
        const stats = calculateTeamStats(team.id, team.name, matches, leagueId);
        
        console.log(`Stats for ${team.name} in league ${leagueId}:`, stats);
        
        // Save to Firestore
        const statId = `${team.id}-${leagueId}`;
        await db.collection('teamStats').doc(statId).set(stats);
        console.log(`Saved stats for ${team.name} in league ${leagueId}`);
      }
    }
    
    console.log('Team stats generation completed!');
  } catch (error) {
    console.error('Error generating team stats:', error);
  }
}

/**
 * Calculate team statistics from match data
 */
function calculateTeamStats(teamId, teamName, matches, leagueId, season = '2024-25') {
  // Filter only completed matches
  const completedMatches = matches.filter(
    match => match.status === 'completed'
  );
  
  // Default stats (if no completed matches)
  if (completedMatches.length === 0) {
    return {
      teamId,
      teamName,
      leagueId,
      season,
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      cleanSheets: 0,
      winPercentage: 0,
      form: [],
      points: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };
  }
  
  let matchCount = 0;
  let winCount = 0;
  let drawCount = 0;
  let lossCount = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let cleanSheetsCount = 0;
  const form = [];
  
  // Process each match
  completedMatches.forEach(match => {
    matchCount++;
    
    // Check if team is home or away
    const isHome = match.homeTeamId === teamId;
    const teamScore = isHome ? match.homeScore || 0 : match.awayScore || 0;
    const opponentScore = isHome ? match.awayScore || 0 : match.homeScore || 0;
    
    // Update goals
    goalsFor += teamScore;
    goalsAgainst += opponentScore;
    
    // Update result stats
    if (teamScore > opponentScore) {
      winCount++;
      form.unshift('W');
    } else if (teamScore === opponentScore) {
      drawCount++;
      form.unshift('D');
    } else {
      lossCount++;
      form.unshift('L');
    }
    
    // Update clean sheets
    if (opponentScore === 0) {
      cleanSheetsCount++;
    }
  });
  
  // Calculate derived stats
  const goalDifference = goalsFor - goalsAgainst;
  const winPercentage = matchCount > 0 ? Math.round((winCount / matchCount) * 100) : 0;
  const points = (winCount * 3) + drawCount;
  
  // Limit form to last 5 matches
  const recentForm = form.slice(0, 5);
  
  return {
    teamId,
    teamName,
    leagueId,
    season,
    matches: matchCount,
    wins: winCount,
    draws: drawCount,
    losses: lossCount,
    goalsFor,
    goalsAgainst,
    goalDifference,
    cleanSheets: cleanSheetsCount,
    winPercentage,
    form: recentForm,
    points,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  };
}

// Run the script
generateTeamStats()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });