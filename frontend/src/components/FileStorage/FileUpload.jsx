import React, {useState} from 'react';

import ErrorMessage from '../common/ErrorMessage';
import { uploadFile } from '../services/fileService';

function FileUpload({onUpload, id}) {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError('');
    if(!file) {
      setError('Выберите файл для загрузки.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('user_id', id);
      formData.append('file', file);
      formData.append('comment', comment);
      formData.append('origin_name', file.name);
      await uploadFile(formData);
      onUpload();
      setFile(null);
      setComment('');
    } catch (err) {
      setError('Не удалось загрузить файл.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <h4>Загрузить файл</h4>
      {error && <ErrorMessage message={error} />}
      <div className="mb-3">
        <label htmlFor='file' className="form-label">Файл:</label>
        <input type="file" className="form-control" id='file' onChange={handleFileChange} />
      </div>
      <div className="mb-3">
        <label htmlFor='comment' className="form-label">Комментарий:</label>
        <input type="text" className="form-control" id='comment' value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      <button type='submit' className="btn btn-primary">Загрузить</button>
    </form>
  );
}

export default FileUpload;