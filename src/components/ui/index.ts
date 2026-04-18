// ─────────────────────────────────────────────────────────────
// components/ui/index.ts  —  barrel export
// Import like: import { Button, Modal, Spinner } from '@components/ui'
// ─────────────────────────────────────────────────────────────

export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { default as Input } from './Input';
export type { InputProps } from './Input';

export { default as Modal } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

export { default as Spinner } from './Spinner';
export type { SpinnerProps, SpinnerSize, SpinnerColor } from './Spinner';

export { default as Badge, OrderStatusBadge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';

export { default as Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';

export { default as StarRating, StarRatingDisplay, StarRatingInput } from './StarRating';
export type { StarRatingDisplayProps, StarRatingInputProps } from './StarRating';