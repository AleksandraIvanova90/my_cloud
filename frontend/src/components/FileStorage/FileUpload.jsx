import React, {useState} from 'react'
import { uploadFile } from '../services/fileService'
import ErrorMessage from '../common/ErrorMessage'
0 
function FileUpload({onUpload}) {
    const [file, setFile] = useState(null)
    const [comment, setComment] = useState('')
    const [error, setError] = useState('')
    const handleFileChange = (e) => {
        setFile(e.target.files[0])

    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        setError('')
        if(!file) {
            setError('Выберите файл для загрузки.')
            return
        }
        try {
            console.log(file)
            const formData = new FormData()
            formData.append('file', file)
            formData.append('comment', comment)
            formData.append('origin_name', file.name) 
            await uploadFile(formData)
            onUpload()
            setFile(null)
            setComment('')
        } catch (err) {
            setError('Не удалось загрузить файл.')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h4>Загрузить файл</h4>
            {error && <ErrorMessage message={error} />}
            <div>
                <label htmlFor='file'>Файл:</label>
                <input type="file" id='file' onChange={handleFileChange} />
            </div>
            <div>
                <label htmlFor='comment'>Комментарий:</label>
                <input type="text" id='comment' value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <button type='submit'>Загрузить</button>
        </form>
    )
}

export default FileUpload