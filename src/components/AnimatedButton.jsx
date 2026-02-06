import { useRef } from 'react';
import './AnimatedButton.css';

const AnimatedButton = ({ 
  children, 
  href, 
  onClick, 
  variant = 'primary', 
  icon = '→',
  className = '',
  target,
  rel
}) => {
  const buttonRef = useRef(null);
  
  // Split text into characters
  const chars = children.split('');
  
  const ButtonTag = href ? 'a' : 'button';
  const props = href 
    ? { href, target, rel: rel || (target === '_blank' ? 'noopener noreferrer' : undefined) }
    : { onClick };

  return (
    <ButtonTag 
      ref={buttonRef}
      className={`animated-btn ${variant} ${className}`}
      {...props}
    >
      <span className="btn-inner">
        <span className="btn-text">
          {chars.map((char, index) => (
            <span key={index} className="char-wrapper">
              <span className="char-inner">
                {char === ' ' ? '\u00A0' : char}
                <span className="char-clone">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              </span>
            </span>
          ))}
        </span>
        {icon && (
          <span className="btn-icon-wrapper">
            <span className="btn-icon">{icon}</span>
            <span className="btn-icon btn-icon-clone">{icon}</span>
          </span>
        )}
      </span>
    </ButtonTag>
  );
};

export default AnimatedButton;

