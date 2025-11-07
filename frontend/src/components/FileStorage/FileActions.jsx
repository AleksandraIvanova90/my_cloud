import React from 'react';

import { deleteFile } from '../services/fileService'
import { Link } from 'react-router-dom';
import ErrorMessage from '../common/ErrorMessage'
import { useState } from 'react';
import FileEdit from './FileEdit';


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
    <div className='fileActions'>
         {error && <ErrorMessage message={error} />}
     <Link to={urlEdit}>
        <button>Редактировать</button>
      </Link>
      <button onClick={handleDelete}>Удалить</button>
      <button onClick={handleDowload}>Скачать</button>
      <Link to={urlLink}>
        <button >Поделиться</button>
        </Link>
    </div>
  );
}

export default FileActions;