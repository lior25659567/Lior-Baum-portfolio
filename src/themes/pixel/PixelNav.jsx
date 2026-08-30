import { Link, useLocation } from 'react-router-dom';
import homeContent from '../../data/home-content.json';
import './PixelNav.css';

/* Masthead nav. It sits in the same white band as the hero head, on the same
 * gutter and the same 11px uppercase utility tier, so the two read as one
 * block rather than a bar bolted on top of a header. */
const LINKS = [
  { to: '/', label: 'Work' },
  { to: '/playground', label: 'Playground' },
  { to: '/about', label: 'About' },
];

const PixelNav = () => {
  const { pathname } = useLocation();
  const cv = homeContent.content.hero?.cvLink;

  return (
    <nav className="pxnav" aria-label="Primary">
      <div className="pxnav-inner">
        <Link className="pxnav-mark" to="/">Lior Baum — Product Designer</Link>

        <ul className="pxnav-links">
          {LINKS.map(({ to, label }) => {
            // A case study is still "work", so keep Index marked while reading one.
            const active = to === '/'
              ? pathname === '/' || pathname.startsWith('/project/')
              : pathname === to;
            return (
              <li key={to}>
                <Link to={to} aria-current={active ? 'page' : undefined}>{label}</Link>
              </li>
            );
          })}
          {cv ? (
            <li>
              <a href={cv} target="_blank" rel="noreferrer">CV ↗</a>
            </li>
          ) : null}
        </ul>
      </div>
    </nav>
  );
};

export default PixelNav;
