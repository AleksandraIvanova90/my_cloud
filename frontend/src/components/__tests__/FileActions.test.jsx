import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom'
import FileActions from '../FileStorage/FileActions.jsx';

jest.mock('../common/ErrorMessage', () => {
  return function MockErrorMessage({ message }) {
    return <div data-testid="error-message">{message}</div>;
  };
});

describe('FileActions Component', () => {
  const file = { id: '123', name: 'test.txt' };
  const userId = '456';
  const onDelete = jest.fn();
  const onDownload = jest.fn();

  beforeEach(() => {
    onDelete.mockClear();
    onDownload.mockClear();
    window.confirm = jest.fn(() => true); 
  });

  it('renders all buttons with correct labels', () => {
    render(
      <MemoryRouter>
        <FileActions file={file} onDelete={onDelete} onDownload={onDownload} userId={userId} />
      </MemoryRouter>
    );

    expect(screen.getByText('Редактировать')).toBeInTheDocument();
    expect(screen.getByText('Скачать')).toBeInTheDocument();
    expect(screen.getByText('Поделиться')).toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
  });

  it('calls onDelete when "Удалить" button is clicked', async () => {
    render(
      <MemoryRouter>
        <FileActions file={file} onDelete={onDelete} onDownload={onDownload} userId={userId} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByText('Удалить');
    fireEvent.click(deleteButton);

    await Promise.resolve(); 

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(file.id);
  });

  it('calls onDownload when "Скачать" button is clicked', async () => {
    render(
      <MemoryRouter>
        <FileActions file={file} onDelete={onDelete} onDownload={onDownload} userId={userId} />
      </MemoryRouter>
    );

    const downloadButton = screen.getByText('Скачать');
    fireEvent.click(downloadButton);

    await Promise.resolve();

    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledWith(file.id);
  });

  it('renders the correct edit link', () => {
        render(
            <MemoryRouter initialEntries={['/']}> 
                <FileActions file={file} onDelete={onDelete} onDownload={onDownload} userId={userId} />
            </MemoryRouter>
        );

        const editLink = screen.getByText('Редактировать');
        expect(editLink).toHaveAttribute('href', `/files/${file.id}/edit?userId=${userId}`);
    });

 it('renders the correct share link', () => {
   
    render(
      <MemoryRouter initialEntries={['/']}> 
        <FileActions file={file} onDelete={onDelete} onDownload={onDownload} userId={userId} />
      </MemoryRouter>
    );

    
    const shareLink = screen.getByText('Поделиться'); 
    expect(shareLink).toHaveAttribute('href', `/files/${file.id}/special_link?userId=${userId}`);
  });

});




