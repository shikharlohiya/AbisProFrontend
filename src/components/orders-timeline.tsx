'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography,
  Chip,
  Skeleton,
  Button,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon
} from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type PaginationState
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderManagement } from '@/components/OrderManagementContext';

interface OrdersTimelineEntry {
  id: string;
  orderId: string;
  orders: string;
  status: 'Closed' | 'In-Progress';
  category: 'Completed' | 'Feedback Given' | 'Complain Given' | 'Feedback+Complain';
  numItems: number;
  date: string;
  amount: string;
  remarks: string;
}

const OrdersTimeline: React.FC = () => {
  // Clean context-based state management[1]
  const { selectedOrderId, selectOrder, isOrderSelected } = useOrderManagement();
  
  const [ordersData, setOrdersData] = useState<OrdersTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Fetch orders data
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock orders data for order management[4]
        const mockData: OrdersTimelineEntry[] = [
          {
            id: '1',
            orderId: 'ORD-001',
            orders: 'Spotify Premium, Netflix Basic',
            status: 'Closed',
            category: 'Completed',
            numItems: 2,
            date: '28 Jan, 12:30 AM',
            amount: '₹2,500',
            remarks: 'Order Completed'
          },
          {
            id: '2',
            orderId: 'ORD-002',
            orders: 'Amazon Prime, Disney+ Hotstar',
            status: 'Closed',
            category: 'Feedback Given',
            numItems: 2,
            date: '25 Jan, 10:40 PM',
            amount: '₹1,200',
            remarks: 'Customer provided positive feedback on service quality and delivery speed.'
          },
          {
            id: '3',
            orderId: 'ORD-003',
            orders: 'YouTube Premium, Canva Pro',
            status: 'In-Progress',
            category: 'Complain Given',
            numItems: 2,
            date: '20 Jan, 10:40 PM',
            amount: '₹850',
            remarks: 'Customer complained about delayed activation of YouTube Premium subscription.'
          },
          {
            id: '4',
            orderId: 'ORD-004',
            orders: 'Adobe Creative Suite, Microsoft Office',
            status: 'Closed',
            category: 'Feedback+Complain',
            numItems: 2,
            date: '15 Jan, 03:29 PM',
            amount: '₹3,200',
            remarks: 'Customer appreciated Adobe service but complained about Microsoft Office license issues.'
          },
          {
            id: '5',
            orderId: 'ORD-005',
            orders: 'Grammarly Premium, Notion Pro',
            status: 'Closed',
            category: 'Completed',
            numItems: 2,
            date: '14 Jan, 10:40 PM',
            amount: '₹650',
            remarks: 'Order Completed'
          },
          {
            id: '6',
            orderId: 'ORD-006',
            orders: 'Figma Pro, Slack Premium',
            status: 'In-Progress',
            category: 'Feedback Given',
            numItems: 2,
            date: '12 Jan, 02:15 PM',
            amount: '₹1,800',
            remarks: 'Customer praised the quick setup process and user-friendly interface.'
          },
          {
            id: '7',
            orderId: 'ORD-007',
            orders: 'Zoom Pro, Dropbox Plus',
            status: 'Closed',
            category: 'Completed',
            numItems: 2,
            date: '10 Jan, 11:20 AM',
            amount: '₹950',
            remarks: 'Order Completed'
          },
          {
            id: '8',
            orderId: 'ORD-008',
            orders: 'GitHub Pro, Jira Premium',
            status: 'In-Progress',
            category: 'Feedback+Complain',
            numItems: 2,
            date: '08 Jan, 04:45 PM',
            amount: '₹2,100',
            remarks: 'Customer liked GitHub features but reported issues with Jira integration setup.'
          }
        ];
        
        setOrdersData(mockData);
      } catch (error) {
        console.error('Error fetching orders data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Closed': return { backgroundColor: '#D1FAE5', color: '#059669' };
      case 'In-Progress': return { backgroundColor: '#FED7AA', color: '#C2410C' };
      default: return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Completed': return { backgroundColor: '#E0F2FE', color: '#0369A1' };
      case 'Feedback Given': return { backgroundColor: '#F0FDF4', color: '#16A34A' };
      case 'Complain Given': return { backgroundColor: '#FEF2F2', color: '#DC2626' };
      case 'Feedback+Complain': return { backgroundColor: '#FEF3C7', color: '#D97706' };
      default: return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  // Clean context-based click handler[1]
  const handleRowClick = React.useCallback((orderId: string) => {
    console.log('🖱️ OrdersTimeline: Row clicked for orderId:', orderId);
    selectOrder(orderId);
  }, [selectOrder]);

  // Column definitions
  const columns = useMemo(() => [
    {
      accessorKey: 'orderId' as const,
      header: 'Order ID',
      cell: ({ getValue }: any) => (
        <Typography variant="body2" sx={{ 
          fontWeight: 600, 
          color: '#374151',
          fontFamily: 'monospace'
        }}>
          {getValue()}
        </Typography>
      ),
      size: 100
    },
    {
      accessorKey: 'orders' as const,
      header: 'Orders',
      cell: ({ getValue }: any) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
          {getValue()}
        </Typography>
      ),
      size: 200
    },
    {
      accessorKey: 'numItems' as const,
      header: 'No of Items',
      cell: ({ getValue }: any) => (
        <Typography variant="body2" sx={{ 
          color: '#6B7280', 
          fontFamily: 'monospace',
          textAlign: 'center'
        }}>
          {getValue()}
        </Typography>
      ),
      size: 100
    },
    {
      accessorKey: 'category' as const,
      header: 'Category',
      cell: ({ getValue }: any) => {
        const categoryStyle = getCategoryColor(getValue());
        return (
          <Chip
            label={getValue()}
            size="small"
            sx={{
              backgroundColor: categoryStyle.backgroundColor,
              color: categoryStyle.color,
              border: `1px solid ${categoryStyle.color}20`,
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          />
        );
      },
      size: 150
    },
    {
      accessorKey: 'status' as const,
      header: 'Status',
      cell: ({ getValue }: any) => {
        const statusStyle = getStatusColor(getValue());
        return (
          <Chip
            label={getValue()}
            size="small"
            sx={{
              backgroundColor: statusStyle.backgroundColor,
              color: statusStyle.color,
              border: `1px solid ${statusStyle.color}20`,
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          />
        );
      },
      size: 120
    },
    {
      accessorKey: 'date' as const,
      header: 'Date',
      cell: ({ getValue }: any) => (
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
          {getValue()}
        </Typography>
      ),
      size: 130
    },
    {
      accessorKey: 'amount' as const,
      header: 'Amount',
      cell: ({ getValue }: any) => (
        <Typography variant="body2" sx={{ 
          color: '#22C55E', 
          fontWeight: 600,
          fontFamily: 'monospace'
        }}>
          {getValue()}
        </Typography>
      ),
      size: 100
    }
  ], []);

  // Table instance
  const table = useReactTable({
    data: ordersData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{
          bgcolor: 'white',
          borderRadius: 3,
          border: '1px solid #E5E7EB',
          p: 3,
          minHeight: 200
        }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{
        bgcolor: 'white',
        borderRadius: 3,
        border: '1px solid #E5E7EB',
        p: 3,
        minHeight: 200
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ 
            color: '#1F2937', 
            fontWeight: 600,
            fontFamily: 'Inter'
          }}>
            Orders
          </Typography>
          {selectedOrderId && (
            <motion.div
              key={selectedOrderId}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Chip
                label={`Selected: ${selectedOrderId}`}
                size="small"
                sx={{
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #3B82F6',
                  fontFamily: 'Inter',
                  fontWeight: 500
                }}
              />
            </motion.div>
          )}
        </Box>

        {/* Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} style={{ backgroundColor: '#F9FAFB' }}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#6B7280',
                        fontSize: '0.75rem',
                        fontFamily: 'Inter',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #E5E7EB'
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <AnimatePresence>
                {table.getRowModel().rows.map((row, index) => {
                  const isSelected = isOrderSelected(row.original.orderId);
                  
                  return (
                    <motion.tr
                      key={`${row.original.orderId}-${isSelected}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        backgroundColor: isSelected ? '#EFF6FF' : 'transparent'
                      }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      style={{
                        borderBottom: index === table.getRowModel().rows.length - 1 ? 'none' : '1px solid #F3F4F6',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        userSelect: 'none'
                      }}
                      onClick={() => handleRowClick(row.original.orderId)}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#F9FAFB';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0px)';
                        }
                      }}
                      whileHover={{ 
                        scale: !isSelected ? 1.01 : 1,
                        transition: { duration: 0.1 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          style={{
                            padding: '12px 16px',
                            verticalAlign: 'middle'
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </Box>

        {/* Pagination Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 3,
          pt: 2,
          borderTop: '1px solid #F3F4F6'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', fontFamily: 'Inter' }}>
              Rows per page:
            </Typography>
            <FormControl size="small">
              <Select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                sx={{ minWidth: 80 }}
              >
                {[5, 10, 20, 30].map(pageSize => (
                  <MenuItem key={pageSize} value={pageSize}>
                    {pageSize}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', fontFamily: 'Inter' }}>
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
                sx={{ minWidth: 40, px: 1 }}
              >
                <FirstPageIcon fontSize="small" />
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                sx={{ minWidth: 40, px: 1 }}
              >
                <ChevronLeftIcon fontSize="small" />
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                sx={{ minWidth: 40, px: 1 }}
              >
                <ChevronRightIcon fontSize="small" />
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
                sx={{ minWidth: 40, px: 1 }}
              >
                <LastPageIcon fontSize="small" />
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Recent Remarks Section */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F3F4F6' }}>
          <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
            Recent Remarks:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ordersData.slice(0, 2).map((entry) => (
              <Typography 
                key={entry.id} 
                variant="body2" 
                sx={{ 
                  color: '#6B7280', 
                  fontSize: '0.8rem',
                  fontStyle: 'italic'
                }}
              >
                • {entry.remarks}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default OrdersTimeline;
