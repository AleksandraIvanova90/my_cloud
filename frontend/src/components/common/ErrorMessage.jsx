import PropTypes from 'prop-types';
import React from 'react';

function ErrorMessage({ message }) {

  return (
    <div className="alert alert-danger"  data-testid="error-message" role="alert">
      <strong>Ошибка:</strong> {message}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

export default ErrorMessage;