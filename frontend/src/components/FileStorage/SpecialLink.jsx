import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { getSpecialLink } from '../services/fileService';

const SpecialLink = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [specialLink, setSpecialLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = new URLSearchParams(location.search).get('userId');

  useEffect(() => {
    fetchSpecialLink();
  }, [id]);

  const fetchSpecialLink = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getSpecialLink(id);
      setSpecialLink(data.special_link);

    } catch (error) {
      setError(error.message || 'Произошла ошибка при получении специальной ссылки.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/files?user_id=${userId}`); 
  };

  const handleCopyClick = async () => {
  
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(specialLink);
        console.log('Текст скопирован в буфер обмена');
      } catch (err) {
        console.error('Не удалось скопировать текст: ', err);
      }
    } else {
      console.error('API Clipboard не поддерживается в этом браузере');
    }
  };
  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return (
      <div className="special-link-form">
        <h2>Специальная ссылка</h2>
        <div className="error-message">{error}</div>
        <button onClick={handleBack}>Назад к файлам</button>
      </div>
    );
  }

  return (
    <div className="container">
      
      <div className="special-link-form">
        <h2>Специальная ссылка</h2>
        <div className="mb-3">
          <label htmlFor="specialLink" className="form-label">Ссылка:</label>
          <input
            type="text"
            id="specialLink"
            value={specialLink}
            readOnly
            className="form-control"
          />
          <button className="btn btn-primary mt-2" onClick={handleCopyClick} disabled={!specialLink}>Копировать ссылку</button>
        </div>
        <button className="btn btn-secondary" onClick={handleBack}>Назад</button>
      </div>
    </div>
  );
};

export default SpecialLink;
