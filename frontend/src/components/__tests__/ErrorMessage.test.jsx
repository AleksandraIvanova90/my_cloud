
import { render, screen } from '@testing-library/react';
import ErrorMessage from '../common/ErrorMessage.jsx';


describe('ErrorMessage Component', () => {
  it('renders the error message correctly', () => {
    const message = 'This is a test error message.';
    render(<ErrorMessage message={message} />);

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent(`Ошибка: ${message}`);
    expect(alertElement).toHaveClass('alert-danger');
  });
});