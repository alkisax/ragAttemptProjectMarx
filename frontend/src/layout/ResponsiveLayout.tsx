// frontend\layout\ResponsiveLayout.tsx
// import { useMediaQuery, useTheme } from '@mui/material'
// import DesktopLayout from './DesktopLayout'
// import MobileLayout from './MobileLayout'

// const ResponsiveLayout = () => {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
//   return isMobile ? <MobileLayout /> : <DesktopLayout />
// }

// export default ResponsiveLayout

import { useMediaQuery, useTheme } from '@mui/material'
import DesktopLayout from './DesktopLayout'
import MobileLayout from './MobileLayout'

const ResponsiveLayout = () => {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}
export default ResponsiveLayout
