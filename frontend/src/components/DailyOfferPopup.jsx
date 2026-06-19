import { useState, useEffect } from 'react';

export default function DailyOfferPopup() {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // 1. Show check: once per day
    const lastShown = localStorage.getItem('lastPopupDate');
    const todayStr = new Date().toDateString();

    if (lastShown !== todayStr) {
      setShow(true);
    }

    // 2. Countdown logic to midnight
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight - now;

      if (diffMs <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');

      setTimeLeft(`${hStr}:${mStr}:${sStr}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem('lastPopupDate', todayStr);
    setShow(false);
  };

  const handleClaim = () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem('lastPopupDate', todayStr);
    setShow(false);
    // Redirect to the products/shop section
    window.location.hash = 'shop';
  };

  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Close Button */}
        <button onClick={handleClose} style={styles.closeBtn} aria-label="Close popup">&times;</button>

        {/* Top Gold Accent Bar */}
        <div style={styles.accentBar}>
          TODAY'S SPECIAL OFFER
        </div>

        {/* Content Wrapper */}
        <div style={styles.content}>
          <div style={styles.imageCol}>
            <img 
              src="/her_perfume.png" 
              alt="Tom Ford Tobacco Vanille" 
              style={styles.productImg}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80' }}
            />
          </div>
          <div style={styles.infoCol}>
            <h3 style={styles.brand}>TOM FORD</h3>
            <h2 style={styles.title}>Tobacco Vanille</h2>
            <p style={styles.tagline}>"Exclusive 24-Hour Deal On Tom Ford Tobacco Vanille"</p>
            <div style={styles.discount}>
              15% OFF &bull; TODAY ONLY
            </div>
            <p style={styles.details}>Ends tonight at midnight. Claim now to secure this exclusive price.</p>
            
            {/* Ticking Countdown Timer */}
            <div style={styles.timerContainer}>
              <span style={styles.timerLabel}>Offer ends in:</span>
              <span style={styles.timerValue}>{timeLeft}</span>
            </div>

            {/* CTA Buttons */}
            <div style={styles.btnRow}>
              <button onClick={handleClaim} style={styles.claimBtn}>Claim Offer</button>
              <button onClick={handleClose} style={styles.notNowBtn}>Not Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-accent)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '750px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '18px',
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text)',
    fontSize: '2rem',
    cursor: 'pointer',
    zIndex: 10,
    lineHeight: '1',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 1,
    }
  },
  accentBar: {
    backgroundColor: 'var(--color-accent2)',
    color: '#0a0a0a',
    textAlign: 'center',
    padding: '8px 16px',
    fontFamily: 'var(--font-display)',
    fontWeight: '500',
    fontSize: '0.85rem',
    letterSpacing: '0.25em',
    borderBottom: '1px solid var(--color-accent)',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: '2.5rem',
    gap: '2.5rem',
    alignItems: 'center',
  },
  imageCol: {
    flex: '1 1 250px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImg: {
    width: '100%',
    maxHeight: '260px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))',
  },
  infoCol: {
    flex: '1.2 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  brand: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8rem',
    letterSpacing: '0.15em',
    color: 'var(--color-accent)',
    margin: 0,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-4xl)',
    color: 'var(--color-text)',
    margin: 0,
    lineHeight: '1.1',
  },
  tagline: {
    fontStyle: 'italic',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text)',
    opacity: 0.85,
    margin: 0,
  },
  discount: {
    display: 'inline-block',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 169, 110, 0.1)',
    border: '1px solid var(--color-accent)',
    color: 'var(--color-accent)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    letterSpacing: '0.1em',
  },
  details: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-muted)',
    margin: 0,
    lineHeight: '1.4',
  },
  timerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    backgroundColor: 'var(--color-surface2)',
    padding: '10px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    marginTop: '0.4rem',
  },
  timerLabel: {
    fontSize: 'var(--text-xs)',
    textTransform: 'uppercase',
    color: 'var(--color-muted)',
    letterSpacing: '0.05em',
  },
  timerValue: {
    fontFamily: 'monospace',
    fontSize: 'var(--text-lg)',
    fontWeight: '700',
    color: 'var(--color-accent)',
    letterSpacing: '0.05em',
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '0.8rem',
  },
  claimBtn: {
    backgroundColor: 'var(--color-accent)',
    color: '#0a0a0a',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '12px 24px',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    flex: 1,
    '&:hover': {
      backgroundColor: 'var(--color-accent2)',
    }
  },
  notNowBtn: {
    backgroundColor: 'transparent',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 20px',
    fontSize: 'var(--text-xs)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      color: 'var(--color-text)',
      borderColor: 'var(--color-muted)',
    }
  }
};
