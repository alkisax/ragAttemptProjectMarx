// frontend/src/layouts/DesktopLayout.tsx
import { Box, Typography } from '@mui/material'
import ChatContainer from '../components/ChatContainer'
import AccordionContextParagraphs from '../components/AccoridonContextParagraphs'
// import bgImage from '../assets/gramota.jpg'
import gramota from '../assets/Грамота.jpg'
import HeaderLogo from '../components/HeaderLogo'
import Metadata from '../components/Metadata'


const DesktopLayout = () => {
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* 1/4 metadata */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          borderRight: '1px solid #333',
          overflowY: 'auto'
        }}
      >
        <Typography variant='h6' sx={{ color: '#ffcc00', mb: 2 }}>
          <Metadata />
        </Typography>
        {/* Later replace with live summary */}
        <AccordionContextParagraphs
          message={{ id: 'meta', role: 'assistant', content: 'metadata', context: [] }}
        />
      </Box>

      {/* 1/4 chat */}
      <Box
        sx={{
          flex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRight: '1px solid #333'
        }}
      >
        <ChatContainer />
      </Box>

      {/* 1/2 image */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          backgroundImage: `url(${gramota})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'brightness(0.6)'
          }}
        >
          <Typography variant='h2' sx={{ color: '#ffcc00', fontWeight: 'bold' }}>
            <HeaderLogo />
          </Typography>
        </Box>
      </Box>
    </Box>
  )  
}
  


export default DesktopLayout
