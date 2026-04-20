// pages/Register.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Link } from 'react-router-dom';
import { useRegister } from '@hooks/useAuth';
import { Input, Button } from '@components/ui';
import { ROUTES } from '@/router/routes';
import styles from './Auth.module.scss';

const schema = z.object({
  name:     z.string().min(2, 'Name is required'),
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { mutate: register_, isPending } = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.card__header}>
          <h1 className={styles.card__title}>Create account</h1>
          <p className={styles.card__sub}>Join Shopper today</p>
        </div>

        <form onSubmit={handleSubmit(({ name, email, password }) => register_({ name, email, password }))}
          className={styles.form} noValidate>
          <Input label="Full name" autoComplete="name" required fullWidth
            error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" autoComplete="email" required fullWidth
            error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" autoComplete="new-password" required fullWidth
            hint="Minimum 8 characters" error={errors.password?.message} {...register('password')} />
          <Input label="Confirm password" type="password" autoComplete="new-password" required fullWidth
            error={errors.confirm?.message} {...register('confirm')} />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
            Create account
          </Button>
        </form>

        <p className={styles.card__footer_text}>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}