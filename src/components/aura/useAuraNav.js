import { useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useReducedMotion from '../../hooks/useReducedMotion'
import { goToAura } from './lazyBlocks'

// Returns go(id): scroll to an AURA sub-section and record #id in the URL by REPLACING the current history entry
// (so browser Back still leaves the AURA page in one step). `noScroll` stops ScrollManager from scrolling a second time.
export default function useAuraNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const reduced = useReducedMotion()
  const loc = useRef(location)
  loc.current = location
  return useCallback(id => goToAura(id, reduced, hash => {
    navigate({ pathname: '/aura', hash: `#${hash}` }, { replace: true, state: { ...(loc.current.state || {}), noScroll: true } })
  }), [navigate, reduced])
}
