import React from 'react';
import { render, screen, waitFor, fireEvent, within} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import FileEdit from '../FileStorage/FileEdit.jsx';
import * as fileService from '../services/fileService.js';


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), 
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  useLocation: jest.fn()
}));


jest.mock('../services/fileService', () => ({
  getFileData: jest.fn(),
  renameFile: jest.fn(),
  editComment: jest.fn()
}));

describe('FileEdit Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ id: '123' });
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({
      search: '?userId=456',
      pathname: '/files/123/edit',
    });
  });

  it('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/files/123/edit?userId=456']}>
        <FileEdit />
      </MemoryRouter>
    );
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('fetches and displays file data', async () => {
    fileService.getFileData.mockResolvedValue({ origin_name: 'test.txt', comment: 'Test comment' });

    render(
      <MemoryRouter initialEntries={['/files/123/edit?userId=456']}>
        <FileEdit />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Имя файла:')).toHaveValue('test.txt');
      expect(screen.getByLabelText('Комментарий:')).toHaveValue('Test comment');
    });
  });

  it('displays an error message when getFileData fails', async () => {
    fileService.getFileData.mockRejectedValue(new Error('Failed to fetch data'));

    render(
      <MemoryRouter initialEntries={['/files/123/edit?userId=456']}>
        <FileEdit />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ошибка: Не удалось загрузить данные файла.')).toBeInTheDocument();
    });
  });

  it('calls renameFile when "Сохранить" button for filename is clicked', async () => {
    fileService.getFileData.mockResolvedValue({ origin_name: 'test.txt', comment: 'Test comment' });
    fileService.renameFile.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={['/files/123/edit?userId=456']}>
        <FileEdit />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Имя файла:')).toHaveValue('test.txt');
    });

    const fileNameInput = screen.getByLabelText('Имя файла:');
    fireEvent.change(fileNameInput, { target: { value: 'new_name.txt' } });

    const fileNameSection = fileNameInput.closest('div.mb-3'); 
    const saveFileNameButton = within(fileNameSection).getByRole('button', { name: 'Сохранить' });

    fireEvent.click(saveFileNameButton);

    await waitFor(() => {
      expect(fileService.renameFile).toHaveBeenCalledWith('123', 'new_name.txt');
    });
  });

  it('calls editComment when "Сохранить" button for comment is clicked', async () => {
    fileService.getFileData.mockResolvedValue({ origin_name: 'test.txt', comment: 'Test comment' });
    fileService.editComment.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={['/files/123/edit?userId=456']}>
        <FileEdit />
      </MemoryRouter>
    );

     await waitFor(() => {
       expect(screen.getByLabelText('Комментарий:')).toHaveValue('Test comment');
     });

    const commentInput = screen.getByLabelText('Комментарий:');
    fireEvent.change(commentInput, { target: { value: 'New comment' } });

    const saveButton = screen.getAllByText('Сохранить')[1]; 

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fileService.editComment).toHaveBeenCalledWith('123', 'New comment');
    });
  });

  it('navigates to the files page when "Выйти" button is clicked', async () => { 
    render(
      <MemoryRouter initialEntries={['/files/123/edit?userId=456']}>
        <FileEdit />
      </MemoryRouter>
    );

    const exitButton = await screen.findByText('Выйти');
    fireEvent.click(exitButton);

    expect(mockNavigate).toHaveBeenCalledWith('/files?user_id=456');
  });
});
