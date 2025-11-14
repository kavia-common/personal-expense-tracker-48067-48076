import React from 'react';
import { NavLink as RRNavLink } from 'react-router-dom';

/**
 * Helper wrapper to ensure .active class is applied with v6 NavLink default.
 * Adds aria-current for better a11y on the active route.
 */
// PUBLIC_INTERFACE
export function NavLink(props) {
  /** A11y-friendly NavLink wrapper that provides .active class and aria-current */
  return (
    <RRNavLink
      {...props}
      className={({ isActive }) => ['nav-item', isActive ? 'active' : ''].join(' ').trim()}
      aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
    />
  );
}

export default NavLink;
