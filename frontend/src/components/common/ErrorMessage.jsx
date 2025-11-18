import React from 'react';

function ErrorMessage({ message }) {

  return (
    <div className="alert alert-danger"  data-testid="error-message" role="alert">
      <strong>Ошибка:</strong> {message}
    </div>
  );
}

export default ErrorMessage;