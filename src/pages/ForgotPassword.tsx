// pages/ForgotPassword.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '@hooks/useAuth';
import { Input, Button } from '@components/ui';
import { ROUTES } from '@/router/routes';
import styles from './Auth.module.scss';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { mutate: forgot, isPending, isSuccess } = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.card__header}>
          <h1 className={styles.card__title}>Reset password</h1>
          <p className={styles.card__sub}>We'll send you a reset link</p>
        </div>

        {isSuccess ? (
          <div className={styles.success_box}>
            <CheckIcon />
            <p>Check your email — a reset link has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit((v) => forgot(v))} className={styles.form} noValidate>
            <Input label="Email address" type="email" autoComplete="email" required fullWidth
              error={errors.email?.message} {...register('email')} />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
              Send reset link
            </Button>
          </form>
        )}

        <p className={styles.card__footer_text}>
          <Link to={ROUTES.LOGIN} className={styles.link}>← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
function CheckIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }