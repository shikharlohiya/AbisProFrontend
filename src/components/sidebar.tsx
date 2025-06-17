'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebar } from './sidebarcontext';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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
  Call as CallIcon,
  AccessTime as AccessTimeIcon,
  Note as NoteIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

// Animation variants for smooth transitions
const sidebarVariants: Variants = {
  expanded: {
    width: 224,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    }
  },
  collapsed: {
    width: 80,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    }
  }
};

const textVariants: Variants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      delay: 0.1,
    }
  },
  hidden: {
    opacity: 0,
    x: -20,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  }
};

const logoTextVariants: Variants = {
  visible: {
    opacity: 1,
    x: 0,
    maxWidth: 128,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      delay: 0.15,
    }
  },
  hidden: {
    opacity: 0,
    x: -10,
    maxWidth: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    }
  }
};

const menuItemVariants: Variants = {
  hover: {
    scale: 1.05,
    x: 4,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  }
};

const activeIndicatorVariants: Variants = {
  expanded: {
    width: 'calc(100% - 20px)',
    left: 0,
    transform: 'translateX(0)',
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    }
  },
  collapsed: {
    width: 56,
    left: '50%',
    transform: 'translateX(-50%)',
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    }
  }
};

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

  // Menu items with calls enabled and proper paths
  const menuItems: MenuItem[] = useMemo(() => [
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
      id: 'calls',
      label: 'Calls', 
      icon: CallIcon,
      path: '/calls',
      disabled: false
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
  ], [toggleSidebar]);

  const handleNavigation = useCallback((path: string): void => {
    router.push(path);
  }, [router]);

  // ENHANCED: Better active route detection
  const isActiveRoute = useCallback((path: string | null): boolean => {
    if (!path) return false;
    return pathname === path;
  }, [pathname]);

  const handleMenuClick = useCallback((item: MenuItem): void => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      handleNavigation(item.path);
    }
  }, [handleNavigation]);

  const handleMouseEnter = useCallback((): void => {
    setIsHovered(true);
    if (!autoExpandDisabled && isCollapsed) {
      toggleSidebar();
    }
  }, [autoExpandDisabled, isCollapsed, toggleSidebar]);

  const handleMouseLeave = useCallback((): void => {
    setIsHovered(false);
    if (!autoExpandDisabled && !isCollapsed) {
      toggleSidebar();
    }
  }, [autoExpandDisabled, isCollapsed, toggleSidebar]);

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
    <motion.div
      variants={sidebarVariants}
      animate={displayCollapsed ? "collapsed" : "expanded"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        background: 'linear-gradient(180deg, #EE3741 67.79%, #F98087 100%)',
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1200,
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
          <motion.div
            animate={{
              scale: displayCollapsed ? 1.05 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            style={{ position: 'relative', zIndex: 20 }}
          >
            <Image 
              src="/abis.png" 
              alt="ABIS Logo" 
              width={55}
              height={80}
              style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 5px 5px rgba(0, 0, 0, 0.55)) drop-shadow(0 4px 4px rgba(0, 0, 0, 0.55))'
              }}
            />
          </motion.div>
          
          <AnimatePresence mode="wait">
            {!displayCollapsed && (
              <motion.div
                variants={logoTextVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ marginLeft: 12 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    lineHeight: 'tight',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    fontFamily: "'Al Bayan', -apple-system, BlinkMacSystemFont, sans-serif",
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  ABIS Pro
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ 
        flex: 1, 
        px: displayCollapsed ? 0 : 2.5, 
        overflow: 'hidden auto',
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
        <List sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.5,
        }}>
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
                }}
                onMouseEnter={() => setExpandedItem(item.id)}
                onMouseLeave={() => setExpandedItem(null)}
              >
                {/* ENHANCED: Active indicator with proper functionality */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      variants={activeIndicatorVariants}
                      animate={displayCollapsed ? "collapsed" : "expanded"}
                      initial={{ opacity: 0, scale: 0.8 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      style={{
                        position: 'absolute',
                        height: 56,
                        borderRadius: 12,
                        zIndex: 10,
                        background: '#8B0E18', // DARK RED RECTANGLE INDICATOR
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  variants={menuItemVariants}
                  whileHover={!displayCollapsed && !isActive ? "hover" : {}}
                  whileTap="tap"
                  style={{ width: '100%', position: 'relative', zIndex: 20 }}
                >
                  <ListItemButton
                    onClick={() => handleMenuClick(item)}
                    disabled={item.disabled && item.id !== 'collapse' && item.id !== 'dashboard' && item.id !== 'calls'}
                    // ENHANCED: Active state styling with selected prop
                    selected={isActive}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      py: 2,
                      borderRadius: 2,
                      justifyContent: displayCollapsed ? 'center' : 'flex-start',
                      '&.Mui-disabled': {
                        opacity: 0.6,
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                      // ENHANCED: Active state styling
                      '&.Mui-selected': {
                        backgroundColor: 'transparent', // Let the indicator handle the background
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
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
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          filter: isActive 
                            ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))'
                            : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                        }}
                      >
                        <item.icon sx={{ 
                          color: 'white', 
                          fontSize: '1.5rem',
                          // ENHANCED: Active state icon styling
                          opacity: isActive ? 1 : 0.9,
                          transform: isActive ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                        }} />
                      </motion.div>
                    </ListItemIcon>
                    
                    <AnimatePresence mode="wait">
                      {!displayCollapsed && (
                        <motion.div
                          variants={textVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          style={{ marginLeft: 20, flex: 1 }}
                        >
                          <ListItemText
                            primary={item.label}
                            sx={{
                              '& .MuiListItemText-primary': {
                                color: 'white',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                fontWeight: isActive ? 600 : 500,
                                letterSpacing: isActive ? 'wide' : 'normal',
                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                                fontSize: '1.0625rem',
                                lineHeight: 1.3,
                                textShadow: isActive 
                                  ? '0 1px 2px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.1)'
                                  : '0 1px 2px rgba(0, 0, 0, 0.3)',
                                // ENHANCED: Active state text styling
                                opacity: isActive ? 1 : 0.9,
                                transform: isActive ? 'translateX(2px)' : 'translateX(0)',
                                transition: 'all 0.2s ease',
                              },
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ListItemButton>
                </motion.div>
              </ListItem>
            );

            return displayCollapsed ? (
              <Tooltip
                key={item.id}
                title={item.label}
                placement="right"
                arrow
                open={isHoveredItem}
                TransitionProps={{
                  timeout: 200,
                }}
                sx={{
                  '& .MuiTooltip-tooltip': {
                    bgcolor: 'rgba(0, 0, 0, 0.85)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                    // ENHANCED: Active state tooltip styling
                    border: isActive ? '1px solid #8B0E18' : 'none',
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
    </motion.div>
  );
};

export default Sidebar;
