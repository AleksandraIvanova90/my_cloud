import React, { useState, useEffect } from 'react'
import { getFiles, deleteFile, downloadFile} from '../services/fileService'
import FileActions from './FileActions'
import FileUpload from './FileUpload'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'

import { format } from 'date-fns';
import { ru } from 'date-fns/locale'; 


function FileList() {
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const location = useLocation(); 
    const params = new URLSearchParams(location.search); 

    const userId = params.get('user_id'); 

    const fetchFiles = async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getFiles(userId)
            setFiles(data.results)
        } catch(err) {
            setError('Не удалось загрузить список файлов.')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteFiles = async(id) => {
        try {
            await deleteFile(id)
            fetchFiles()
        } catch (err) {
            setError('Не удалось удалить файл.')
        }
        
    }
      const handleDownloadFiles = async(id) => {
        try {
            await downloadFile(id)
            navigate(`/files?user_id=${userId}`)
           
        } catch (err) {
            setError('Не удалось скачать файл.')
        }
        
    }

    useEffect(() => {
        fetchFiles()
    }, [location.search])

    if (loading) {
        return <Loading />
    }

    if (error) {
        return <ErrorMessage message={error} />
    }

    return (
        <div>
            <h2>Список файлов</h2>
            <FileUpload onUpload={fetchFiles} />
            <table>
                <thead>
                    <tr>
                        <th>Имя файла</th>
                        <th>Комментарий</th>
                        <th>Размер</th>
                        <th>Дата загрузки</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map(file => (
                        <tr key={file.id}>
                            <td>{file.origin_name}</td>
                            <td>{file.comment}</td>
                            <td>{file.size}</td>
                            <td>{format(new Date(file.upload_date), 'dd.MM.yy, HH:mm', { locale: ru })}</td>
                            <td>
                                <FileActions file={file} onDelete={handleDeleteFiles} onDownload={handleDownloadFiles} userId={userId}/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default FileList