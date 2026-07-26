import { motion } from 'framer-motion';
import { useSiteContent } from '../../context/SiteContentContext';

export function PageLoader() {
  const { gymName } = useSiteContent();

  return (
    <div className="gym-loader" role="status" aria-live="polite" aria-label={`Loading ${gymName}`}>
      <div className="gym-loader__grain" aria-hidden="true" />
      <div className="gym-loader__glow gym-loader__glow--one" aria-hidden="true" />
      <div className="gym-loader__glow gym-loader__glow--two" aria-hidden="true" />

      <motion.div
        className="gym-loader__content"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <p className="gym-loader__eyebrow">Prepare to perform</p>

        <div className="gym-loader__barbell" aria-hidden="true">
          <span className="gym-loader__collar gym-loader__collar--left" />
          <span className="gym-loader__plate gym-loader__plate--left-outer" />
          <span className="gym-loader__plate gym-loader__plate--left-inner" />
          <span className="gym-loader__bar" />
          <span className="gym-loader__grip" />
          <span className="gym-loader__plate gym-loader__plate--right-inner" />
          <span className="gym-loader__plate gym-loader__plate--right-outer" />
          <span className="gym-loader__collar gym-loader__collar--right" />
        </div>

        <h1 className="gym-loader__brand">{gymName}</h1>
        <p className="gym-loader__tagline">Commit to be fit.</p>
        <p className="gym-loader__message">Loading your next rep</p>

        <div className="gym-loader__track" aria-hidden="true">
          <span className="gym-loader__progress" />
        </div>
        <div className="gym-loader__metrics" aria-hidden="true">
          <span>Focus</span>
          <span className="gym-loader__pulse"><i /> System ready</span>
          <span>Strength</span>
        </div>
      </motion.div>

      <div className="gym-loader__count" aria-hidden="true">
        <span>01</span>
        <span>One more</span>
      </div>
    </div>
  );
}
