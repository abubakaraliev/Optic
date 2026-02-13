import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import type { CategoryExpense } from '../types';

interface PieChartProps {
  data: CategoryExpense[];
  size?: number;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

export const PieChart: React.FC<PieChartProps> = ({ data, size = 200 }) => {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth={20}
          />
        </Svg>
        <View style={styles.centerText}>
          <Text style={styles.emptyText}>Aucune donnée</Text>
        </View>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.spent, 0);
  const radius = (size / 2) - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  let startAngle = -90;

  const slices = data.map((item, index) => {
    const percentage = item.spent / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    startAngle = endAngle;

    return (
      <Path
        key={item.categoryId}
        d={pathData}
        fill={COLORS[index % COLORS.length]}
      />
    );
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>{slices}</G>
      </Svg>
      <View style={styles.centerText}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{total.toFixed(0)}€</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
