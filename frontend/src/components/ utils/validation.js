const validateLogin = (login) => {
    if (!/^[a-zA-Z][a-zA-Z0-9]{3,19}$/.test(login)) {
        return 'Логин должен содержать только латинские буквы и цифры, начинаться с буквы и быть длиной от 4 до 20 символов.';
    }
    return '';
    };

const validateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Неверный формат email.';
    }
    return '';
};

const validatePassword = (password) => {
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\\\[\\\]:;<>,.?~\\/-]).{8,}$/.test(password)) {
        return 'Пароль должен содержать не менее 8 символов, как минимум одну заглавную букву, одну цифру и один специальный символ.';
    }
    return '';
};

export {validateLogin, validateEmail, validatePassword}