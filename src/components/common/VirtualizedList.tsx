// src/components/common/VirtualizedList.tsx
import React, { useMemo, useCallback } from 'react';
import { VirtualizedList, ViewToken } from 'react-native';

interface VirtualizedMatchListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  itemHeight: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onViewableItemsChanged?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export function VirtualizedMatchList<T>({
  data,
  renderItem,
  itemHeight,
  onEndReached,
  onEndReachedThreshold = 0.1,
  onViewableItemsChanged,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
}: VirtualizedMatchListProps<T>) {
  const getItem = useCallback((data: T[], index: number) => data[index], []);
  const getItemCount = useCallback((data: T[]) => data.length, []);
  const keyExtractor = useCallback((item: any, index: number) => item?.id || String(index), []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }), []);

  if (data.length === 0 && ListEmptyComponent) {
    if (React.isValidElement(ListEmptyComponent)) {
      return ListEmptyComponent;
    }
    if (typeof ListEmptyComponent === 'function') {
      const Component = ListEmptyComponent;
      return <Component />;
    }
    return null;
  }

  return (
    <VirtualizedList
      data={data}
      initialNumToRender={10}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemCount={getItemCount}
      getItem={getItem}
      getItemLayout={getItemLayout}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      updateCellsBatchingPeriod={50}
    />
  );
}