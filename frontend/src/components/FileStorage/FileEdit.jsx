import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { getFileData, renameFile, editComment } from '../services/fileService';

const FileEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [fileName, setFileName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = new URLSearchParams(location.search).get('userId');

  const fetchFileData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFileData(id);
      setFileName(data.origin_name);
      setComment(data.comment);
    } catch(err) {
      setError('Не удалось загрузить данные файла.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileData();
  }, [id]);

  const handleSaveFileName = async () => {
    try {
      await renameFile(id, fileName);
      fetchFileData();
    } catch (err) {
      setError('Не удалось изменить имя файла.');
    }      
  };

  const handleEditComment = async () => {
    try {
      await editComment(id, comment);
      fetchFileData();
    } catch (err) {
      setError('Не удалось изменить комментарий.');
    }
  };

     
  const handleExit = () => {
    navigate(`/files?user_id=${userId}`);
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>Ошибка: {error}</p>;
  }

  return (
    <div className="container"> 
      <div className="file-edit-form">
        <h2>Редактировать файл</h2>
        {error && <ErrorMessage message={error} />}
        <div className="mb-3"> 
          <label htmlFor="fileName" className="form-label">Имя файла:</label> 
          <input
            type="text"
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="form-control" 
          />
          <button type="button" className="btn btn-primary mt-2" onClick={handleSaveFileName}>Сохранить</button> 
        </div>

        <div className="mb-3"> 
          <label htmlFor="comment" className="form-label">Комментарий:</label> 
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-control" 
          />
          <button type="button" className="btn btn-primary mt-2" onClick={handleEditComment}>Сохранить</button> 
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleExit}>
          Выйти
        </button>
      </div>
    </div>
  );
};

export default FileEdit;

