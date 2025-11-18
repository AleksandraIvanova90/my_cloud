import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../Home.jsx';

describe('Home Component', () => {
  it('renders the main heading', () => {
    render(<Home />);
    const headingElement = screen.getByRole('heading', {
      name: /My Cloud: Ваше персональное облачное пространство/i,
    });
    expect(headingElement).toBeInTheDocument();
  });

  it('renders the introductory paragraph with strong tag', () => {
      render(<Home />);
      const paragraphElement = screen.getByTestId('introductory-paragraph');
      expect(paragraphElement).toBeInTheDocument();
});
  

  it('renders the "Возможности My Cloud" heading', () => {
    render(<Home />);
    const headingCapabilitiesElement = screen.getByRole('heading', {
      name: /Возможности My Cloud:/i,
    });
    expect(headingCapabilitiesElement).toBeInTheDocument();
  });

  it('renders the list of cloud features', () => {
    render(<Home />);
    const listItems = screen.getAllByRole('listitem'); 
    expect(listItems.length).toBe(10); 
    const firstListItem = screen.getByText(/Централизованное хранилище:/i);
    expect(firstListItem).toBeInTheDocument();
  });

  it('renders the "My Cloud – это больше, чем просто облачное хранилище" heading', () => {
    render(<Home />);
    const headingMoreThanStorageElement = screen.getByRole('heading', {
      name: /My Cloud – это больше, чем просто облачное хранилище/i,
    });
    expect(headingMoreThanStorageElement).toBeInTheDocument();
  });

  it('renders the second ul list with strong tag', () => {
    render(<Home />);
    const listItems = screen.getAllByRole('listitem'); 
    expect(listItems.length).toBe(7+3); 
    const firstListItem = screen.getByText(/Оптимизировать рабочие процессы:/i);
    expect(firstListItem).toBeInTheDocument();
      });

  it('renders the closing paragraph with strong tag', () => {
    render(<Home />);
    const paragraphElement = screen.getByTestId('closing-paragraph');
    expect(paragraphElement).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<Home />);
    const containerElement = screen.getByText(/My Cloud: Ваше персональное облачное пространство/i).closest('div');
    expect(containerElement).toHaveClass('container home-container');
    const headingElement = screen.getByRole('heading', {
      name: /My Cloud: Ваше персональное облачное пространство/i,
    });
    expect(headingElement).toHaveClass('display-4');
  });
});
