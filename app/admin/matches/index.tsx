// app/admin/matches/index.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/src/hooks/useAuth';
import Header from '@/src/components/common/Header';
import Button from '@/src/components/common/Button';
import Card from '@/src/components/common/Card';
import Badge from '@/src/components/common/Badge';
import { getMatches, deleteMatch, getTeams, getLeagues } from '@/src/services/firebase/matches';

interface Match {
  id: string;
  leagueId: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  date: any;
  time: string;
  venue: string;
  competition: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  featured?: boolean;
}

interface Team {
  id: string;
  name: string;
  shortName: string;
  leagueId?: string; // Added optional leagueId property
}

interface League {
  id: string;
  name: string;
  shortName: string;
  type?: string; // Added optional type property
  division?: string; // Added optional division property
}

// Fixed DateRange interface
interface DateRange {
  type: 'all' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

// Fixed FilterState interface
interface FilterState {
  status: string;
  teamIds: string[]; // Changed from teamId to teamIds array
  leagueIds: string[]; // Changed from leagueId to leagueIds array
  search: string;
  dateRange: DateRange; // Changed from string to DateRange object
}

interface StatusCounts {
  all: number;
  live: number;
  scheduled: number;
  completed: number;
  postponed: number;
  cancelled: number;
}

const INITIAL_FILTER: FilterState = {
  status: 'all',
  teamIds: [], // Changed to empty array
  leagueIds: [], // Changed to empty array
  search: '',
  dateRange: { type: 'all' } // Changed to object with type property
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Matches', count: 0 },
  { value: 'live', label: 'Live', count: 0 },
  { value: 'scheduled', label: 'Scheduled', count: 0 },
  { value: 'completed', label: 'Completed', count: 0 },
  { value: 'postponed', label: 'Postponed', count: 0 },
  { value: 'cancelled', label: 'Cancelled', count: 0 }
];

export default function AdminMatchesScreen() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  // State management
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER);
  const [showFilters, setShowFilters] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Group teams by league type for better organization
  const groupedTeams = useMemo(() => {
    const grouped: Record<string, { teams: Team[], league: League }[]> = {};
    
    // Group teams by their league
    teams.forEach(team => {
      if (team.leagueId) {
        const league = leagues.find(l => l.id === team.leagueId);
        if (league) {
          const leagueType = `${league.type || 'General'} - ${league.division || 'Division'}`;
          if (!grouped[leagueType]) {
            grouped[leagueType] = [];
          }
          
          let existingGroup = grouped[leagueType].find(g => g.league.id === league.id);
          if (!existingGroup) {
            existingGroup = { teams: [], league };
            grouped[leagueType].push(existingGroup);
          }
          
          existingGroup.teams.push(team);
        }
      }
    });
    
    // Sort teams within each group
    Object.keys(grouped).forEach(leagueType => {
      grouped[leagueType].forEach(group => {
        group.teams.sort((a, b) => a.name.localeCompare(b.name));
      });
      // Sort groups within each league type
      grouped[leagueType].sort((a, b) => a.league.name.localeCompare(b.league.name));
    });
    
    return grouped;
  }, [teams, leagues]);

  // Optimized data fetching with parallel requests
  const fetchAllData = useCallback(async () => {
    try {
      // Fetch all data in parallel for better performance
      const [matchesResult, teamsData, leaguesData] = await Promise.all([
        getMatches({ pageSize: 50 }),
        getTeams(),
        getLeagues()
      ]);

      setMatches(matchesResult.matches);
      setTeams(teamsData);
      setLeagues(leaguesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth check and initial data load
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        Alert.alert('Authentication Required', 'Please log in to access this page');
        router.replace('/(auth)/login');
        return;
      }
      
      if (isAdmin === false) {
        Alert.alert('Access Denied', 'You must be an admin to access this page');
        router.back();
        return;
      }
      
      if (isAdmin === true) {
        setHasCheckedAuth(true);
        fetchAllData();
      }
    }
  }, [authLoading, user, isAdmin, fetchAllData]);

  // Optimized filtering with useMemo to prevent unnecessary recalculations
  const applyFilters = useMemo(() => {
    if (!matches.length) return [];

    return matches.filter(match => {
      // Status filter
      if (filters.status !== 'all' && match.status !== filters.status) {
        return false;
      }

      // Team filter - support multiple teams
      if (filters.teamIds.length > 0) {
        const hasMatchingTeam = filters.teamIds.some(teamId => 
          match.homeTeamId === teamId || match.awayTeamId === teamId
        );
        if (!hasMatchingTeam) {
          return false;
        }
      }

      // League filter - support multiple leagues
      if (filters.leagueIds.length > 0 && !filters.leagueIds.includes(match.leagueId)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${match.homeTeamName} ${match.awayTeamName} ${match.venue} ${match.competition}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.type === 'custom' && filters.dateRange.startDate && filters.dateRange.endDate) {
        const matchDate = match.date?.toDate ? match.date.toDate() : new Date(match.date);
        const startDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        
        // Set time to start/end of day for proper comparison
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        if (matchDate < startDate || matchDate > endDate) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort by status priority (live > scheduled > completed) then by date
      const statusPriority: Record<string, number> = { 
        live: 3, 
        scheduled: 2, 
        completed: 1, 
        postponed: 0, 
        cancelled: 0 
      };
      const aPriority = statusPriority[a.status] || 0;
      const bPriority = statusPriority[b.status] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then sort by date
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [matches, filters]);

  // Update filtered matches when filters change
  useEffect(() => {
    setFilteredMatches(applyFilters);
  }, [applyFilters]);

  // Debounced search to improve performance
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText.length >= 3 || searchText.length === 0) {
        setFilters(prev => ({ ...prev, search: searchText }));
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchText]);

  // Status counts for filter buttons
  const statusCounts = useMemo((): StatusCounts => {
    const counts: StatusCounts = { 
      all: matches.length,
      live: 0,
      scheduled: 0,
      completed: 0,
      postponed: 0,
      cancelled: 0
    };
    
    matches.forEach(match => {
      if (match.status in counts) {
        counts[match.status as keyof StatusCounts] += 1;
      }
    });
    
    return counts;
  }, [matches]);

  // Event handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  const handleCreateMatch = () => {
    router.push('/admin/matches/create');
  };

  const handleEditMatch = (matchId: string) => {
    router.push(`/admin/matches/edit/${matchId}`);
  };

  const handleDeleteMatch = (match: Match) => {
    Alert.alert(
      'Delete Match',
      `Are you sure you want to delete "${match.homeTeamName} vs ${match.awayTeamName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMatch(match.id);
              setMatches(prev => prev.filter(m => m.id !== match.id));
              Alert.alert('Success', 'Match deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete match');
            }
          }
        }
      ]
    );
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTER);
    setSearchText('');
  };

  // Helper functions for multi-select
  const toggleTeamSelection = (teamId: string) => {
    setFilters(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId)
        ? prev.teamIds.filter(id => id !== teamId)
        : [...prev.teamIds, teamId]
    }));
  };

  const toggleLeagueSelection = (leagueId: string) => {
    setFilters(prev => ({
      ...prev,
      leagueIds: prev.leagueIds.includes(leagueId)
        ? prev.leagueIds.filter(id => id !== leagueId)
        : [...prev.leagueIds, leagueId]
    }));
  };

  const clearAllTeams = () => {
    setFilters(prev => ({ ...prev, teamIds: [] }));
  };

  const clearAllLeagues = () => {
    setFilters(prev => ({ ...prev, leagueIds: [] }));
  };

  const setDateRange = (startDate: Date, endDate: Date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        type: 'custom' as const,
        startDate,
        endDate
      }
    }));
  };

  const clearDateRange = () => {
    setFilters(prev => ({
      ...prev,
      dateRange: { type: 'all' as const }
    }));
  };

  const formatDateRange = () => {
    if (filters.dateRange.type === 'custom' && filters.dateRange.startDate && filters.dateRange.endDate) {
      const start = format(filters.dateRange.startDate, 'MMM dd');
      const end = format(filters.dateRange.endDate, 'MMM dd, yyyy');
      return `${start} - ${end}`;
    }
    return '';
  };

  // Helper functions
  const formatDate = (timestamp: any): string => {
    try {
      if (!timestamp) return 'Unknown';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatTime = (timestamp: any): string => {
    try {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'h:mm a');
    } catch (error) {
      return '';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; variant: 'danger' | 'success' | 'info' | 'warning' | 'secondary' }> = {
      live: { text: 'LIVE', variant: 'danger' },
      completed: { text: 'FT', variant: 'success' },
      scheduled: { text: 'Scheduled', variant: 'info' },
      postponed: { text: 'Postponed', variant: 'warning' },
      cancelled: { text: 'Cancelled', variant: 'secondary' }
    };
    
    const config = statusConfig[status] || { text: status, variant: 'secondary' as const };
    return <Badge text={config.text} variant={config.variant} />;
  };

  // Render match item with optimized layout
  const renderMatchItem = ({ item: match }: { item: Match }) => (
    <Card style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchDate}>{formatDate(match.date)}</Text>
          <Text style={styles.matchTime}>{formatTime(match.date)}</Text>
        </View>
        {getStatusBadge(match.status)}
      </View>
      
      <View style={styles.teamsContainer}>
        <View style={styles.teamSection}>
          <Text style={styles.teamName} numberOfLines={1}>{match.homeTeamName}</Text>
          {match.status === 'completed' && (
            <Text style={styles.score}>{match.homeScore || 0}</Text>
          )}
        </View>
        
        <Text style={styles.versus}>VS</Text>
        
        <View style={styles.teamSection}>
          <Text style={styles.teamName} numberOfLines={1}>{match.awayTeamName}</Text>
          {match.status === 'completed' && (
            <Text style={styles.score}>{match.awayScore || 0}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.matchDetails}>
        <Text style={styles.venue} numberOfLines={1}>
          <Feather name="map-pin" size={12} color="#666" /> {match.venue}
        </Text>
        <Text style={styles.competition} numberOfLines={1}>
          {match.competition}
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditMatch(match.id)}
        >
          <Feather name="edit-2" size={16} color="#2563eb" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteMatch(match)}
        >
          <Feather name="trash-2" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  // Filter section component
  const FilterSection = () => (
    <View style={styles.filterSection}>
      {/* Quick status filters */}
      <View style={styles.quickFilters}>
        {STATUS_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.quickFilterButton,
              filters.status === option.value && styles.quickFilterButtonActive
            ]}
            onPress={() => setFilters(prev => ({ ...prev, status: option.value }))}
          >
            <Text style={[
              styles.quickFilterText,
              filters.status === option.value && styles.quickFilterTextActive
            ]}>
              {option.label}
            </Text>
            <Text style={[
              styles.quickFilterCount,
              filters.status === option.value && styles.quickFilterCountActive
            ]}>
              {statusCounts[option.value as keyof StatusCounts] || 0}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Active Filters Display */}
      {(filters.teamIds.length > 0 || filters.leagueIds.length > 0 || filters.search || filters.dateRange.type !== 'all') && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
          <View style={styles.activeFiltersList}>
            
            {/* Search Filter */}
            {filters.search && (
              <View style={styles.activeFilter}>
                <Feather name="search" size={12} color="#2563eb" />
                <Text style={styles.activeFilterText}>"{filters.search}"</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setFilters(prev => ({ ...prev, search: '' }));
                    setSearchText('');
                  }}
                  style={styles.removeFilterButton}
                >
                  <Feather name="x" size={12} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {/* Date Range Filter */}
            {filters.dateRange.type === 'custom' && (
              <View style={styles.activeFilter}>
                <Feather name="calendar" size={12} color="#2563eb" />
                <Text style={styles.activeFilterText}>
                  {formatDateRange()}
                </Text>
                <TouchableOpacity 
                  onPress={clearDateRange}
                  style={styles.removeFilterButton}
                >
                  <Feather name="x" size={12} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {/* League Filters */}
            {filters.leagueIds.map(leagueId => {
              const league = leagues.find(l => l.id === leagueId);
              return league ? (
                <View key={leagueId} style={styles.activeFilter}>
                  <Feather name="award" size={12} color="#2563eb" />
                  <Text style={styles.activeFilterText}>{league.name}</Text>
                  <TouchableOpacity 
                    onPress={() => toggleLeagueSelection(leagueId)}
                    style={styles.removeFilterButton}
                  >
                    <Feather name="x" size={12} color="#666" />
                  </TouchableOpacity>
                </View>
              ) : null;
            })}

            {/* Team Filters */}
            {filters.teamIds.map(teamId => {
              const team = teams.find(t => t.id === teamId);
              return team ? (
                <View key={teamId} style={styles.activeFilter}>
                  <Feather name="users" size={12} color="#2563eb" />
                  <Text style={styles.activeFilterText}>
                    {team.shortName || team.name}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => toggleTeamSelection(teamId)}
                    style={styles.removeFilterButton}
                  >
                    <Feather name="x" size={12} color="#666" />
                  </TouchableOpacity>
                </View>
              ) : null;
            })}

            {/* Clear All Filters */}
            <TouchableOpacity 
              onPress={resetFilters}
              style={styles.clearAllFiltersButton}
            >
              <Text style={styles.clearAllFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Advanced filters button */}
      <TouchableOpacity 
        style={styles.advancedFilterButton}
        onPress={() => setShowFilters(true)}
      >
        <Feather name="filter" size={16} color="#2563eb" />
        <Text style={styles.advancedFilterText}>More Filters</Text>
        {(filters.teamIds.length > 0 || filters.leagueIds.length > 0 || filters.search || filters.dateRange.type !== 'all') && (
          <View style={styles.activeFilterIndicator} />
        )}
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (authLoading || (!hasCheckedAuth && isAdmin !== false)) {
    return (
      <LinearGradient colors={['#0047AB', '#191970', '#041E42']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Header title="Match Management" showBack={true} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>
              {authLoading ? 'Checking permissions...' : 'Loading matches...'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Access denied state
  if (!isAdmin || !hasCheckedAuth) {
    return null;
  }

  return (
    <LinearGradient colors={['#0047AB', '#191970', '#041E42']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Match Management" showBack={true} />
        
        <View style={styles.content}>
          {/* Header with create button and search */}
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>
                Matches ({filteredMatches.length}/{matches.length})
              </Text>
              <Button 
                title="Add Match" 
                onPress={handleCreateMatch}
                style={styles.createButton}
              />
            </View>
            
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search matches, teams, venues..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
              {searchText && searchText.length >= 3 && (
                <TouchableOpacity 
                  onPress={() => setSearchText('')}
                  style={styles.clearSearch}
                >
                  <Feather name="x" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <FilterSection />
          
          {/* Matches list */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading matches...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMatches}
              keyExtractor={(item) => item.id}
              renderItem={renderMatchItem}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#2563eb"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Feather name="calendar" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    {filters.status === 'all' ? 'No matches found' : `No ${filters.status} matches`}
                  </Text>
                  <Button 
                    title="Create First Match" 
                    onPress={handleCreateMatch}
                    style={styles.emptyButton}
                  />
                </View>
              }
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
            />
          )}
        </View>

        {/* Advanced Filters Modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Matches</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* League Filter */}
              <View style={styles.filterGroup}>
                <View style={styles.filterHeader}>
                  <Text style={styles.filterLabel}>Leagues ({filters.leagueIds.length} selected)</Text>
                  {filters.leagueIds.length > 0 && (
                    <TouchableOpacity onPress={clearAllLeagues} style={styles.clearAllButton}>
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.filterOptions}>
                  {leagues.map(league => (
                    <TouchableOpacity
                      key={league.id}
                      style={[
                        styles.filterOption,
                        filters.leagueIds.includes(league.id) && styles.filterOptionActive
                      ]}
                      onPress={() => toggleLeagueSelection(league.id)}
                    >
                      <View style={styles.filterOptionContent}>
                        <View style={styles.filterOptionLeft}>
                          <Text style={[
                            styles.filterOptionText,
                            filters.leagueIds.includes(league.id) && styles.filterOptionTextActive
                          ]}>{league.name}</Text>
                          <Text style={styles.filterOptionSubtext}>
                            {league.type || 'General'} - {league.division || 'Division'}
                          </Text>
                        </View>
                        {filters.leagueIds.includes(league.id) && (
                          <Feather name="check" size={20} color="white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Teams by League Type */}
              <View style={styles.filterGroup}>
                <View style={styles.filterHeader}>
                  <Text style={styles.filterLabel}>Teams ({filters.teamIds.length} selected)</Text>
                  {filters.teamIds.length > 0 && (
                    <TouchableOpacity onPress={clearAllTeams} style={styles.clearAllButton}>
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Grouped Teams */}
                {Object.entries(groupedTeams).map(([leagueType, groups]) => (
                  <View key={leagueType} style={styles.leagueTypeSection}>
                    <Text style={styles.leagueTypeHeader}>{leagueType}</Text>
                    
                    {groups.map(group => (
                      <View key={group.league.id} style={styles.leagueSection}>
                        <Text style={styles.leagueSectionHeader}>{group.league.name}</Text>
                        <View style={styles.teamsInLeague}>
                          {group.teams.map(team => (
                            <TouchableOpacity
                              key={team.id}
                              style={[
                                styles.teamFilterOption,
                                filters.teamIds.includes(team.id) && styles.teamFilterOptionActive
                              ]}
                              onPress={() => toggleTeamSelection(team.id)}
                            >
                              <View style={styles.teamFilterContent}>
                                <View style={styles.teamFilterLeft}>
                                  <Text style={[
                                    styles.teamFilterText,
                                    filters.teamIds.includes(team.id) && styles.teamFilterTextActive
                                  ]}>
                                    {team.name}
                                  </Text>
                                  {team.shortName && (
                                    <Text style={[
                                      styles.teamShortName,
                                      filters.teamIds.includes(team.id) && styles.teamShortNameActive
                                    ]}>({team.shortName})</Text>
                                  )}
                                </View>
                                {filters.teamIds.includes(team.id) && (
                                  <Feather name="check" size={16} color="white" />
                                )}
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
                
                {/* Teams without leagues */}
                {teams.filter(team => !team.leagueId).length > 0 && (
                  <View style={styles.leagueTypeSection}>
                    <Text style={styles.leagueTypeHeader}>Other Teams</Text>
                    <View style={styles.teamsInLeague}>
                      {teams
                        .filter(team => !team.leagueId)
                        .map(team => (
                          <TouchableOpacity
                            key={team.id}
                            style={[
                              styles.teamFilterOption,
                              filters.teamIds.includes(team.id) && styles.teamFilterOptionActive
                            ]}
                            onPress={() => toggleTeamSelection(team.id)}
                          >
                            <View style={styles.teamFilterContent}>
                              <View style={styles.teamFilterLeft}>
                                <Text style={[
                                  styles.teamFilterText,
                                  filters.teamIds.includes(team.id) && styles.teamFilterTextActive
                                ]}>
                                  {team.name}
                                </Text>
                                {team.shortName && (
                                  <Text style={[
                                    styles.teamShortName,
                                    filters.teamIds.includes(team.id) && styles.teamShortNameActive
                                  ]}>({team.shortName})</Text>
                                )}
                              </View>
                              {filters.teamIds.includes(team.id) && (
                                <Feather name="check" size={16} color="white" />
                              )}
                            </View>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>
                )}
              </View>
              
              {/* Date Range Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Date Range</Text>
                
                {/* Current Date Range Display */}
                {filters.dateRange.type === 'custom' && filters.dateRange.startDate && filters.dateRange.endDate && (
                  <View style={styles.currentDateRange}>
                    <Text style={styles.currentDateRangeText}>
                      Selected: {formatDateRange()}
                    </Text>
                    <TouchableOpacity onPress={clearDateRange} style={styles.clearDateButton}>
                      <Text style={styles.clearDateText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Date Range Selection */}
                <View style={styles.dateRangeContainer}>
                  <View style={styles.datePickerRow}>
                    <View style={styles.datePickerColumn}>
                      <Text style={styles.datePickerLabel}>Start Date</Text>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowStartDatePicker(true)}
                      >
                        <Feather name="calendar" size={16} color="#2563eb" />
                        <Text style={styles.datePickerButtonText}>
                          {filters.dateRange.startDate 
                            ? format(filters.dateRange.startDate, 'MMM dd, yyyy')
                            : 'Select start date'
                          }
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.datePickerColumn}>
                      <Text style={styles.datePickerLabel}>End Date</Text>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowEndDatePicker(true)}
                      >
                        <Feather name="calendar" size={16} color="#2563eb" />
                        <Text style={styles.datePickerButtonText}>
                          {filters.dateRange.endDate 
                            ? format(filters.dateRange.endDate, 'MMM dd, yyyy')
                            : 'Select end date'
                          }
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Quick Date Range Options */}
                  <View style={styles.quickDateOptions}>
                    <Text style={styles.quickDateLabel}>Quick Options:</Text>
                    <View style={styles.quickDateButtons}>
                      <TouchableOpacity
                        style={styles.quickDateButton}
                        onPress={() => {
                          const today = new Date();
                          setDateRange(today, today);
                        }}
                      >
                        <Text style={styles.quickDateButtonText}>Today</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.quickDateButton}
                        onPress={() => {
                          const today = new Date();
                          const weekAgo = new Date(today);
                          weekAgo.setDate(today.getDate() - 7);
                          setDateRange(weekAgo, today);
                        }}
                      >
                        <Text style={styles.quickDateButtonText}>Last 7 Days</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.quickDateButton}
                        onPress={() => {
                          const today = new Date();
                          const monthAgo = new Date(today);
                          monthAgo.setDate(today.getDate() - 30);
                          setDateRange(monthAgo, today);
                        }}
                      >
                        <Text style={styles.quickDateButtonText}>Last 30 Days</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.quickDateButton}
                        onPress={() => {
                          const today = new Date();
                          const nextMonth = new Date(today);
                          nextMonth.setDate(today.getDate() + 30);
                          setDateRange(today, nextMonth);
                        }}
                      >
                        <Text style={styles.quickDateButtonText}>Next 30 Days</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button 
                title="Reset Filters" 
                onPress={resetFilters}
                style={styles.resetButton}
                variant="outline"
              />
              <Button 
                title="Apply & Close" 
                onPress={() => setShowFilters(false)}
                style={styles.applyButton}
              />
            </View>
          </SafeAreaView>
        </Modal>

        {/* Date Range Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={filters.dateRange.startDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setFilters(prev => ({
                  ...prev,
                  dateRange: {
                    type: 'custom' as const,
                    startDate: selectedDate,
                    endDate: prev.dateRange.endDate
                  }
                }));
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={filters.dateRange.endDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={filters.dateRange.startDate}
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setFilters(prev => ({
                  ...prev,
                  dateRange: {
                    type: 'custom' as const,
                    startDate: prev.dateRange.startDate,
                    endDate: selectedDate
                  }
                }));
              }
            }}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 16,
  },
  headerSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearSearch: {
    padding: 4,
  },
  filterSection: {
    marginBottom: 16,
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickFilterButtonActive: {
    backgroundColor: 'white',
  },
  quickFilterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  quickFilterTextActive: {
    color: '#2563eb',
  },
  quickFilterCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickFilterCountActive: {
    color: '#2563eb',
  },
  advancedFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  advancedFilterText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  activeFilterIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  // Active filters display styles
  activeFiltersContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  activeFiltersTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  activeFiltersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeFilterText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 100,
  },
  removeFilterButton: {
    padding: 2,
  },
  clearAllFiltersButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllFiltersText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  matchCard: {
    marginBottom: 12,
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  matchTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginLeft: 8,
  },
  versus: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 12,
    fontWeight: '500',
  },
  matchDetails: {
    marginBottom: 12,
  },
  venue: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  competition: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  clearAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  filterOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterOptionLeft: {
    flex: 1,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  filterOptionTextActive: {
    color: 'white',
  },
  filterOptionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // League grouping styles
  leagueTypeSection: {
    marginBottom: 20,
  },
  leagueTypeHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  leagueSection: {
    marginBottom: 15,
    paddingLeft: 8,
  },
  leagueSectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  teamsInLeague: {
    paddingLeft: 8,
  },
  teamFilterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginVertical: 2,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  teamFilterOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  teamFilterContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamFilterLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamFilterText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  teamFilterTextActive: {
    color: 'white',
  },
  teamShortName: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  teamShortNameActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  // Date range picker styles
  currentDateRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentDateRangeText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  clearDateButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearDateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  dateRangeContainer: {
    gap: 16,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerColumn: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  datePickerButtonText: {
    color: '#333',
    fontSize: 14,
    flex: 1,
  },
  quickDateOptions: {
    marginTop: 8,
  },
  quickDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  quickDateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickDateButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quickDateButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});