// pages/Login.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Link } from 'react-router-dom';
import { useLogin } from '@hooks/useAuth';
import { Input, Button } from '@components/ui';
import { ROUTES } from '@/router/routes';
import styles from './Auth.module.scss';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { mutate: login, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.card__header}>
          <h1 className={styles.card__title}>Welcome back</h1>
          <p className={styles.card__sub}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit((v) => login(v))} className={styles.form} noValidate>
          <Input label="Email" type="email" autoComplete="email" required fullWidth
            error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" autoComplete="current-password" required fullWidth
            error={errors.password?.message} {...register('password')}
            suffixAction={<Link to={ROUTES.FORGOT_PASSWORD} className={styles.forgot_link} tabIndex={0}>Forgot?</Link>} />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
            Sign in
          </Button>
        </form>

        <p className={styles.card__footer_text}>
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}