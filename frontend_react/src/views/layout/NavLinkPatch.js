import React from 'react';
import { NavLink as RRNavLink } from 'react-router-dom';

/**
 * Helper wrapper to ensure .active class is applied with v6 NavLink default.
 * If you prefer, replace usage of NavLink with this component.
 */
export function NavLink(props) {
  return <RRNavLink {...props} className={({ isActive }) => ['nav-item', isActive ? 'active' : ''].join(' ').trim()} />;
}

export default NavLink;
