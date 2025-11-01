import React from 'react';

// import styles from './ErrorMessage.module.css';

function ErrorMessage({ message }) {

  return (

    <div className='error'>

      <strong>Ошибка:</strong> {message}

    </div>

  );

}

export default ErrorMessage;