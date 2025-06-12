const Card = ({
  children,
  className = '',
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`
        bg-white
        dark:bg-gray-800
        rounded-xl
        shadow-sm
        border
        border-gray-200
        dark:border-gray-700
        p-6
        transition-all
        duration-200
        ${hover ? 'hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 