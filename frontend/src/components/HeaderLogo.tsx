// frontend\src\components\HeaderLogo.tsx

import { Box, Typography } from '@mui/material'
import gramota from '../assets/gramota.jpg'

function HeaderLogo() {
  return (
    <div>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <img
          src={gramota}
          alt='flying promitheus'
          style={{
            width: '180px',
            borderRadius: '12px',
            marginBottom: '12px',
          }}
        />
        <Typography
          variant='h3'
          sx={{
            color: '#ffcc00',
            fontWeight: 'bold',
            letterSpacing: 2,
          }}
        >
          Das Kapital
        </Typography>
        <Typography
          variant='h6'
          sx={{
            color: '#ffcc00',
            fontWeight: 400,
            letterSpacing: 2,
            mt: 1,
          }}
        >
          AI assistant for Karl Marx – ‘The Capital’
        </Typography>
      </Box>
    </div>
  )
}

export default HeaderLogo