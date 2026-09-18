import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const defaultTheme = createTheme();

export default function Authentication() {
  const navigate = useNavigate();
  const { handleLogin, handleRegister } = useAuth();

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  // 0 = Sign In, 1 = Sign Up
  const [formState, setFormState] = React.useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username || !password || (formState === 1 && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        await handleRegister(name, username, password);
        setMessage('Account created — please sign in.');
        setOpen(true);
        setFormState(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid
        container
        component="main"
        sx={{
          height: '100vh',
          overflow: 'hidden',
          // FIXED: mobile pe poore container ke background mein image
          backgroundImage: { xs: 'url("/images/signin.jpg")', sm: 'none' },
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <CssBaseline />

        {/* Mobile pe image ke upar dark overlay, taaki form readable rahe */}
        <Box
          sx={{
            display: { xs: 'block', sm: 'none' },
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 1,
          }}
        />

        {/* Desktop/tablet ke liye left image column, wahi jaisa pehle tha */}
        <Grid
          size={{ xs: 0, sm: 4, md: 7 }}
          sx={{
            display: { xs: 'none', sm: 'block' },
            backgroundImage: 'url("/images/signin.jpg")',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <Grid
          size={{ xs: 12, sm: 8, md: 5 }}
          component={Paper}
          elevation={6}
          square
          sx={{
            height: '100vh',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 2,
            // FIXED: mobile pe form panel semi-transparent taaki background image jhalke
            backgroundColor: { xs: 'rgba(255,255,255,0.92)', sm: 'background.paper' },
          }}
        >
          <Box
            sx={{
              my: { xs: 4, sm: 8 },
              mx: { xs: 2, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant={formState === 0 ? 'contained' : 'outlined'}
                onClick={() => {
                  setFormState(0);
                  setError('');
                }}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? 'contained' : 'outlined'}
                onClick={() => {
                  setFormState(1);
                  setError('');
                }}
              >
                Sign Up
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1, width: '100%', maxWidth: 400 }}
            >
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={username}
                autoFocus={formState === 0}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? 'Please wait...' : formState === 0 ? 'Sign In' : 'Sign Up'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={(event, reason) => {
          if (reason === 'clickaway') return;
          setOpen(false);
        }}
        message={message}
        sx={{
          '& .MuiSnackbarContent-root': {
            maxWidth: { xs: '90vw', sm: 400 },
          },
        }}
      />
    </ThemeProvider>
  );
}