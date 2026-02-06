import { motion } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import './Contact.css';

const Contact = () => {
  const words = ['How about', 'we do a', 'thing', 'or two,', 'Together'];
  
  return (
    <section className="contact" id="contact">
      <div className="contact-container">
        <div className="contact-content">
          <motion.div
            className="contact-text"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {words.map((word, index) => (
              <motion.span
                key={index}
                className={`contact-word ${index === 4 ? 'accent' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.div
            className="contact-cta-wrapper"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <AnimatedButton 
              href="mailto:lior@example.com"
              variant="primary"
              icon="→"
            >
              Get in touch
            </AnimatedButton>
            <AnimatedButton 
              href={content.hero?.cvLink || '/resume.pdf'}
              variant="outline"
              icon="↓"
            >
              Download CV
            </AnimatedButton>
          </motion.div>
        </div>
        
        <motion.div
          className="contact-decoration"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="decoration-circle" />
          <div className="decoration-ring" />
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
