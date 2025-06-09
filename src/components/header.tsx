'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const Header: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const theme = useTheme();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);
  };

  const handleSearchFocus = (): void => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = (): void => {
    setIsSearchFocused(false);
  };

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 100,
        bgcolor: 'background.default',
        px: 3,
        transition: 'all 0.3s',
        borderBottom: 'none',
        boxShadow: 'none',
      }}
    >
      {/* Left Side - Page Title */}
      <Box>
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(90deg, #EE3741 68%, #F98087 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Inter',
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 'normal',
            margin: 0,
          }}
        >
          Overview
        </Typography>
      </Box>

      {/* Right Side - Search, Notification, Avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        
        {/* Search Bar */}
        <TextField
          value={searchValue}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          placeholder="Search for something"
          variant="outlined"
          size="small"
          sx={{
            width: 313,
            '& .MuiOutlinedInput-root': {
              height: 50,
              borderRadius: 5,
              bgcolor: 'white',
              border: isSearchFocused ? '2px solid #000000' : '2px solid transparent',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              color: '#343C6A',
              fontFamily: 'Inter',
              fontSize: '0.9375rem',
              fontWeight: 400,
              '&::placeholder': {
                color: '#A0A0A0',
                opacity: 1,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666', width: 20, height: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Notification Icon */}
        <IconButton
          sx={{
            width: 50,
            height: 50,
            transition: 'all 0.2s',
            '&:hover': {
              opacity: 0.7,
            },
          }}
        >
          <Badge
            badgeContent={3}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: 16,
                minWidth: 16,
              },
            }}
          >
            <NotificationsIcon sx={{ width: 24, height: 24, color: '#666' }} />
          </Badge>
        </IconButton>

        {/* User Avatar */}
        <IconButton
          sx={{
            width: 50,
            height: 50,
            transition: 'all 0.2s',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#343C6A',
              color: 'white',
              fontFamily: 'Inter',
              fontSize: '1.125rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            A
          </Avatar>
        </IconButton>
      </Box>
    </Box>
  );
};

export default Header;
