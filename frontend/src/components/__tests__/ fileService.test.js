import {
  getFiles,
  getFileData,
  editComment,
  renameFile,
  uploadFile,
  deleteFile,
  downloadFile,
  getSpecialLink,
} from '../services/fileService'

global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost:3000/1234-5678-90ab');
global.URL.revokeObjectURL = jest.fn();
global.document.createElement = jest.fn(() => ({
  href: '',
  download: '',
  click: jest.fn(),
  remove: jest.fn(),
}));

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

const createFetchResponse = (data, ok = true, status = 200, statusText = 'OK', headers = {}) => {
  return Promise.resolve({
    ok,
    status,
    statusText,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
    headers: {
      get: (name) => headers[name] || null,
    },
  });
};

describe('fileService', () => {
  const MOCK_TOKEN = 'mock_token_123';

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', MOCK_TOKEN);
    global.fetch = jest.fn();
    global.window.location.href = 'http://localhost'; 
    global.document.body.appendChild = jest.fn(); 
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('getFiles', () => {
    it('должен успешно получать файлы без userId', async () => {
      const mockFiles = [{
        id: 1,
        name: 'file1.txt'
      }, {
        id: 2,
        name: 'file2.jpg'
      }];
      global.fetch.mockImplementationOnce(() => createFetchResponse(mockFiles));

      const files = await getFiles();
      expect(files).toEqual(mockFiles);
      expect(global.fetch).toHaveBeenCalledWith('/api/files/list', {
        headers: {
          Authorization: `Token ${MOCK_TOKEN}`,
        },
      });
    });

    it('должен успешно получать файлы с userId', async () => {
      const mockFiles = [{
        id: 3,
        name: 'user_file.pdf'
      }];
      global.fetch.mockImplementationOnce(() => createFetchResponse(mockFiles));

      const userId = 5;
      const files = await getFiles(userId);
      expect(files).toEqual(mockFiles);
      expect(global.fetch).toHaveBeenCalledWith(`/api/files/list?user_id=${userId}`, {
        headers: {
          Authorization: `Token ${MOCK_TOKEN}`,
        },
      });
    });

    it('должен выбрасывать ошибку, если запрос getFiles не успешен', async () => {
      const errorMessage = 'Failed to fetch files';
      global.fetch.mockImplementationOnce(() => createFetchResponse({
        detail: errorMessage
      }, false, 400));

      await expect(getFiles()).rejects.toThrow(JSON.stringify({
        detail: errorMessage
      }));
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('должен выбрасывать ошибку, если нет токена', async () => {
      localStorage.removeItem('token');
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      await expect(getFiles()).rejects.toThrow('Network error'); 
    });
  });

  
  describe('getFileData', () => {
    it('должен успешно получать данные файла по ID', async () => {
      const mockFileData = {
        id: 1,
        name: 'test.txt',
        comment: 'some comment'
      };
      global.fetch.mockImplementationOnce(() => createFetchResponse(mockFileData));

      const fileData = await getFileData(1);
      expect(fileData).toEqual(mockFileData);
      expect(global.fetch).toHaveBeenCalledWith('/api/files/1/', {
        headers: {
          Authorization: `Token ${MOCK_TOKEN}`,
        },
      });
    });

    it('должен выбрасывать ошибку, если запрос getFileData не успешен', async () => {
      const errorMessage = 'File not found';
      global.fetch.mockImplementationOnce(() => createFetchResponse({
        detail: errorMessage
      }, false, 404));

      await expect(getFileData(999)).rejects.toThrow(JSON.stringify({
        detail: errorMessage
      }));
    });
  });

 
  describe('uploadFile', () => {
    it('должен успешно загружать файл', async () => {
      const mockUploadedFile = {
        id: 1,
        name: 'new_file.txt'
      };
      global.fetch.mockImplementationOnce(() => createFetchResponse(mockUploadedFile));

      const formData = new FormData();
      formData.append('file', new File(['content'], 'new_file.txt'));
      formData.append('comment', 'a new file');

      const uploadedFile = await uploadFile(formData);
      expect(uploadedFile).toEqual(mockUploadedFile);
      expect(global.fetch).toHaveBeenCalledWith('/api/files/list/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${MOCK_TOKEN}`,
        },
        body: formData,
      });
    });

    it('должен выбрасывать ошибку, если загрузка файла не успешна', async () => {
      const errorMessage = 'Upload failed';
      global.fetch.mockImplementationOnce(() => createFetchResponse({
        detail: errorMessage
      }, false, 500));

      const formData = new FormData();
      await expect(uploadFile(formData)).rejects.toThrow(JSON.stringify({
        detail: errorMessage
      }));
    });
  });

 
  describe('renameFile', () => {
    it('должен успешно переименовывать файл', async () => {
      const mockRenamedFile = {
        id: 1,
        origin_name: 'renamed.txt'
      };
      global.fetch.mockImplementationOnce(() => createFetchResponse(mockRenamedFile));

      const renamedFile = await renameFile(1, 'renamed.txt');
      expect(renamedFile).toEqual(mockRenamedFile);
      expect(global.fetch).toHaveBeenCalledWith('/api/files/1/rename/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${MOCK_TOKEN}`,
        },
        body: JSON.stringify({
          origin_name: 'renamed.txt'
        }),
      });
    });

    it('должен выбрасывать ошибку, если переименование файла не успешно', async () => {
      const errorMessage = 'Failed to rename';
      global.fetch.mockImplementationOnce(() => createFetchResponse({
        detail: errorMessage
      }, false, 400));

      await expect(renameFile(1, 'invalid_name')).rejects.toThrow(JSON.stringify({
        detail: errorMessage
      }));
    });
  });

  
  describe('editComment', () => {
    it('должен успешно редактировать комментарий файла', async () => {
      const mockUpdatedFile = {
        id: 1,
        comment: 'new comment'
      };
      global.fetch.mockImplementationOnce(() => createFetchResponse(mockUpdatedFile));

      const updatedFile = await editComment(1, 'new comment');
      expect(updatedFile).toEqual(mockUpdatedFile);
      expect(global.fetch).toHaveBeenCalledWith('/api/files/1/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${MOCK_TOKEN}`,
        },
        body: JSON.stringify({
          comment: 'new comment'
        }),
      });
    });

    it('должен выбрасывать ошибку, если редактирование комментария не успешно', async () => {
      const errorMessage = 'Failed to update comment';
      global.fetch.mockImplementationOnce(() => createFetchResponse({
        detail: errorMessage
      }, false, 400));

      await expect(editComment(1, 'bad comment')).rejects.toThrow(JSON.stringify({
        detail: errorMessage
      }));
    });
  });

  
  describe('deleteFile', () => {
    it('должен успешно удалять файл', async () => {
      global.fetch.mockImplementationOnce(() => createFetchResponse({}, true, 204)); 

      await deleteFile(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/files/1/', {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${MOCK_TOKEN}`,
        },
      });
    });

    it('должен выбрасывать ошибку, если удаление файла не успешно', async () => {
      const errorMessage = 'Deletion failed';
      global.fetch.mockImplementationOnce(() => createFetchResponse({
        detail: errorMessage
      }, false, 404));

      await expect(deleteFile(999)).rejects.toThrow(JSON.stringify({
        detail: errorMessage
      }));
    });
  });

  
  describe('downloadFile', () => {
    it('должен успешно скачивать файл и инициировать скачивание', async () => {
      const mockBlobData = {
        message: 'file content'
      };
      global.fetch.mockImplementationOnce(() =>
        createFetchResponse(mockBlobData, true, 200, 'OK', {
          'Content-Disposition': `attachment; filename="test_file.txt"`,
        })
      );

      await downloadFile(1);

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/files/1/download/?return_url=${encodeURIComponent('http://localhost/')}`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${MOCK_TOKEN}`,
          },
        }
      );
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(document.createElement).toHaveBeenCalledWith('a');
      const mockAnchor = global.document.createElement.mock.results[0].value;
      expect(mockAnchor.href).toBe('blob:http://localhost:3000/1234-5678-90ab');
      expect(mockAnchor.download).toBe('test_file.txt');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalledTimes(1);
      expect(mockAnchor.remove).toHaveBeenCalledTimes(1);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost:3000/1234-5678-90ab');
      expect(window.location.href).toBe('http://localhost/'); 
    });

   
    it('должен выбрасывать ошибку, если скачивание файла не успешно', async () => {
      const errorMessage = 'Download failed';
      global.fetch.mockImplementationOnce(() => createFetchResponse({
        detail: errorMessage
      }, false, 404));

      await expect(downloadFile(999)).rejects.toThrow(JSON.stringify({
        detail: errorMessage
      }));
    });

    it('должен корректно обрабатывать filename с пробелами и спецсимволами', async () => {
      const mockBlobData = {
        message: 'file content'
      };
      global.fetch.mockImplementationOnce(() =>
        createFetchResponse(mockBlobData, true, 200, 'OK', {
          'Content-Disposition': `attachment; filename="Отчёт с пробелами и русс_именем.pdf"`,
        })
      );

      await downloadFile(1);

      const mockAnchor = global.document.createElement.mock.results[0].value;
      expect(mockAnchor.download).toBe('Отчёт с пробелами и русс_именем.pdf');
    });

    it('должен использовать filename, если имя файла в Content-Disposition не декодируется', async () => {
      const mockBlobData = {
        message: 'file content'
      };
      global.fetch.mockImplementationOnce(() =>
        createFetchResponse(mockBlobData, true, 200, 'OK', {
          'Content-Disposition': `attachment; filename="%BAD_ENCODING%"`, 
        })
      );
     
      const originalConsoleError = console.error;
      console.error = jest.fn();

      await downloadFile(1);
      expect(console.error).toHaveBeenCalledWith(
        'Ошибка декодирования имени файла:',
        expect.any(Error)
      );
      const mockAnchor = global.document.createElement.mock.results[0].value;
      expect(mockAnchor.download).toBe('downloaded_file');
      console.error = originalConsoleError; 
    });
  });


  
  describe('getSpecialLink', () => {
    it('должен успешно получать специальную ссылку', async () => {
      const mockLink = {
        special_link: 'http://127.0.0.1:8000/public/file/abcd/'
      };
      global.fetch.mockImplementationOnce(() => createFetchResponse(mockLink));

      const specialLinkData = await getSpecialLink(1);
      expect(specialLinkData).toEqual(mockLink);
      expect(global.fetch).toHaveBeenCalledWith('/api/files/1/special_link/', {
        headers: {
          Authorization: `Token ${MOCK_TOKEN}`,
        },
      });
    });

    it('должен выбрасывать ошибку, если запрос getSpecialLink не успешен', async () => {
      const errorMessage = 'Link generation failed';
      global.fetch.mockImplementationOnce(() => createFetchResponse({
        detail: errorMessage
      }, false, 500));

      await expect(getSpecialLink(1)).rejects.toThrow(JSON.stringify({
        detail: errorMessage
      }));
    });
  });
});
