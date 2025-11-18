import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams, useNavigate, useLocation } from 'react-router-dom';
import SpecialLink from '../FileStorage/SpecialLink.jsx';
import * as fileService from '../services/fileService.js';


const originalAlert = window.alert;

beforeAll(() => {
  window.alert = jest.fn();
});

afterAll(() => {
  window.alert = originalAlert;
});

beforeEach(() => {
  window.alert.mockClear();
  fileService.getSpecialLink.mockClear();
  navigator.clipboard.writeText.mockClear(); 
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock('../services/fileService', () => ({
  getSpecialLink: jest.fn(),
}));

const mockClipboard = {
  writeText: jest.fn(), 
};
global.navigator.clipboard = mockClipboard;

describe('Компонент SpecialLink', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(navigate);
  });

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);

    return render(ui, { wrapper: MemoryRouter });
  };

  it('отображает состояние загрузки изначально', () => {
    useParams.mockReturnValue({ id: '123' });
    useLocation.mockReturnValue({ search: '?userId=456' });

    renderWithRouter(<SpecialLink />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('корректно получает и отображает специальную ссылку', async () => {
    useParams.mockReturnValue({ id: '123' });
    useLocation.mockReturnValue({ search: '?userId=456' });
    fileService.getSpecialLink.mockResolvedValue({ special_link: 'http://example.com/special/123' });

    renderWithRouter(<SpecialLink />);

    await waitFor(() => {
      expect(fileService.getSpecialLink).toHaveBeenCalledWith('123');
      expect(screen.getByLabelText('Ссылка:')).toHaveValue('http://example.com/special/123');
    });
  });

  it('отображает сообщение об ошибке при неудачной загрузке специальной ссылки', async () => {
    useParams.mockReturnValue({ id: '123' });
    useLocation.mockReturnValue({ search: '?userId=456' });
    fileService.getSpecialLink.mockRejectedValue(new Error('Произошла ошибка при получении специальной ссылки.'));

    renderWithRouter(<SpecialLink />);

    await waitFor(() => {
      expect(screen.getByText('Произошла ошибка при получении специальной ссылки.')).toBeInTheDocument();
    });
  });

  it('вызывает navigate при нажатии на кнопку "Назад к файлам"', async () => {
    useParams.mockReturnValue({ id: '123' });
    useLocation.mockReturnValue({ search: '?userId=456' });
    fileService.getSpecialLink.mockRejectedValue(new Error('Failed to fetch special link'));

    renderWithRouter(<SpecialLink />);

    await waitFor(() => {
      const backButton = screen.getByText('Назад к файлам');
      fireEvent.click(backButton);
      expect(navigate).toHaveBeenCalledWith('/files?user_id=456');
    });
  });

  it('вызывает navigate при нажатии на кнопку "Назад"', async () => {
    useParams.mockReturnValue({ id: '123' });
    useLocation.mockReturnValue({ search: '?userId=456' });
    fileService.getSpecialLink.mockResolvedValue({ special_link: 'http://example.com/special/123' });

    renderWithRouter(<SpecialLink />);

    await waitFor(() => {
      const backButton = screen.getByText('Назад');
      fireEvent.click(backButton);
      expect(navigate).toHaveBeenCalledWith('/files?user_id=456');
    });
  });

it('копирует ссылку в буфер обмена при нажатии на кнопку "Копировать ссылку"', async () => {
    useParams.mockReturnValue({ id: '123' });
    useLocation.mockReturnValue({ search: '?userId=456' });
    fileService.getSpecialLink.mockResolvedValue({ special_link: 'http://example.com/special/123' });

    navigator.clipboard.writeText.mockResolvedValueOnce(); 

    renderWithRouter(<SpecialLink />);

    const copyButton = await screen.findByText('Копировать ссылку');

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://example.com/special/123');
      expect(window.alert).toHaveBeenCalledWith('Ссылка скопирована в буфер обмена!');
    });
  });

  it('показывает сообщение об ошибке, если копирование не удалось', async () => {
    useParams.mockReturnValue({ id: '123' });
    useLocation.mockReturnValue({ search: '?userId=456' });
    fileService.getSpecialLink.mockResolvedValue({ special_link: 'http://example.com/special/123' });

    const errorMessage = new Error('Ошибка копирования');
    navigator.clipboard.writeText.mockRejectedValueOnce(errorMessage);

    renderWithRouter(<SpecialLink />);

    const copyButton = await screen.findByText('Копировать ссылку');

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://example.com/special/123');
      expect(screen.getByText('Не удалось скопировать ссылку: проблемы с буфером обмена.')).toBeInTheDocument();
      expect(window.alert).not.toHaveBeenCalled(); 
    });
  });


  it('отображает сообщение об ошибке, если не удалось скопировать ссылку', async () => {
    useParams.mockReturnValue({ id: '123' });
    useLocation.mockReturnValue({ search: '?userId=456' });
    fileService.getSpecialLink.mockResolvedValue({ special_link: 'http://example.com/special/123' });
    mockClipboard.writeText.mockRejectedValue(new Error('Failed to copy'));
    jest.spyOn(window, 'alert').mockImplementation(() => {}); 

    renderWithRouter(<SpecialLink />);

    await waitFor(() => {
       const copyButton = screen.getByText('Копировать ссылку');
       fireEvent.click(copyButton);
    });

    await waitFor(() => {
        expect(screen.getByText('Не удалось скопировать ссылку: проблемы с буфером обмена.')).toBeInTheDocument();
        window.alert.mockRestore();
    });
  });

  it('кнопка "Копировать" отключена, если специальной ссылки нет.', async () => {
     useParams.mockReturnValue({ id: '123' });
     useLocation.mockReturnValue({ search: '?userId=456' });
     fileService.getSpecialLink.mockResolvedValue({ special_link: '' });

     renderWithRouter(<SpecialLink />);

     await waitFor(() => {
        const copyButton = screen.getByText('Копировать ссылку');
        expect(copyButton).toBeDisabled();
     });
  });
});
