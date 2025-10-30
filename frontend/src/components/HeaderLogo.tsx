import { Box, Typography } from '@mui/material'
import gramota from '../assets/gramota.jpg'

function HeaderLogo() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'row', md: 'row', lg: 'column' }, // side-by-side on small, stacked on lg
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 2, lg: 0 }
      }}
    >
      {/* 🖼️ Image */}
      <Box
        component='img'
        src={gramota}
        alt='flying prometheus'
        sx={{
          display: { md: 'block', lg: 'none' },
          width: { xs: 80, sm: 100, md: 120, lg: 180 },
          borderRadius: '12px',
          mb: { lg: 2 }, // only add bottom margin on stacked layout
        }}
      />

      {/* 📜 Title block */}
      <Box
        sx={{
          bgcolor: { xs: 'transparent', lg: 'rgba(0, 0, 0, 0.6)' },
          p: { xs: 0, lg: 2 },
          borderRadius: 2,
          display: 'inline-block',
          textAlign: { xs: 'left', lg: 'center' },
        }}
      >
        <Typography
          variant='h4'
          sx={{
            color: '#ffcc00',
            fontWeight: 'bold',
            letterSpacing: 2,
            fontSize: { xs: '1.5rem', sm: '1.8rem', lg: '2.2rem' },
          }}
        >
          Das Kapital
        </Typography>

        <Typography
          variant='subtitle1'
          sx={{
            color: '#ffcc00',
            fontWeight: 400,
            letterSpacing: 1,
            mt: { xs: 0.5, lg: 1 },
            fontSize: { xs: '0.85rem', sm: '0.95rem', lg: '1.1rem' },
          }}
        >
          AI assistant for Karl Marx – ‘The Capital’
        </Typography>
      </Box>
    </Box>
  )
}

export default HeaderLogo
