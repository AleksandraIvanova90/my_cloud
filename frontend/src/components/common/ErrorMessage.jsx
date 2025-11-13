function ErrorMessage({ message }) {

  return (
    <div className="alert alert-danger" role="alert">
      <strong>Ошибка:</strong> {message}
    </div>
  );
}

export default ErrorMessage;