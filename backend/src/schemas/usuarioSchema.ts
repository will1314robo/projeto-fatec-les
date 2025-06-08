import * as Yup from 'yup';

const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/\D/g, ''); 
  if (cpf.length !== 11) return false;
  return true; 
};

const isValidCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/\D/g, ''); 
  if (cnpj.length !== 14) return false;
  return true; 
};

export const createUsuarioSchema = Yup.object().shape({
  nome: Yup.string()
    .required('O nome é obrigatório.')
    .min(3, 'O nome deve ter no mínimo 3 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),

  dataNasc: Yup.date()
    .required('A data de nascimento é obrigatória.')
    .max(new Date(), 'A data de nascimento não pode ser no futuro.')
    .typeError('A data de nascimento deve ser uma data válida.'),
  telefone: Yup.string()
    .required('O telefone é obrigatório.')
    .matches(/^\d{10,11}$/, 'O telefone deve conter apenas dígitos e ter 10 ou 11 caracteres (com DDD).')
    .min(10, 'O telefone deve ter no mínimo 10 dígitos (incluindo DDD).')
    .max(11, 'O telefone deve ter no máximo 11 dígitos (incluindo DDD).'),
  tipo: Yup.string()
    .required('O tipo de usuário (PF/PJ) é obrigatório.')
    .oneOf(['PF', 'PJ'], 'O tipo de usuário deve ser "PF" ou "PJ".'),
  perfil: Yup.string()
    .required('O perfil é obrigatório.')
    .oneOf(['Admin', 'Cliente'], 'O perfil deve ser "Admin" ou "Cliente".'),
  cnpj: Yup.string().when('tipo', {
    is: 'PJ',
    then: (schema) => schema
      .required('O CNPJ é obrigatório para pessoa jurídica.')
      .matches(/^\d{14}$/, 'O CNPJ deve ter 14 dígitos.')
      .test('is-valid-cnpj', 'CNPJ inválido.', (value) => value ? isValidCNPJ(value) : true), 
    otherwise: (schema) => schema.nullable(),
  }),
  cpf: Yup.string().when('tipo', {
    is: 'PF',
    then: (schema) => schema
      .required('O CPF é obrigatório para pessoa física.')
      .matches(/^\d{11}$/, 'O CPF deve ter 11 dígitos.')
      .test('is-valid-cpf', 'CPF inválido.', (value) => value ? isValidCPF(value) : true), 
    otherwise: (schema) => schema.nullable(),
  }),
  email: Yup.string()
    .required('O e-mail é obrigatório.')
    .email('O e-mail deve ser um endereço de e-mail válido.')
    .max(255, 'O e-mail não pode ter mais de 255 caracteres.'),
  senha: Yup.string()
    .required('A senha é obrigatória.')
    .min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

export const updateUsuarioSchema = Yup.object().shape({
  nome: Yup.string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.')
    .nullable(),
  email: Yup.string()
    .email('O e-mail deve ser um endereço de e-mail válido.')
    .max(255, 'O e-mail não pode ter mais de 255 caracteres.')
    .nullable(),
  telefone: Yup.string()
    .matches(/^\d{10,11}$/, 'O telefone deve conter apenas dígitos e ter 10 ou 11 caracteres (com DDD).')
    .min(10, 'O telefone deve ter no mínimo 10 dígitos (incluindo DDD).')
    .max(11, 'O telefone deve ter no máximo 11 dígitos (incluindo DDD).')
    .nullable(),
});

export const resetPasswordSchema = Yup.object().shape({
  cpfCnpj: Yup.string()
    .required('CPF ou CNPJ é obrigatório.')
    .matches(/^\d{11}$|^\d{14}$/, 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos.') 
    .test('is-cpf-or-cnpj-valid', 'CPF ou CNPJ inválido.', (value) => {
      if (!value) return false;
      if (value.length === 11) return isValidCPF(value); 
      if (value.length === 14) return isValidCNPJ(value); 
      return false; 
    }),
  dataNascimento: Yup.date()
    .required('A data de nascimento é obrigatória.')
    .max(new Date(), 'A data de nascimento não pode ser no futuro.')
    .typeError('A data de nascimento deve ser uma data válida.'),
  novaSenha: Yup.string()
    .required('A nova senha é obrigatória.')
    .min(8, 'A nova senha deve ter no mínimo 8 caracteres.'),
  confirmarNovaSenha: Yup.string()
    .required('A confirmação da nova senha é obrigatória.')
    .oneOf([Yup.ref('novaSenha')], 'As senhas não coincidem.')
});

export const changePasswordSchema = Yup.object().shape({
  senhaAntiga: Yup.string()
    .required('A senha antiga é obrigatória.'),
  novaSenha: Yup.string()
    .required('A nova senha é obrigatória.')
    .min(8, 'A nova senha deve ter no mínimo 8 caracteres.'),
});