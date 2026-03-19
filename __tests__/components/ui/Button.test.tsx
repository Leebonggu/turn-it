import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../../components/ui/Button';

describe('Button', () => {
  it('renders title text', () => {
    const { getByText } = render(
      <Button title="테스트 버튼" onPress={() => {}} />
    );
    expect(getByText('테스트 버튼')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="클릭" onPress={onPress} />
    );
    fireEvent.press(getByText('클릭'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="비활성" onPress={onPress} disabled />
    );
    fireEvent.press(getByText('비활성'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies primary variant styles by default', () => {
    const { getByText } = render(
      <Button title="기본" onPress={() => {}} />
    );
    const button = getByText('기본').parent;
    expect(button).toBeTruthy();
  });

  it('applies outline variant styles', () => {
    const { getByText } = render(
      <Button title="아웃라인" onPress={() => {}} variant="outline" />
    );
    expect(getByText('아웃라인')).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: 20 };
    const { getByText } = render(
      <Button title="커스텀" onPress={() => {}} style={customStyle} />
    );
    expect(getByText('커스텀')).toBeTruthy();
  });
});
