import * as Yup from 'yup';

export const formSchema = Yup.array().of(
  Yup.object().shape({
    branch_id: Yup.string().required('Branch is required'),
    name: Yup.string().required('Name is required'),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .positive('Amount must be positive')
      .required('Amount is required'),
  }),
);
