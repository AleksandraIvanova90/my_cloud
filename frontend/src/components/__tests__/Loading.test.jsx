import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../common/Loading.jsx';

describe('Loading Component', () => {
  it('renders the loading spinner correctly', () => {
    render(<Loading />);

    const spinnerElement = screen.getByRole('status');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveClass('spinner-border');

    const loadingText = screen.getByText('Загрузка...');
    expect(loadingText).toBeInTheDocument();
    expect(loadingText).toHaveClass('visually-hidden');
  });
});