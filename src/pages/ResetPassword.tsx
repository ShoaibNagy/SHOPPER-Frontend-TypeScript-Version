// pages/ResetPassword.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useSearchParams } from 'react-router-dom';
import { useResetPassword } from '@hooks/useAuth';
import { Input, Button } from '@components/ui';
import styles from './Auth.module.scss';

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token    = params.get('token') ?? '';
  const { mutate: reset, isPending } = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.card__header}>
          <h1 className={styles.card__title}>New password</h1>
          <p className={styles.card__sub}>Choose a strong password</p>
        </div>
        <form onSubmit={handleSubmit(({ password, confirm }) => reset({ token, password, confirmPassword: confirm }))}
          className={styles.form} noValidate>
          <Input label="New password" type="password" autoComplete="new-password" required fullWidth
            hint="Minimum 8 characters" error={errors.password?.message} {...register('password')} />
          <Input label="Confirm password" type="password" autoComplete="new-password" required fullWidth
            error={errors.confirm?.message} {...register('confirm')} />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
}