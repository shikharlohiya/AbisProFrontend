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
  LastPage as LastPageIcon,
  CallReceived as CallReceivedIcon,
  CallMade as CallMadeIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type PaginationState
} from '@tanstack/react-table';

interface TimelineEntry {
  id: string;
  type: 'incoming' | 'outgoing' | 'didnt_connect';
  description: string;
  orderId: string;
  category: string;
  status: 'open' | 'closed' | 'in-progress';
  date: string;
  amount: string;
  remarks: string;
}

const CallTimeline: React.FC = () => {
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Fetch timeline data
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock timeline data with new call types and INR currency
        const mockData: TimelineEntry[] = [
          {
            id: '1',
            type: 'incoming',
            description: 'Spotify Subscription',
            orderId: '#12548796',
            category: 'Shopping',
            status: 'open',
            date: '28 Jan, 12:30 AM',
            amount: '₹2,500',
            remarks: 'Customer interested in premium subscription. Follow up required.'
          },
          {
            id: '2',
            type: 'outgoing',
            description: 'Freepik Sales',
            orderId: '#12548797',
            category: 'Transfer',
            status: 'closed',
            date: '25 Jan, 10:40 PM',
            amount: '₹750',
            remarks: 'Sale completed successfully. Customer satisfied with service.'
          },
          {
            id: '3',
            type: 'didnt_connect',
            description: 'Mobile Service',
            orderId: '#12548798',
            category: 'Service',
            status: 'in-progress',
            date: '20 Jan, 10:40 PM',
            amount: '₹150',
            remarks: 'Technical support provided. Issue partially resolved.'
          },
          {
            id: '4',
            type: 'incoming',
            description: 'Wilson',
            orderId: '#12548799',
            category: 'Transfer',
            status: 'open',
            date: '15 Jan, 03:29 PM',
            amount: '₹1,050',
            remarks: 'Customer requested transfer assistance. Documentation pending.'
          },
          {
            id: '5',
            type: 'outgoing',
            description: 'Emily',
            orderId: '#12548800',
            category: 'Transfer',
            status: 'closed',
            date: '14 Jan, 10:40 PM',
            amount: '₹840',
            remarks: 'Transfer completed without issues. Customer satisfied.'
          },
          {
            id: '6',
            type: 'didnt_connect',
            description: 'Netflix Support',
            orderId: '#12548801',
            category: 'Service',
            status: 'in-progress',
            date: '12 Jan, 02:15 PM',
            amount: '₹299',
            remarks: 'Account recovery in progress. Verification steps completed.'
          },
          {
            id: '7',
            type: 'incoming',
            description: 'Amazon Prime',
            orderId: '#12548802',
            category: 'Shopping',
            status: 'closed',
            date: '10 Jan, 11:20 AM',
            amount: '₹1,200',
            remarks: 'Premium membership activated. Customer onboarded successfully.'
          },
          {
            id: '8',
            type: 'outgoing',
            description: 'Tech Consultation',
            orderId: '#12548803',
            category: 'Service',
            status: 'open',
            date: '08 Jan, 04:45 PM',
            amount: '₹500',
            remarks: 'Initial consultation completed. Proposal to be sent.'
          }
        ];
        
        setTimelineData(mockData);
      } catch (error) {
        console.error('Error fetching timeline data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []);

  // Updated helper functions with proper call icons
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': 
        return { 
          backgroundColor: '#16DBCC20', 
          color: '#16DBCC',
          borderColor: '#16DBCC'
        };
      case 'in-progress': 
        return { 
          backgroundColor: '#FC790020', 
          color: '#FC7900',
          borderColor: '#FC7900'
        };
      case 'closed': 
        return { 
          backgroundColor: '#EE374120', 
          color: '#EE3741',
          borderColor: '#EE3741'
        };
      default: 
        return { 
          backgroundColor: '#F3F4F6', 
          color: '#374151',
          borderColor: '#374151'
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incoming': 
        return (
          <CallReceivedIcon 
            sx={{ 
              fontSize: 20, 
              color: '#22C55E',
              transform: 'rotate(-45deg)' // Arrow pointing into phone
            }} 
          />
        );
      case 'outgoing': 
        return (
          <CallMadeIcon 
            sx={{ 
              fontSize: 20, 
              color: '#3B82F6',
              transform: 'rotate(45deg)' // Arrow pointing away from phone
            }} 
          />
        );
      case 'didnt_connect': 
        return (
          <PhoneIcon 
            sx={{ 
              fontSize: 20, 
              color: '#EF4444' // Red for missed/failed calls
            }} 
          />
        );
      default: 
        return (
          <PhoneIcon 
            sx={{ 
              fontSize: 20, 
              color: '#6B7280'
            }} 
          />
        );
    }
  };

  // Column definitions
  const columns = useMemo(() => [
    {
      accessorKey: 'type' as const,
      header: 'Type',
      cell: ({ getValue }: any) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: '#F9FAFB'
        }}>
          {getTypeIcon(getValue())}
        </Box>
      ),
      size: 80
    },
    {
      accessorKey: 'description' as const,
      header: 'Description',
      cell: ({ getValue }: any) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
          {getValue()}
        </Typography>
      ),
      size: 150
    },
    {
      accessorKey: 'orderId' as const,
      header: 'Order ID',
      cell: ({ getValue }: any) => (
        <Typography variant="body2" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>
          {getValue()}
        </Typography>
      ),
      size: 120
    },
    {
      accessorKey: 'category' as const,
      header: 'Category',
      cell: ({ getValue }: any) => (
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          {getValue()}
        </Typography>
      ),
      size: 100
    },
    {
      accessorKey: 'status' as const,
      header: 'Status',
      cell: ({ getValue }: any) => {
        const statusStyle = getStatusColor(getValue());
        return (
          <Chip
            label={getValue().charAt(0).toUpperCase() + getValue().slice(1).replace('-', ' ')}
            size="small"
            sx={{
              backgroundColor: statusStyle.backgroundColor,
              color: statusStyle.color,
              border: `1px solid ${statusStyle.borderColor}`,
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
    data: timelineData,
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
    );
  }

  return (
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
          Call Timeline
        </Typography>
      </Box>

      {/* TanStack Table */}
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
            {table.getRowModel().rows.map((row, index) => (
              <tr 
                key={row.id}
                style={{
                  borderBottom: index === table.getRowModel().rows.length - 1 ? 'none' : '1px solid #F3F4F6'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
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
              </tr>
            ))}
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
          {timelineData.slice(0, 2).map((entry) => (
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
  );
};

export default CallTimeline;
