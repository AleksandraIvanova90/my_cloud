
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from '../FileStorage/FileUpload.jsx';
import * as fileService from '../services/fileService.js';


jest.mock('../common/ErrorMessage', () => {
  return function MockErrorMessage({ message }) {
    return <div data-testid="error-message">{message}</div>;
  };
});


jest.mock('../services/fileService', () => ({
  uploadFile: jest.fn(),
}));

describe('FileUpload Component', () => {
  const onUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with correct labels and input fields', () => {
    render(<FileUpload onUpload={onUpload} id="123" />);

    expect(screen.getByText('Загрузить файл')).toBeInTheDocument();
    expect(screen.getByLabelText('Файл:')).toBeInTheDocument();
    expect(screen.getByLabelText('Комментарий:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Загрузить' })).toBeInTheDocument();
  });

  it('displays an error message if no file is selected on submit', async () => {
    render(<FileUpload onUpload={onUpload} id="123" />);

    const uploadButton = screen.getByRole('button', { name: 'Загрузить' });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Выберите файл для загрузки.');
    });
  });

  it('calls uploadFile with the correct FormData when a file is selected', async () => {
   
    const mockFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });

    render(<FileUpload onUpload={onUpload} id="123" />);

    const fileInput = screen.getByLabelText('Файл:');
    const commentInput = screen.getByLabelText('Комментарий:');
    const uploadButton = screen.getByRole('button', { name: 'Загрузить' });

    
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.change(commentInput, { target: { value: 'Test comment' } });

   
    fireEvent.click(uploadButton);

   
    await waitFor(() => {
      expect(fileService.uploadFile).toHaveBeenCalledTimes(1);

      const formData = fileService.uploadFile.mock.calls[0][0];
      expect(formData.get('user_id')).toBe('123');
      expect(formData.get('file')).toBe(mockFile);
      expect(formData.get('comment')).toBe('Test comment');
      expect(formData.get('origin_name')).toBe('test.txt');
    });
  });

  it('calls the onUpload callback and clears the form after successful upload', async () => {
    
    fileService.uploadFile.mockResolvedValue({});
    const mockFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });

    render(<FileUpload onUpload={onUpload} id="123" />);

    const fileInput = screen.getByLabelText('Файл:');
    const commentInput = screen.getByLabelText('Комментарий:');
    const uploadButton = screen.getByRole('button', { name: 'Загрузить' });

    
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.change(commentInput, { target: { value: 'Test comment' } });

   
    fireEvent.click(uploadButton);

  
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(1);
    });

    
    expect(fileInput.value).toBe('');
    expect(commentInput.value).toBe('');
  });

  it('displays an error message if uploadFile fails', async () => {
    
    fileService.uploadFile.mockRejectedValue(new Error('Upload failed'));
    const mockFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });

    render(<FileUpload onUpload={onUpload} id="123" />);

    const fileInput = screen.getByLabelText('Файл:');
    const commentInput = screen.getByLabelText('Комментарий:');
    const uploadButton = screen.getByRole('button', { name: 'Загрузить' });

  
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    fireEvent.change(commentInput, { target: { value: 'Test comment' } });

   
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Не удалось загрузить файл.');
    });
  });
});
