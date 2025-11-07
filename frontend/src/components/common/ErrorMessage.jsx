import React from 'react';

function ErrorMessage({ message }) {

  return (

    <div className='error'>

      <strong>Ошибка:</strong> {message}

    </div>

  );

}

export default ErrorMessage;