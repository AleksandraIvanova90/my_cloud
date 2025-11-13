import { useState } from 'react';
import { Link } from 'react-router-dom';

import ErrorMessage from '../common/ErrorMessage';


function FileActions({ file, onDelete , onDownload, userId}) {
  const [error, setError] = useState('');
   

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
      onDelete(file.id);
    }
  };

  const handleDowload = async () => {
    if (window.confirm('Вы уверены, что хотите скачать этот файл?')) {
      onDownload(file.id);    
    }
  };

  const urlEdit = `/files/${file.id}/edit?userId=${userId}`;
  const urlLink = `/files/${file.id}/special_link?userId=${userId}`;

  return (
    <div className="d-flex gap-2"> 
      {error && <ErrorMessage message={error} />}
      <Link to={urlEdit} className="btn btn-primary btn-sm"> 
        Редактировать
      </Link>
      <button className="btn btn-success btn-sm" onClick={handleDowload}> 
        Скачать
      </button>
      <Link to={urlLink} className="btn btn-info btn-sm"> 
        Поделиться
      </Link>
      <button className="btn btn-danger btn-sm" onClick={handleDelete}> 
        Удалить
      </button>
    </div>
  );

}

export default FileActions;