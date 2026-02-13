import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import type { CategoryExpense } from '../types';

interface PieChartProps {
  data: CategoryExpense[];
  size?: number;
}

const COLORS = [
  '#448AFF', '#00D09E', '#FFB340', '#FF5252',
  '#8B5CF6', '#EC4899', '#F97316', '#6366F1'
];

export const PieChart: React.FC<PieChartProps> = ({ data, size = 220 }) => {
  const innerRadius = size / 3;
  const outerRadius = (size / 2) - 16;
  const centerX = size / 2;
  const centerY = size / 2;

  if (data.length === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={(outerRadius - innerRadius)}
          />
        </Svg>
        <View style={styles.centerText}>
          <Text style={styles.emptyText}>Aucune donnée</Text>
        </View>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.spent, 0);
  let startAngle = -90;

  const slices = data.map((item, index) => {
    const percentage = item.spent / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
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
    color: '#64748B',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
