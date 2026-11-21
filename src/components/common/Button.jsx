import { motion } from 'framer-motion'

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  children,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const sizeClass = size === 'sm' ? '!px-3 !py-1.5 !text-xs' : size === 'lg' ? '!px-5 !py-3' : ''

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`btn btn-${variant} ${sizeClass} ${className} ${disabled ? 'opacity-50 !cursor-not-allowed' : ''}`}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2.2} />}
      {children}
      {IconRight && <IconRight size={16} strokeWidth={2.2} />}
    </motion.button>
  )
}
