import React from 'react';
import { render } from '@testing-library/react-native';
import Toast from '../../../components/ui/Toast';

describe('Toast', () => {
  it('renders message when visible', () => {
    const { getByText } = render(
      <Toast message="테스트 메시지" visible onHide={() => {}} />
    );
    expect(getByText('테스트 메시지')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <Toast message="숨김" visible={false} onHide={() => {}} />
    );
    expect(queryByText('숨김')).toBeNull();
  });

  it('renders with different types', () => {
    const { getByText, rerender } = render(
      <Toast message="성공" type="success" visible onHide={() => {}} />
    );
    expect(getByText('성공')).toBeTruthy();

    rerender(<Toast message="에러" type="error" visible onHide={() => {}} />);
    expect(getByText('에러')).toBeTruthy();
  });
});
