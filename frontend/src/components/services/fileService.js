const getFiles = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    let url = 'http://127.0.0.1:8000/api/files/list';
    if (userId) {
      url += `?user_id=${userId}`;  
    }
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось получить список файлов.');
    }
    return await response.json();

  } catch (error) {
    console.error('Ошибка при получении списка файлов:', error);
    throw error;
  }

};

const getFileData = async (id) => {   
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://127.0.0.1:8000/api/files/${id}/`, { 
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось получить данные файла.');
    }
    return await response.json();
               
  } catch (error) {
    console.error('Ошибка при получении данныч файла:', error);
    throw error;
  }
};

const uploadFile = async (formData) => {

  try {
    console.log(formData);
    const token = localStorage.getItem('token');
    const response = await fetch('http://127.0.0.1:8000/api/files/list/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось загрузить файл.');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    throw error;
  }
};

const renameFile = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://127.0.0.1:8000/api/files/${id}/rename/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ 'origin_name': data })
  
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось изменить имя файла.');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при изменении имени файла:', error);
    throw error;
  }
};

const editComment = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://127.0.0.1:8000/api/files/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ 'comment': data })
  
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось изменить комментарий.');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при изменении комментарии:', error);
    throw error;
  }
};

const deleteFile = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://127.0.0.1:8000/api/files/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось удалить файл.');
    }
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
    throw error;
  }
};


const downloadFile = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const currentUrl = encodeURIComponent(window.location.href); 
    const downloadUrl = `http://127.0.0.1:8000/api/files/${id}/download/?return_url=${currentUrl}`;

    const response = await fetch(downloadUrl, {  
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось скачать файл.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const contentDisposition = response.headers.get('Content-Disposition'); 
    
    let filename = 'downloaded_file';
    if (contentDisposition && contentDisposition.includes('filename=')) {
      const filenameMatch = contentDisposition.split('filename=')[1];
      if (filenameMatch) {
        try {
          filename = decodeURIComponent(filenameMatch.replace(/['"]/g, ''));
        } catch (error) {
          console.error('Ошибка декодирования имени файла:', error);
          filename = 'downloaded_file';
        }
      }
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('return_url');

    if (returnUrl) {
      window.location.href = decodeURIComponent(returnUrl); 
    }

  } catch (error) {
    console.error('Ошибка при скачивании файла:', error);
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('return_url');

    if (returnUrl) {
      window.location.href = decodeURIComponent(returnUrl); 
    }
    throw error;
  }
};

const getSpecialLink = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://127.0.0.1:8000/api/files/${id}/special_link/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Не удалось пполучить специальную ссылку.');
    }
    return await response.json();
               
  } catch (error) {
    console.error('Ошибка при получении специальной ссылки:', error);
    throw error;
  }
};




export {getFiles, getFileData, editComment, renameFile, uploadFile, deleteFile, downloadFile, getSpecialLink};