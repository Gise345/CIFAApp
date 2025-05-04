import React from 'react';
import { View, StyleSheet } from 'react-native';
import Section from '../common/Section';
import NewsCard from '../news/NewsCard';
import NewsCardSmall from '../news/NewsCardSmall';

interface NewsListProps {
  onViewAll?: () => void;
}

const NewsList: React.FC<NewsListProps> = ({ onViewAll }) => {
  // This would come from Firebase in production
  const featuredNews = {
    id: 'news1',
    title: 'Cayman Islands Announces Squad for World Cup Qualifiers',
    category: 'NATIONAL TEAM',
    image: require('../../../assets/images/grey-air.jpg'),
    timeAgo: '2 hours ago',
  };

  const otherNews = [
    {
      id: 'news2',
      title: 'Elite SC Remains Undefeated',
      category: "MEN'S PREMIER LEAGUE",
      image: '/path/to/image',
    },
    {
      id: 'news3',
      title: 'Scholars Lead League Table',
      category: "WOMEN'S PREMIER LEAGUE",
      image: '/path/to/image',
    },
  ];

  return (
    <Section title="LATEST NEWS" viewAllText="View all" onViewAll={onViewAll}>
      <View style={styles.container}>
        <NewsCard 
          id={featuredNews.id}
          title={featuredNews.title}
          category={featuredNews.category}
          imageUrl={featuredNews.image}
          timeAgo={featuredNews.timeAgo}
          style={styles.featuredNews}
        />
        
        <View style={styles.smallNewsContainer}>
          {otherNews.map(news => (
            <NewsCardSmall
              key={news.id}
              id={news.id}
              title={news.title}
              category={news.category}
              imageUrl={news.image}
              style={styles.smallNews}
            />
          ))}
        </View>
      </View>
    </Section>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  featuredNews: {
    marginBottom: 8,
  },
  smallNewsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallNews: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default NewsList;