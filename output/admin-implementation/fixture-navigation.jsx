import React from 'react';
export function usePathname() { return new URLSearchParams(location.search).get('screen') === 'detail' ? '/admin/quotes/fixture' : '/admin'; }
export function useRouter() { return { refresh() {}, replace() {}, push(href) { location.href = href.startsWith('/admin/quotes/') ? '/?screen=detail' : '/'; } }; }
export function Link({ href, children, ...props }) { const target = href.startsWith('/admin/quotes/') ? '/?screen=detail' : href === '/admin/calendar' ? '/?screen=calendar' : href.startsWith('/admin') ? '/' : href; return <a href={target} {...props}>{children}</a>; }
export default Link;
