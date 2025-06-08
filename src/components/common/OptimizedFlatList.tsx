// src/components/common/OptimizedFlatList.tsx
import React, { useCallback, useMemo } from 'react';
import { FlatList, FlatListProps, ViewToken } from 'react-native';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  itemHeight?: number;
  onViewableItemsChanged?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
}

export function OptimizedFlatList<T>({
  data,
  renderItem,
  itemHeight,
  onViewableItemsChanged,
  ...props
}: OptimizedFlatListProps<T>) {
  // Memoize the render item function
  const memoizedRenderItem = useCallback(renderItem, [renderItem]);

  // Memoize key extractor
  const keyExtractor = useCallback((item: any, index: number) => {
    return item.id || item._id || String(index);
  }, []);

  // Optimize getItemLayout if itemHeight is provided
  const getItemLayout = useMemo(() => {
    if (!itemHeight) return undefined;
    return (data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [itemHeight]);

  // Optimize viewability config
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }), []);

  const onViewableItemsChangedCallback = useCallback(
    onViewableItemsChanged || (() => {}),
    [onViewableItemsChanged]
  );

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChangedCallback}
      {...props}
    />
  );
}