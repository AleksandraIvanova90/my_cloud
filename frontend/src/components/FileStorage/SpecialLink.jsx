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
            const data = await getSpecialLink(id)
            console.log(data)
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

    const handleCopyClick = () => {
        navigator.clipboard.writeText(specialLink)
            .then(() => {
                alert('Ссылка скопирована в буфер обмена!');
            })
            .catch(err => {
                console.error('Не удалось скопировать ссылку: ', err);
                setError('Не удалось скопировать ссылку: проблемы с буфером обмена.');
            });
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
        <div className="special-link-form">
            <h2>Специальная ссылка</h2>
            <div className="form-group">
                <label htmlFor="specialLink">Ссылка:</label>
                  <input
                    type="text"
                    id="specialLink"
                    value={specialLink}
                    readOnly
                    className="form-control"
                />
                 <button onClick={handleCopyClick}>Копировать ссылку</button>
            </div>
            <button onClick={handleBack}>Назад</button>
        </div>
    );
};

export default SpecialLink;
