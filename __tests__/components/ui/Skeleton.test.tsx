import React from 'react';
import { render } from '@testing-library/react-native';
import Skeleton from '../../../components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<Skeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom dimensions', () => {
    const { toJSON } = render(<Skeleton width={200} height={24} />);
    expect(toJSON()).toBeTruthy();
  });
});
