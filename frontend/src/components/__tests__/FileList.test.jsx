import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FileList from '../FileStorage/FileList.jsx';
import * as fileService from '../services/fileService.js';
import FileUpload from '../FileStorage/FileUpload.jsx'; 
import FileActions from '../FileStorage/FileActions.jsx'; 

jest.mock('../services/fileService', () => ({
  getFiles: jest.fn(),
  deleteFile: jest.fn(),
  downloadFile: jest.fn(),
}));

jest.mock('../FileStorage/FileUpload', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="file-upload">FileUpload Mock</div>),
}));

jest.mock('../FileStorage/FileActions', () => ({
  __esModule: true,
  default: jest.fn(({ file, onDelete, onDownload, userId }) => (
    <div data-testid="file-actions">
      FileActions Mock
      <button onClick={() => onDelete(file.id)} data-testid={`delete-button-${file.id}`}>
        Удалить
      </button>
      <button onClick={() => onDownload(file.id)} data-testid={`download-button-${file.id}`}>
        Скачать
      </button>
    </div>
  )),
}));

const mockFiles = [
  {
    id: 1,
    origin_name: 'test1.txt',
    comment: 'Test file 1',
    size: 1024,
    upload_date: '2025-11-14T10:00:00Z',
  },
  {
    id: 2,
    origin_name: 'test2.txt',
    comment: 'Test file 2',
    size: 2048,
    upload_date: '2025-11-14T11:00:00Z',
  },
];

describe('Компонент FileList', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('отображает состояние загрузки изначально', () => {
    render(
      <MemoryRouter initialEntries={['/files?user_id=123']}>
        <Routes>
          <Route path="/files" element={<FileList />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Загрузка...', { hidden: true })).toBeInTheDocument();
  });

  it('корректно получает и отображает файлы', async () => {
    fileService.getFiles.mockResolvedValue({ results: mockFiles });

    render(
      <MemoryRouter initialEntries={['/files?user_id=123']}>
        <Routes>
          <Route path="/files" element={<FileList />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fileService.getFiles).toHaveBeenCalledWith('123');
      expect(screen.getByText('test1.txt')).toBeInTheDocument();
      expect(screen.getByText('Test file 1')).toBeInTheDocument();
      expect(screen.getByText('test2.txt')).toBeInTheDocument();
      expect(screen.getByText('Test file 2')).toBeInTheDocument();
    });
  });

  it('отображает сообщение об ошибке при неудачной загрузке файлов', async () => {
    fileService.getFiles.mockRejectedValue(new Error('Failed to fetch files'));

    render(
      <MemoryRouter initialEntries={['/files?user_id=123']}>
        <Routes>
          <Route path="/files" element={<FileList />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Не удалось загрузить список файлов.')).toBeInTheDocument();
    });
  });

  it('вызывает deleteFile и перезагружает файлы при handleDeleteFiles', async () => {
    fileService.getFiles.mockResolvedValue({ results: mockFiles });
    fileService.deleteFile.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={['/files?user_id=123']}>
        <Routes>
          <Route path="/files" element={<FileList />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fileService.getFiles).toHaveBeenCalledWith('123');
      expect(screen.getByText('test1.txt')).toBeInTheDocument();
    });

    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-button-1');
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(fileService.deleteFile).toHaveBeenCalledWith(1);
      expect(fileService.getFiles).toHaveBeenCalledTimes(2); // Вызван один раз изначально и еще раз после удаления
    });
  });

  it('отображает сообщение об ошибке при неудачном удалении файла', async () => {
    fileService.getFiles.mockResolvedValue({ results: mockFiles });
    fileService.deleteFile.mockRejectedValue(new Error('Failed to delete file'));

    render(
      <MemoryRouter initialEntries={['/files?user_id=123']}>
        <Routes>
          <Route path="/files" element={<FileList />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-button-1');
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(fileService.deleteFile).toHaveBeenCalledWith(1);
      expect(screen.getByText('Не удалось удалить файл.')).toBeInTheDocument();
    });
  });

  it('вызывает downloadFile при handleDownloadFiles', async () => {
    fileService.getFiles.mockResolvedValue({ results: mockFiles });
    fileService.downloadFile.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={['/files?user_id=123']}>
        <Routes>
          <Route path="/files" element={<FileList />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const downloadButton = screen.getByTestId('download-button-1');
      expect(downloadButton).toBeInTheDocument();
      fireEvent.click(downloadButton);
    });

    await waitFor(() => {
      expect(fileService.downloadFile).toHaveBeenCalledWith(1);
    });
  });

  it('отображает сообщение об ошибке при неудачном скачивании файла', async () => {
    fileService.getFiles.mockResolvedValue({ results: mockFiles });
    fileService.downloadFile.mockRejectedValue(new Error('Failed to download file'));

    render(
      <MemoryRouter initialEntries={['/files?user_id=123']}>
        <Routes>
          <Route path="/files" element={<FileList />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const downloadButton = screen.getByTestId('download-button-1');
      expect(downloadButton).toBeInTheDocument();
      fireEvent.click(downloadButton);
    });

    await waitFor(() => {
      expect(fileService.downloadFile).toHaveBeenCalledWith(1);
      expect(screen.getByText('Не удалось скачать файл.')).toBeInTheDocument();
    });
  });

  it('отображает компоненты FileUpload и FileActions', async () => {
    fileService.getFiles.mockResolvedValue({ results: mockFiles });

    render(
      <MemoryRouter initialEntries={['/files?user_id=123']}>
        <Routes>
          <Route path="/files" element={<FileList />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('file-upload')).toBeInTheDocument());
    await waitFor(() => {
      const fileActionElements = screen.getAllByTestId('file-actions');
      expect(fileActionElements.length).toBeGreaterThan(0); 
      expect(fileActionElements[0]).toBeInTheDocument(); 
      fileActionElements.forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });
  });
});
