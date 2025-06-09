'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebar } from './sidebarcontext';
import Image from 'next/image';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Call as PhoneIncomingIcon,
  CallMade as PhoneOutgoingIcon,
  AccessTime as AccessTimeIcon,
  Note as NoteIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

// Types
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ sx?: any }>;
  path?: string | null;
  onClick?: () => void;
  disabled: boolean;
}

const Sidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [autoExpandDisabled, setAutoExpandDisabled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      setExpandedItem(null);
    }
  }, [isCollapsed]);

  const menuItems: MenuItem[] = [
    { 
      id: 'collapse',
      label: 'Collapse', 
      icon: MenuIcon,
      onClick: () => {
        toggleSidebar();
        setAutoExpandDisabled(true);
      },
      disabled: false
    },
    { 
      id: 'dashboard',
      label: 'Dashboard', 
      icon: HomeIcon,
      path: '/dashboard',
      disabled: false
    },
    { 
      id: 'customers',
      label: 'Customers', 
      icon: PeopleIcon,
      path: null,
      disabled: true
    },
    { 
      id: 'incoming',
      label: 'Incoming Call', 
      icon: PhoneIncomingIcon,
      path: null,
      disabled: true
    },
    { 
      id: 'outgoing',
      label: 'Outgoing Call', 
      icon: PhoneOutgoingIcon,
      path: null,
      disabled: true
    },
    { 
      id: 'hours',
      label: 'Working Hours', 
      icon: AccessTimeIcon,
      path: null,
      disabled: true
    },
    { 
      id: 'remarks',
      label: 'Remarks', 
      icon: NoteIcon,
      path: null,
      disabled: true
    },
    { 
      id: 'followup',
      label: 'Follow Up Details', 
      icon: TrendingUpIcon,
      path: null,
      disabled: true
    }
  ];

  const handleNavigation = (path: string): void => {
    router.push(path);
  };

  const isActiveRoute = (path: string | null): boolean => {
    if (!path) return false;
    return pathname === path;
  };

  const handleMenuClick = (item: MenuItem): void => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      handleNavigation(item.path);
    }
  };

  const handleMouseEnter = (): void => {
    setIsHovered(true);
    if (!autoExpandDisabled && isCollapsed) {
      toggleSidebar();
    }
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
    if (!autoExpandDisabled && !isCollapsed) {
      toggleSidebar();
    }
  };

  useEffect(() => {
    if (!isCollapsed) {
      setAutoExpandDisabled(false);
    }
  }, [isCollapsed]);

  if (!mounted) {
    return null;
  }

  const displayCollapsed = isCollapsed && !isHovered;

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: 'fixed', // FIXED POSITION
        left: 0,
        top: 0,
        height: '100vh', // FULL HEIGHT
        width: displayCollapsed ? 80 : 224,
        background: 'linear-gradient(180deg, #EE3741 67.79%, #F98087 100%)',
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1200, // HIGH Z-INDEX
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          position: 'relative',
          mb: 6,
          flexShrink: 0,
          minHeight: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: displayCollapsed ? 'center' : 'flex-start',
          px: displayCollapsed ? 0 : 2.5,
          pt: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 30,
            justifyContent: displayCollapsed ? 'center' : 'flex-start',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 20 }}>
            <Image 
              src="/abis.png" 
              alt="ABIS Logo" 
              width={55}
              height={80}
              style={{
                objectFit: 'contain',
                transform: displayCollapsed ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.4s',
                filter: 'drop-shadow(0 5px 5px rgba(0, 0, 0, 0.55)) drop-shadow(0 4px 4px rgba(0, 0, 0, 0.55))'
              }}
            />
          </Box>
          
          <Typography
            variant="h5"
            sx={{
              ml: displayCollapsed ? 0 : 1.5,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              lineHeight: 'tight',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              transition: 'all 0.3s ease-out',
              maxWidth: displayCollapsed ? 0 : 128,
              opacity: displayCollapsed ? 0 : 1,
              fontFamily: "'Al Bayan', -apple-system, BlinkMacSystemFont, sans-serif",
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            ABIS Pro
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu - SCROLLABLE */}
      <Box sx={{ 
        flex: 1, 
        px: displayCollapsed ? 0 : 2.5, 
        overflow: 'auto', // ALLOW SCROLLING
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px',
        },
      }}>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {menuItems.map((item, index) => {
            const isActive = isActiveRoute(item.path ?? null);
            const isHoveredItem = expandedItem === item.id;
            const isLastItem = index === menuItems.length - 1;
            
            const menuButton = (
              <ListItem 
                key={item.id} 
                disablePadding
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: displayCollapsed ? 'center' : 'flex-start',
                  mb: isLastItem ? 0 : 2.5,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={() => setExpandedItem(item.id)}
                onMouseLeave={() => setExpandedItem(null)}
              >
                {isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      height: 56,
                      borderRadius: 3,
                      zIndex: 10,
                      transition: 'all 0.3s ease-out',
                      width: displayCollapsed ? 56 : 'calc(100% - 20px)',
                      left: displayCollapsed ? '50%' : 0,
                      transform: displayCollapsed ? 'translateX(-50%)' : 'none',
                      background: '#8B0E18',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                  />
                )}

                <ListItemButton
                  onClick={() => handleMenuClick(item)}
                  disabled={item.disabled && item.id !== 'collapse' && item.id !== 'dashboard'}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    py: 2,
                    zIndex: 20,
                    transition: 'all 0.2s ease-out',
                    borderRadius: 2,
                    justifyContent: displayCollapsed ? 'center' : 'flex-start',
                    transform: isHoveredItem && !isActive ? (displayCollapsed ? 'scale(1.05)' : 'translateX(4px)') : 'none',
                    '&.Mui-disabled': {
                      opacity: 0.6,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 10,
                        transition: 'all 0.3s ease-out',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                        filter: isActive 
                          ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))'
                          : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                      }}
                    >
                      <item.icon sx={{ color: 'white', fontSize: '1.5rem' }} />
                    </Box>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-out',
                        maxWidth: displayCollapsed ? 0 : 160,
                        opacity: displayCollapsed ? 0 : 1,
                        ml: displayCollapsed ? 0 : 2.5,
                        fontWeight: isActive ? 600 : 500,
                        letterSpacing: isActive ? 'wide' : 'normal',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                        fontSize: '1.0625rem',
                        lineHeight: 1.3,
                        textShadow: isActive 
                          ? '0 1px 2px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.1)'
                          : '0 1px 2px rgba(0, 0, 0, 0.3)',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );

            return displayCollapsed ? (
              <Tooltip
                key={item.id}
                title={item.label}
                placement="right"
                arrow
                open={isHoveredItem}
                sx={{
                  '& .MuiTooltip-tooltip': {
                    bgcolor: 'rgba(0, 0, 0, 0.85)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  },
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(0, 0, 0, 0.85)',
                  },
                }}
              >
                {menuButton}
              </Tooltip>
            ) : (
              menuButton
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
