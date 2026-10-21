import type {ButtonHTMLAttributes} from 'react';
import { Link } from 'react-router-dom';

const variants = {
  primary: 'bg-primary text-white hover:brightness-95',
  secondary: 'bg-pale text-primary hover:brightness-95',
};

export default function Button({ children, variant = 'primary', to, className = '', disabled = false, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'secondary'; to?: string}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-button px-[18px] py-3 text-[14px] font-bold leading-[17px] transition-[filter] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`;
  if (to && !disabled) return <Link to={to} className={classes} >{children}</Link>;
  return <button type={type} disabled={disabled} className={classes} {...props}>{children}</button>;
}
